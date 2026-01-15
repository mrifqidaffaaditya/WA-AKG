import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/lib/auth";
import { Navbar } from "@/components/dashboard/navbar";
import { SessionProvider } from "@/components/dashboard/session-provider";
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Settings,
    LogOut,
    QrCode,
    ImageIcon,
    Webhook,
    CalendarClock,
    Bot,
    Bell
} from "lucide-react";

import { UpdateChecker } from "@/components/dashboard/update-checker";

import { prisma } from "@/lib/prisma"; // Add prisma import
import { Toaster } from "sonner"; // Assuming sonner is installed
import pkg from "../../../package.json";


export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    // @ts-ignore
    const systemConfig = await prisma.systemConfig.findUnique({ where: { id: "default" } });
    const appName = systemConfig?.appName || "WA-AKG";

    return (
        <SessionProvider>
            <UpdateChecker />
            <div className="flex h-screen bg-gray-100">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-md hidden md:flex flex-col h-full sticky left-0 top-0 z-20">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-gray-800">{appName}</h1>
                    </div>

                    <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                        <Link href="/dashboard" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </Link>
                        <Link href="/dashboard/chat" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            <MessageSquare size={20} />
                            <span>Chat</span>
                        </Link>
                        <Link href="/dashboard/groups" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            <Users size={20} />
                            <span>Groups</span>
                        </Link>
                        <Link href="/dashboard/contacts" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            <Users size={20} />
                            <span>Contacts</span>
                        </Link>
                        <Link href="/dashboard/sticker" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            <ImageIcon size={20} />
                            <span>Sticker Maker</span>
                        </Link>
                        <Link href="/dashboard/broadcast" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            <Users size={20} />
                            <span>Broadcast</span>
                        </Link>
                        <Link href="/dashboard/sessions" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            <QrCode size={20} />
                            <span>Sessions / QR</span>
                        </Link>
                        <Link href="/dashboard/bot-settings" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            <Bot size={20} />
                            <span>Bot Settings</span>
                        </Link>
                        <Link href="/dashboard/webhooks" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            <Webhook size={20} />
                            <span>Webhooks & API</span>
                        </Link>
                        <Link href="/dashboard/autoreply" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            <MessageSquare size={20} />
                            <span>Auto Reply</span>
                        </Link>
                        <Link href="/dashboard/scheduler" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            <CalendarClock size={20} />
                            <span>Scheduler</span>
                        </Link>
                        <Link href="/dashboard/users" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            <Users size={20} />
                            <span>Users</span>
                        </Link>
                        <Link href="/dashboard/settings" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                            <Settings size={20} />
                            <span>Settings</span>
                        </Link>
                        {
                            // @ts-ignore
                            session?.user?.role === "SUPERADMIN" && (
                                <Link href="/dashboard/notifications" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                                    <Bell size={20} />
                                    <span>Notification Manager</span>
                                </Link>
                            )
                        }
                    </nav>

                    <div className="p-4 border-t">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{session?.user?.name || "User"}</span>
                                <span className="text-xs text-gray-500">{session?.user?.email}</span>
                            </div>
                        </div>
                        <form action={async () => {
                            'use server';
                            await signOut();
                        }}>
                            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                                <LogOut size={16} /> Logout
                            </Button>
                        </form>
                        <div className="mt-4 text-center">
                            <span className="text-xs text-gray-400 font-mono">Version: {pkg.version}</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar appName={appName} />
                    <main className="flex-1 overflow-auto p-8 bg-gray-50">
                        {children}
                    </main>
                </div>
                <Toaster />
            </div>
        </SessionProvider>
    );
}
