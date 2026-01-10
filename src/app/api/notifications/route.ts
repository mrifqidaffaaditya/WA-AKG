
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to last 50
        });
        return NextResponse.json(notifications);
    } catch (e) {
        return new Response("Error fetching notifications", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    // Only SUPERADMIN can send global notifications
    // But system might trigger it too. For now check role.
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.role !== "SUPERADMIN") {
         return new Response("Forbidden: Only Superadmin can send notifications", { status: 403 });
    }

    try {
        const { title, message, type, href, targetUserId, broadcast } = await req.json();

        if (broadcast) {
            // Send to ALL users
            const allUsers = await prisma.user.findMany({ select: { id: true } });
            const notifications = allUsers.map((u: { id: string }) => ({
                userId: u.id,
                title,
                message,
                type: type || "INFO",
                href,
                read: false
            }));
            
            await prisma.notification.createMany({ data: notifications });
            
            // Emit Socket.IO event for each user
            const io = (global as any).io;
            if (io) {
                allUsers.forEach((u: { id: string }) => {
                    io.to(`user:${u.id}`).emit('notification:new', {
                        userId: u.id,
                        title,
                        message,
                        type: type || "INFO",
                        href,
                        createdAt: new Date().toISOString(),
                        read: false
                    });
                });
            }
            
            return NextResponse.json({ success: true, count: allUsers.length });
        } else if (targetUserId) {
            // Send to specific user
            const notification = await prisma.notification.create({
                data: {
                    userId: targetUserId,
                    title,
                    message,
                    type: type || "INFO",
                    href,
                }
            });
            
            // Emit Socket.IO event
            const io = (global as any).io;
            if (io) {
                io.to(`user:${targetUserId}`).emit('notification:new', {
                    id: notification.id,
                    userId: targetUserId,
                    title,
                    message,
                    type: type || "INFO",
                    href,
                    createdAt: notification.createdAt
                });
            }
            
             return NextResponse.json({ success: true });
        }
        
        return new Response("Invalid Request: Provide targetUserId or broadcast=true", { status: 400 });

    } catch (e) {
        console.error(e);
        return new Response("Error creating notification", { status: 500 });
    }
}
