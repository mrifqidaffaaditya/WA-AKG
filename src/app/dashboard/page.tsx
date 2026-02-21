import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Plus,
    Wifi,
    WifiOff,
    MessageSquare,
    Bot,
    Send,
    Settings,
    QrCode,
    ArrowRight,
    Activity,
    Zap,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { getAccessibleSessions } from "@/lib/api-auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }

    const sessions = await getAccessibleSessions(session.user.id!, session.user.role || "OWNER");

    const totalSessions = sessions.length;
    const connectedSessions = sessions.filter(s => s.status === 'CONNECTED').length;
    const disconnectedSessions = sessions.filter(s => s.status === 'DISCONNECTED' || s.status === 'CLOSE').length;
    const otherSessions = totalSessions - connectedSessions - disconnectedSessions;

    // Fetch auto-reply count for accessible sessions
    let autoReplyCount = 0;
    try {
        const sessionIds = sessions.map(s => s.sessionId);
        if (sessionIds.length > 0) {
            autoReplyCount = await prisma.autoReply.count({
                where: { sessionId: { in: sessionIds } }
            });
        }
    } catch {
        // If auto-reply table doesn't exist yet, just show 0
    }

    const stats = [
        {
            title: "Total Sessions",
            value: totalSessions,
            icon: QrCode,
            description: "Registered sessions",
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "Connected",
            value: connectedSessions,
            icon: Wifi,
            description: "Online & ready",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            title: "Disconnected",
            value: disconnectedSessions,
            icon: WifiOff,
            description: "Needs reconnection",
            color: "text-red-500",
            bg: "bg-red-50",
        },
        {
            title: "Auto-Reply Rules",
            value: autoReplyCount,
            icon: Zap,
            description: "Active automations",
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
    ];

    const quickActions = [
        { href: "/dashboard/sessions", label: "New Session", icon: Plus, description: "Connect a new device" },
        { href: "/dashboard/chat", label: "Send Message", icon: Send, description: "Open chat interface" },
        { href: "/dashboard/bot-settings", label: "Bot Settings", icon: Bot, description: "Configure chatbot" },
        { href: "/dashboard/autoreply", label: "Auto Reply", icon: MessageSquare, description: "Manage keywords" },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                    <p className="text-sm text-slate-500 mt-1">Overview of your WhatsApp gateway</p>
                </div>
                <Link href="/dashboard/sessions">
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" /> Add Session
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="border-slate-200 shadow-none hover:shadow-sm transition-shadow">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.title}</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stat.value}</p>
                                        <p className="text-[11px] text-slate-400">{stat.description}</p>
                                    </div>
                                    <div className={`${stat.bg} p-2 rounded-lg`}>
                                        <Icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link key={action.href} href={action.href}>
                                <Card className="border-slate-200 shadow-none hover:shadow-sm hover:border-slate-300 transition-all group cursor-pointer h-full">
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-slate-900 transition-colors">
                                            <Icon className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-800 truncate">{action.label}</p>
                                            <p className="text-[11px] text-slate-400 truncate">{action.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Sessions List */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Sessions</h3>
                    <Link href="/dashboard/sessions" className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors">
                        View all <ArrowRight size={12} />
                    </Link>
                </div>

                {sessions.length === 0 ? (
                    <Card className="border-dashed border-2 border-slate-200 shadow-none">
                        <CardContent className="py-12 text-center">
                            <div className="bg-slate-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <QrCode className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-600 mb-1">No sessions yet</p>
                            <p className="text-xs text-slate-400 mb-4">Connect your first WhatsApp device to get started</p>
                            <Link href="/dashboard/sessions">
                                <Button size="sm" variant="outline" className="gap-2">
                                    <Plus className="h-4 w-4" /> Create Session
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {sessions.map(s => {
                            const isConnected = s.status === 'CONNECTED';
                            const isDisconnected = s.status === 'DISCONNECTED' || s.status === 'CLOSE';

                            return (
                                <Link key={s.id} href={`/dashboard/sessions/${s.id}`}>
                                    <Card className="border-slate-200 shadow-none hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer h-full">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-slate-800 truncate">{s.name}</p>
                                                    <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">{s.sessionId}</p>
                                                </div>
                                                <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0
                                                    ${isConnected ? 'bg-emerald-50 text-emerald-700' : isDisconnected ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}
                                                `}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : isDisconnected ? 'bg-red-400' : 'bg-amber-400'}`} />
                                                    {s.status}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
