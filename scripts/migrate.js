/**
 * WA-AKG Automated Database Migration Script
 * Automatically migrates schema, enums, and records across production/dev deployments.
 * Safe, idempotent, and handles MySQL and PostgreSQL engines.
 */

const { PrismaClient } = require("@prisma/client");
const { execSync } = require("child_process");

const prisma = new PrismaClient();

async function runAutoMigration() {
    console.log("\n==================================================");
    console.log("🚀 [WA-AKG] Running Automated Database Migrations...");
    console.log("==================================================");

    const dbUrl = process.env.DATABASE_URL || "";
    const isPostgres = dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://");

    try {
        if (!isPostgres) {
            // MySQL Migration Handler
            // Check if User table exists
            const tables = await prisma.$queryRawUnsafe(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE() AND table_name = 'User';
            `);

            if (Array.isArray(tables) && tables.length > 0) {
                // Check Role column type in MySQL
                const columns = await prisma.$queryRawUnsafe(`
                    SELECT COLUMN_NAME, COLUMN_TYPE 
                    FROM information_schema.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'User' AND COLUMN_NAME = 'role';
                `);

                if (Array.isArray(columns) && columns.length > 0) {
                    const columnType = (columns[0].COLUMN_TYPE || "").toLowerCase();

                    // If column type still contains 'owner' or does not yet include 'user'
                    if (columnType.includes("'owner'") || !columnType.includes("'user'")) {
                        console.log("📦 Detected legacy Role enum with 'OWNER'. Migrating to 'USER'...");

                        // Step 1: Temporarily expand enum to allow USER, STAFF, and legacy OWNER
                        await prisma.$executeRawUnsafe(`
                            ALTER TABLE \`User\` 
                            MODIFY COLUMN \`role\` ENUM('SUPERADMIN', 'STAFF', 'USER', 'OWNER') NOT NULL DEFAULT 'USER';
                        `);

                        // Step 2: Migrate any remaining OWNER users to USER
                        const updated = await prisma.$executeRawUnsafe(`
                            UPDATE \`User\` SET \`role\` = 'USER' WHERE \`role\` = 'OWNER';
                        `);
                        console.log(`✓ Migrated ${updated} user(s) from 'OWNER' to 'USER'.`);

                        // Step 3: Tighten enum to purely SUPERADMIN, STAFF, USER with default USER
                        await prisma.$executeRawUnsafe(`
                            ALTER TABLE \`User\` 
                            MODIFY COLUMN \`role\` ENUM('SUPERADMIN', 'STAFF', 'USER') NOT NULL DEFAULT 'USER';
                        `);
                        console.log("✓ MySQL Role enum updated to: ('SUPERADMIN', 'STAFF', 'USER').");
                    } else {
                        // Ensure default value is 'USER' and order is ('SUPERADMIN', 'STAFF', 'USER')
                        await prisma.$executeRawUnsafe(`
                            ALTER TABLE \`User\` 
                            MODIFY COLUMN \`role\` ENUM('SUPERADMIN', 'STAFF', 'USER') NOT NULL DEFAULT 'USER';
                        `);
                        console.log("✓ Role enum already up to date: ('SUPERADMIN', 'STAFF', 'USER').");
                    }
                }
            }
        } else {
            // PostgreSQL Migration Handler
            try {
                // Add USER to enum if missing
                await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'USER';`);
                const updated = await prisma.$executeRawUnsafe(`UPDATE "User" SET "role" = 'USER' WHERE "role" = 'OWNER';`);
                console.log(`✓ PostgreSQL: Migrated ${updated} user(s) from 'OWNER' to 'USER'.`);
            } catch (pgErr) {
                // PostgreSQL enum might already be migrated or table not initialized yet
            }
        }

        console.log("✓ Automated database schema migration check completed successfully.");

    } catch (error) {
        console.warn("⚠️ Warning during automated migration check:", error.message);
        // Do not crash application startup if DB is initializing or empty
    } finally {
        await prisma.$disconnect();
    }
}

// Allow direct execution: `node scripts/migrate.js`
if (require.main === module) {
    runAutoMigration()
        .then(() => {
            // If called with --sync, also push prisma schema
            if (process.argv.includes("--sync")) {
                console.log("\n📦 Syncing Prisma Schema...");
                execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
                execSync("npx prisma generate", { stdio: "inherit" });
            }
            process.exit(0);
        })
        .catch((e) => {
            console.error("❌ Migration failed:", e);
            process.exit(1);
        });
}

module.exports = { runAutoMigration };
