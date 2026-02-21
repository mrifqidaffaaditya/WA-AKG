"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronDown } from "lucide-react";
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Settings,
    QrCode,
    ImageIcon,
    Webhook,
    CalendarClock,
    Bot,
    Bell,
    FileText,
    Code,
    Send,
    UserCheck,
    Megaphone,
} from "lucide-react";

interface NavGroup {
    label: string;
    items: NavItem[];
}

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    external?: boolean;
    superadminOnly?: boolean;
}

const navGroups: NavGroup[] = [
    {
        label: "Main",
        items: [
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        ],
    },
    {
        label: "Messaging",
        items: [
            { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
            { href: "/dashboard/broadcast", label: "Broadcast", icon: Megaphone },
            { href: "/dashboard/autoreply", label: "Auto Reply", icon: Send },
            { href: "/dashboard/sticker", label: "Sticker Maker", icon: ImageIcon },
        ],
    },
    {
        label: "Contacts",
        items: [
            { href: "/dashboard/groups", label: "Groups", icon: Users },
            { href: "/dashboard/contacts", label: "Contacts", icon: UserCheck },
        ],
    },
    {
        label: "Automation",
        items: [
            { href: "/dashboard/bot-settings", label: "Bot Settings", icon: Bot },
            { href: "/dashboard/scheduler", label: "Scheduler", icon: CalendarClock },
            { href: "/dashboard/webhooks", label: "Webhooks & API", icon: Webhook },
        ],
    },
    {
        label: "Developer",
        items: [
            { href: "/docs", label: "API Docs", icon: FileText },
            { href: "/swagger", label: "Swagger UI", icon: Code, external: true },
        ],
    },
    {
        label: "Administration",
        items: [
            { href: "/dashboard/sessions", label: "Sessions / QR", icon: QrCode },
            { href: "/dashboard/users", label: "Users", icon: Users },
            { href: "/dashboard/settings", label: "Settings", icon: Settings },
            { href: "/dashboard/notifications", label: "Notifications", icon: Bell, superadminOnly: true },
        ],
    },
];

export function SidebarNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    // @ts-ignore
    const userRole = session?.user?.role;

    // Track collapsed groups — all expanded by default
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const toggleGroup = (label: string) => {
        setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-1">
            {navGroups.map((group) => {
                const visibleItems = group.items.filter(
                    (item) => !item.superadminOnly || userRole === "SUPERADMIN"
                );
                if (visibleItems.length === 0) return null;

                const isCollapsed = collapsed[group.label] ?? false;

                // "Main" group doesn't show a collapsible header
                if (group.label === "Main") {
                    return (
                        <div key={group.label} className="mb-1">
                            {visibleItems.map((item) => (
                                <NavLink
                                    key={item.href}
                                    item={item}
                                    active={isActive(item.href)}
                                />
                            ))}
                        </div>
                    );
                }

                return (
                    <div key={group.label} className="mb-2">
                        <button
                            onClick={() => toggleGroup(group.label)}
                            className="flex items-center justify-between w-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 hover:text-foreground transition-colors group"
                        >
                            {group.label}
                            <ChevronDown
                                size={14}
                                className={`transition-transform duration-300 ease-out group-hover:text-primary ${isCollapsed ? "-rotate-90" : ""}`}
                            />
                        </button>
                        {!isCollapsed && (
                            <div className="space-y-1 mt-1">
                                {visibleItems.map((item) => (
                                    <NavLink
                                        key={item.href}
                                        item={item}
                                        active={isActive(item.href)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            target={item.external ? "_blank" : undefined}
            className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-300 ease-out group relative overflow-hidden
                ${active
                    ? "text-primary bg-primary/10 shadow-sm border border-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                }
            `}
        >
            {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--color-primary),0.5)]" />
            )}
            <Icon
                size={18}
                className={`flex-shrink-0 transition-all duration-300 ${active ? "text-primary scale-110" : "text-muted-foreground/70 group-hover:text-foreground group-hover:scale-110"}`}
            />
            <span className="truncate">{item.label}</span>
        </Link>
    );
}
