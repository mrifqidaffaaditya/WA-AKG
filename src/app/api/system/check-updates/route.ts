import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLatestRelease } from "@/lib/github";
import { NextResponse } from "next/server";

// We'll store the last check time or version in memory or rely on Notification existence
// For simplicity, we just check if a notification with this version title exists for the user.

const REPO_OWNER = "mrifqidaffaaditya";
const REPO_NAME = "WA-AKG";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    try {
        const release = await getLatestRelease(REPO_OWNER, REPO_NAME);
        if (!release) return NextResponse.json({ success: false, message: "Could not fetch release" });

        const version = release.tag_name;
        const title = `New Update Available: ${version}`;
        
        // Check if we already notified this user about this version
        const existing = await prisma.notification.findFirst({
            where: {
                userId: session.user.id,
                title: title
            }
        });

        if (existing) {
            return NextResponse.json({ success: true, message: "Already up to date (notification exists)", version });
        }

        // Create notification
        const notification = await prisma.notification.create({
            data: {
                userId: session.user.id,
                title: title,
                message: `A new version (${version}) of ${REPO_NAME} is available! Check it out on GitHub.\n\n${release.name}`,
                type: "SYSTEM",
                href: release.html_url
            }
        });

        // Emit Socket.IO event
        const io = (global as any).io;
        if (io) {
            io.to(`user:${session.user.id}`).emit('notification:new', {
                id: notification.id,
                userId: session.user.id,
                title,
                message: notification.message,
                type: "SYSTEM",
                href: release.html_url,
                createdAt: notification.createdAt
            });
        }

        return NextResponse.json({ success: true, message: "Notification sent", version });

    } catch (e) {
        console.error(e);
        return new Response("Error checking updates", { status: 500 });
    }
}
