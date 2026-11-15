"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Inbox, Trash2, CheckCheck, ChevronLeft, Info, AlertTriangle, CheckCircle, Settings, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    href?: string;
    createdAt: string;
}

const TYPE_STYLES: Record<string, { icon: any; bg: string; border: string; dot: string }> = {
    INFO: { icon: Info, bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-l-blue-500", dot: "bg-blue-500" },
    WARNING: { icon: AlertTriangle, bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-l-yellow-500", dot: "bg-yellow-500" },
    SUCCESS: { icon: CheckCircle, bg: "bg-green-50 dark:bg-green-950/30", border: "border-l-green-500", dot: "bg-green-500" },
    SYSTEM: { icon: Settings, bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-l-purple-500", dot: "bg-purple-500" },
};

export default function InboxPage() {
    const t = useTranslations("notifications");
    const tCommon = useTranslations("common");
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
    const socketRef = useRef<any>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data?.data || []);
            }
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    // Real-time socket for new notifications
    useEffect(() => {
        const socketIo = (window as any).__socket;
        if (socketIo) {
            socketRef.current = socketIo;
            const handler = (n: Notification) => {
                setNotifications(prev => [n, ...prev]);
            };
            socketIo.on("notification:new", handler);
            return () => socketIo.off("notification:new", handler);
        }
    }, []);

    const markAsRead = async (id?: string) => {
        try {
            const ids = id ? [id] : [];
            const res = await fetch("/api/notifications/read", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids })
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n =>
                    id ? (n.id === id ? { ...n, read: true } : n) : { ...n, read: true }
                ));
            }
        } catch (e) {
            console.error("Failed to mark read", e);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const res = await fetch(`/api/notifications/delete?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                toast.success(t("deleted"));
            }
        } catch (e) {
            toast.error(t("toastDeleteFailed"));
        }
    };

    const handleClick = (n: Notification) => {
        if (!n.read) markAsRead(n.id);
        if (n.href) router.push(n.href);
    };

    const filtered = notifications.filter(n => {
        if (filter === "unread") return !n.read;
        if (filter === "read") return n.read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <Inbox className="h-5 w-5 sm:h-6 sm:w-6" />
                        {t("inboxTitle")}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {unreadCount > 0
                            ? t("unreadCountSummary", { count: unreadCount })
                            : t("allCaughtUp")}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> {tCommon("back")}
                </Button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {(["all", "unread", "read"] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={cn(
                            "text-xs font-medium px-3 py-1.5 rounded-full transition-colors",
                            filter === f
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        )}>
                        {f === "all" ? t("filterAll") : f === "unread" ? t("filterUnread") : t("filterRead")}
                        {f === "unread" && unreadCount > 0 && (
                            <span className="ml-1.5 text-[10px] opacity-70">({unreadCount})</span>
                        )}
                    </button>
                ))}
                {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => markAsRead()}>
                        <CheckCheck className="h-3.5 w-3.5 mr-1" /> {t("markAllRead")}
                    </Button>
                )}
            </div>

            {/* Notification list */}
            {filtered.length === 0 ? (
                <Card className="border-dashed shadow-none bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                            <Inbox className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-sm font-semibold">{t("emptyTitle")}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {filter === "all"
                                ? t("emptyAll")
                                : filter === "unread"
                                    ? t("emptyUnread")
                                    : t("emptyRead")}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {filtered.map(n => {
                        const style = TYPE_STYLES[n.type] || TYPE_STYLES.INFO;
                        const Icon = style.icon;
                        return (
                            <div key={n.id}
                                className={cn(
                                    "relative flex items-start gap-3 p-4 rounded-xl border border-border/40 transition-all cursor-pointer hover:shadow-sm group",
                                    style.border,
                                    "border-l-4",
                                    n.read ? "bg-background" : "bg-muted/20"
                                )}
                                onClick={() => handleClick(n)}
                            >
                                {/* Type icon */}
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                    n.read ? "bg-muted/50" : style.bg
                                )}>
                                    <Icon className={cn("h-4 w-4", n.read ? "text-muted-foreground" : "")} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h4 className={cn(
                                                "text-sm truncate",
                                                n.read ? "font-medium text-foreground" : "font-semibold text-foreground"
                                            )}>
                                                {n.title}
                                            </h4>
                                            <p className={cn(
                                                "text-xs mt-0.5 whitespace-normal break-words",
                                                n.read ? "text-muted-foreground" : "text-muted-foreground/80"
                                            )}>
                                                {n.message}
                                            </p>
                                        </div>
                                        {!n.read && (
                                            <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                        )}
                                    </div>

                                    {/* Footer: time + href badge */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                        </span>
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal">
                                            {n.type}
                                        </Badge>
                                        {n.href && (
                                            <span className="text-[10px] text-primary flex items-center gap-0.5 ml-auto">
                                                <ExternalLink className="h-3 w-3" /> {t("clickToView")}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions (on hover) */}
                                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!n.read && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7"
                                            onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                            title={t("markAsReadTitle")}>
                                            <CheckCheck className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive"
                                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                        title={t("deleteTitle")}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Summary */}
                    <p className="text-[10px] text-center text-muted-foreground pt-4 pb-8">
                        {t("summaryShowing", { current: filtered.length, total: notifications.length })}
                    </p>
                </div>
            )}
        </div>
    );
}
