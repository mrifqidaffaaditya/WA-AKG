import { prisma } from "./prisma";
import { logger } from "./logger";

/**
 * Automatically migrate database schema and enum values at runtime when WA-AKG starts.
 * Ensures zero-downtime, idempotent schema synchronization across MySQL and PostgreSQL.
 */
export async function runAutoMigration(): Promise<void> {
    try {
        const dbUrl = process.env.DATABASE_URL || "";
        const isPostgres = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

        if (!isPostgres) {
            // MySQL Migration Handler
            // Check if User table exists
            const tables: any[] = await prisma.$queryRawUnsafe(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE() AND table_name = 'User';
            `);

            if (Array.isArray(tables) && tables.length > 0) {
                // Check Role column definition
                const columns: any[] = await prisma.$queryRawUnsafe(`
                    SELECT COLUMN_NAME, COLUMN_TYPE 
                    FROM information_schema.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'User' AND COLUMN_NAME = 'role';
                `);

                if (Array.isArray(columns) && columns.length > 0) {
                    const columnType = (columns[0].COLUMN_TYPE || "").toLowerCase();

                    // If column still contains 'owner' or missing 'user'
                    if (columnType.includes("'owner'") || !columnType.includes("'user'")) {
                        logger.info("Database", "Detected legacy Role enum with 'OWNER'. Auto-migrating to 'USER'...");

                        // Step 1: Temporarily expand enum to allow USER, STAFF, and legacy OWNER
                        await prisma.$executeRawUnsafe(`
                            ALTER TABLE \`User\` 
                            MODIFY COLUMN \`role\` ENUM('SUPERADMIN', 'STAFF', 'USER', 'OWNER') NOT NULL DEFAULT 'USER';
                        `);

                        // Step 2: Migrate any existing OWNER users to USER
                        const updated = await prisma.$executeRawUnsafe(`
                            UPDATE \`User\` SET \`role\` = 'USER' WHERE \`role\` = 'OWNER';
                        `);
                        logger.success("Database", `Migrated ${updated} user(s) from 'OWNER' to 'USER'.`);

                        // Step 3: Restrict enum strictly to SUPERADMIN, STAFF, USER with default USER
                        await prisma.$executeRawUnsafe(`
                            ALTER TABLE \`User\` 
                            MODIFY COLUMN \`role\` ENUM('SUPERADMIN', 'STAFF', 'USER') NOT NULL DEFAULT 'USER';
                        `);
                        logger.success("Database", "Role enum successfully synchronized: ('SUPERADMIN', 'STAFF', 'USER').");
                    } else {
                        // Ensure default value is 'USER' and order is ('SUPERADMIN', 'STAFF', 'USER')
                        await prisma.$executeRawUnsafe(`
                            ALTER TABLE \`User\` 
                            MODIFY COLUMN \`role\` ENUM('SUPERADMIN', 'STAFF', 'USER') NOT NULL DEFAULT 'USER';
                        `);
                    }
                }
            }
        } else {
            // PostgreSQL Migration Handler
            try {
                await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'USER';`);
                const updated = await prisma.$executeRawUnsafe(`UPDATE "User" SET "role" = 'USER' WHERE "role" = 'OWNER';`);
                if (updated > 0) {
                    logger.success("Database", `PostgreSQL: Migrated ${updated} user(s) from 'OWNER' to 'USER'.`);
                }
            } catch {
                // Ignore if already migrated or table not initialized yet
            }
        }
    } catch (err: any) {
        logger.warn("Database", `Automated migration check skipped: ${err?.message || err}`);
    }
}
