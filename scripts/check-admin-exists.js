const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        if (userCount > 0) {
            // Admin or users already exist
            process.exit(0);
        } else {
            // Database is empty (no users found)
            process.exit(2);
        }
    } catch (error) {
        console.error("Database connection check failed:", error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
