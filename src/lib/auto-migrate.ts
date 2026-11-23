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

            // Ensure BroadcastLog columns exist
            try {
                const blColumns: any[] = await prisma.$queryRawUnsafe(`
                    SELECT COLUMN_NAME 
                    FROM information_schema.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'BroadcastLog';
                `);
                const blColNames = new Set((blColumns || []).map((c: any) => c.COLUMN_NAME));
                if (blColNames.has('id')) {
                    if (!blColNames.has('type')) {
                        await prisma.$executeRawUnsafe(`ALTER TABLE \`BroadcastLog\` ADD COLUMN \`type\` VARCHAR(191) NOT NULL DEFAULT 'text';`);
                    }
                    if (!blColNames.has('mediaUrl')) {
                        await prisma.$executeRawUnsafe(`ALTER TABLE \`BroadcastLog\` ADD COLUMN \`mediaUrl\` TEXT NULL;`);
                    }
                    if (!blColNames.has('mediaType')) {
                        await prisma.$executeRawUnsafe(`ALTER TABLE \`BroadcastLog\` ADD COLUMN \`mediaType\` VARCHAR(191) NULL;`);
                    }
                    if (!blColNames.has('fileName')) {
                        await prisma.$executeRawUnsafe(`ALTER TABLE \`BroadcastLog\` ADD COLUMN \`fileName\` VARCHAR(191) NULL;`);
                    }
                    if (!blColNames.has('interactiveData')) {
                        await prisma.$executeRawUnsafe(`ALTER TABLE \`BroadcastLog\` ADD COLUMN \`interactiveData\` JSON NULL;`);
                    }
                }

                // Ensure BroadcastTemplate table exists
                await prisma.$executeRawUnsafe(`
                    CREATE TABLE IF NOT EXISTS \`BroadcastTemplate\` (
                        \`id\` VARCHAR(191) NOT NULL,
                        \`userId\` VARCHAR(191) NULL,
                        \`sessionId\` VARCHAR(191) NULL,
                        \`name\` VARCHAR(191) NOT NULL,
                        \`type\` VARCHAR(191) NOT NULL DEFAULT 'text',
                        \`message\` TEXT NULL,
                        \`mediaUrl\` TEXT NULL,
                        \`mediaType\` VARCHAR(191) NULL,
                        \`fileName\` VARCHAR(191) NULL,
                        \`interactiveData\` JSON NULL,
                        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                        PRIMARY KEY (\`id\`),
                        INDEX \`BroadcastTemplate_userId_idx\` (\`userId\`),
                        INDEX \`BroadcastTemplate_sessionId_idx\` (\`sessionId\`)
                    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
                `);
            } catch (e: any) {
                logger.warn("Database", `BroadcastLog/BroadcastTemplate auto-migration check: ${e?.message || e}`);
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

            try {
                await prisma.$executeRawUnsafe(`ALTER TABLE "BroadcastLog" ADD COLUMN IF NOT EXISTS "type" VARCHAR(191) NOT NULL DEFAULT 'text';`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "BroadcastLog" ADD COLUMN IF NOT EXISTS "mediaUrl" TEXT NULL;`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "BroadcastLog" ADD COLUMN IF NOT EXISTS "mediaType" VARCHAR(191) NULL;`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "BroadcastLog" ADD COLUMN IF NOT EXISTS "fileName" VARCHAR(191) NULL;`);
                await prisma.$executeRawUnsafe(`ALTER TABLE "BroadcastLog" ADD COLUMN IF NOT EXISTS "interactiveData" JSONB NULL;`);
                await prisma.$executeRawUnsafe(`
                    CREATE TABLE IF NOT EXISTS "BroadcastTemplate" (
                        "id" VARCHAR(191) NOT NULL PRIMARY KEY,
                        "userId" VARCHAR(191) NULL,
                        "sessionId" VARCHAR(191) NULL,
                        "name" VARCHAR(191) NOT NULL,
                        "type" VARCHAR(191) NOT NULL DEFAULT 'text',
                        "message" TEXT NULL,
                        "mediaUrl" TEXT NULL,
                        "mediaType" VARCHAR(191) NULL,
                        "fileName" VARCHAR(191) NULL,
                        "interactiveData" JSONB NULL,
                        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );
                `);
            } catch {
                // Ignore
            }
        }
    } catch (err: any) {
        logger.warn("Database", `Automated migration check skipped: ${err?.message || err}`);
    }
}
