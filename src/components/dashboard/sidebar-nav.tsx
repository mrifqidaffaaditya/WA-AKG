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
                    <div key={group.label} className="mb-1">
                        <button
                            onClick={() => toggleGroup(group.label)}
                            className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {group.label}
                            <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                            />
                        </button>
                        {!isCollapsed && (
                            <div className="space-y-0.5 mt-0.5">
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
                flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-150 group
                ${active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }
            `}
        >
            <Icon
                size={18}
                className={`flex-shrink-0 transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}
            />
            <span className="truncate">{item.label}</span>
        </Link>
    );
}
