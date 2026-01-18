"use client";


import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";
import Link from "next/link";
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
    FileText,
    Code
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import pkg from "../../../package.json";

export function MobileNav({ appName = "WA-AKG" }: { appName?: string }) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();

    const links = [
        { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
        { href: "/dashboard/chat", label: "Chat", Icon: MessageSquare },
        { href: "/dashboard/groups", label: "Groups", Icon: Users },
        { href: "/dashboard/contacts", label: "Contacts", Icon: Users },
        { href: "/dashboard/sticker", label: "Sticker Maker", Icon: ImageIcon },
        { href: "/dashboard/broadcast", label: "Broadcast", Icon: Users },
        { href: "/dashboard/sessions", label: "Sessions / QR", Icon: QrCode },
        { href: "/dashboard/bot-settings", label: "Bot Settings", Icon: Bot },
        { href: "/dashboard/webhooks", label: "Webhooks & API", Icon: Webhook },
        { href: "/dashboard/autoreply", label: "Auto Reply", Icon: MessageSquare },
        { href: "/dashboard/scheduler", label: "Scheduler", Icon: CalendarClock },
        { href: "/docs", label: "API Documentation", Icon: FileText },
        { href: "/swagger", label: "Swagger UI", Icon: Code, external: true },
        { href: "/dashboard/users", label: "Users", Icon: Users },
        { href: "/dashboard/settings", label: "Settings", Icon: Settings },
    ];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0">
                <SheetHeader className="p-6 text-left border-b">
                    <SheetTitle className="text-2xl font-bold text-gray-800">{appName}</SheetTitle>
                </SheetHeader>
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto h-[calc(100vh-5rem)]">
                    {links.map(({ href, label, Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center space-x-2 px-4 py-3 rounded-md transition-colors ${pathname === href
                                ? "bg-slate-100 text-slate-900 font-medium"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </Link>
                    ))}
                    {/* Admin Notification Link */}
                    {/* @ts-ignore */}
                    {session?.user?.role === "SUPERADMIN" && (
                        <Link
                            href="/dashboard/notifications"
                            onClick={() => setOpen(false)}
                            className={`flex items-center space-x-2 px-4 py-3 rounded-md transition-colors ${pathname === "/dashboard/notifications"
                                ? "bg-slate-100 text-slate-900 font-medium"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <Bell size={20} />
                            <span>Notification Manager</span>
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{session?.user?.name || "User"}</span>
                            <span className="text-xs text-slate-500">{session?.user?.email}</span>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={async () => {
                            setOpen(false);
                            await signOut({ callbackUrl: "/auth/login" });
                        }}
                    >
                        <LogOut size={16} /> Logout
                    </Button>
                    <div className="mt-4 text-center">
                        <span className="text-xs text-gray-400 font-mono">Version: {pkg.version}</span>
                    </div>
                </div>
            </SheetContent>
        </Sheet >
    );
}
