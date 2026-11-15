
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react"; // Use client session for Role check UI-side
import { useTranslations } from "next-intl";

export default function NotificationAdminPage() {
    // Note: Server-side protection is also needed.
    // For now assuming Layout or Middleware handles role check, or API sends 403.
    const t = useTranslations("notifications");

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("INFO");
    const [broadcast, setBroadcast] = useState(true);
    const [targetUserId, setTargetUserId] = useState("");
    const [href, setHref] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!title || !message) return toast.error(t("toastTitleMessageRequired"));
        if (!broadcast && !targetUserId) return toast.error(t("toastTargetRequired"));

        setLoading(true);
        try {
            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    message,
                    type,
                    broadcast,
                    targetUserId: broadcast ? undefined : targetUserId,
                    href
                })
            });

            if (res.ok) {
                const responseData = await res.json();
                const data = responseData?.data || {};
                toast.success(t("toastSentSuccess", { count: data.count || 1 }));
                // Reset form
                setTitle("");
                setMessage("");
                setHref("");
            } else {
                toast.error(t("toastSendFailed"));
            }
        } catch (e) {
            toast.error(t("toastSendError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2">
                    <Bell className="h-6 w-6 sm:h-8 sm:w-8" /> {t("adminTitle")}
                </h1>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("composeTitle")}</CardTitle>
                        <CardDescription>{t("composeDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t("fieldTitle")}</Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t("placeholderTitle")} />
                        </div>

                        <div className="space-y-2">
                            <Label>{t("fieldMessage")}</Label>
                            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={t("placeholderMessage")} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <Label>{t("fieldType")}</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INFO">{t("typeInfo")}</SelectItem>
                                        <SelectItem value="WARNING">{t("typeWarning")}</SelectItem>
                                        <SelectItem value="SUCCESS">{t("typeSuccess")}</SelectItem>
                                        <SelectItem value="SYSTEM">{t("typeSystem")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>{t("fieldActionLink")}</Label>
                                <Input value={href} onChange={e => setHref(e.target.value)} placeholder={t("placeholderActionLink")} />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 py-2">
                            <Switch id="broadcast" checked={broadcast} onCheckedChange={setBroadcast} />
                            <Label htmlFor="broadcast">{t("broadcastAll")}</Label>
                        </div>

                        {!broadcast && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label>{t("targetUserId")}</Label>
                                <Input value={targetUserId} onChange={e => setTargetUserId(e.target.value)} placeholder={t("placeholderTargetUserId")} />
                            </div>
                        )}

                        <div className="pt-4">
                            <Button className="w-full" onClick={handleSend} disabled={loading}>
                                {loading ? <CheckCircle2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                {t("sendButton")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-slate-50 border-dashed">
                        <CardHeader>
                            <CardTitle className="text-base text-muted-foreground">{t("previewTitle")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-white p-4 rounded-lg shadow-sm border flex gap-3 items-start">
                                <div className={`p-2 rounded-full ${type === 'WARNING' ? 'bg-yellow-100 text-yellow-600' : type === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">{title || t("previewDefaultTitle")}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{message || t("previewDefaultMessage")}</p>
                                    <p className="text-[10px] text-slate-400 mt-2">{t("justNow")}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
