"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Copy, RefreshCw, Webhook, Key, Eye, EyeOff, Play, History, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { SessionGuard } from "@/components/dashboard/session-guard";
import WebhookLogDialog from "@/components/dashboard/webhook-log-dialog";

interface WebhookConfig {
    id: string;
    name: string;
    url: string;
    secret?: string;
    sessionId?: string;
    events: string[];
    isActive: boolean;
    createdAt: string;
}

interface WebhookLog {
    id: string;
    webhookId: string;
    event: string;
    status: string;
    requestUrl: string;
    requestHeaders?: any;
    requestBody?: any;
    responseStatusCode?: number;
    responseBody?: string;
    responseTimeMs?: number;
    errorMessage?: string;
    createdAt: string;
}

import { useTranslations } from "next-intl";
import { useSession } from "@/components/dashboard/session-provider";

interface EventDef {
    id: string;
    labelKey: "events.messageReceived" | "events.messageSent" | "events.messageStatus" | "events.connectionUpdate" | "events.groupUpdate" | "events.groupParticipant" | "events.contactUpdate" | "events.statusUpdate" | "events.messageEdited" | "events.messageDeleted";
    descKey: "events.messageReceivedDesc" | "events.messageSentDesc" | "events.messageStatusDesc" | "events.connectionUpdateDesc" | "events.groupUpdateDesc" | "events.groupParticipantDesc" | "events.contactUpdateDesc" | "events.statusUpdateDesc" | "events.messageEditedDesc" | "events.messageDeletedDesc";
}

const AVAILABLE_EVENTS: EventDef[] = [
    { id: "message.received", labelKey: "events.messageReceived", descKey: "events.messageReceivedDesc" },
    { id: "message.sent", labelKey: "events.messageSent", descKey: "events.messageSentDesc" },
    { id: "message.status", labelKey: "events.messageStatus", descKey: "events.messageStatusDesc" },
    { id: "connection.update", labelKey: "events.connectionUpdate", descKey: "events.connectionUpdateDesc" },
    { id: "group.update", labelKey: "events.groupUpdate", descKey: "events.groupUpdateDesc" },
    { id: "group.participant", labelKey: "events.groupParticipant", descKey: "events.groupParticipantDesc" },
    { id: "contact.update", labelKey: "events.contactUpdate", descKey: "events.contactUpdateDesc" },
    { id: "status.update", labelKey: "events.statusUpdate", descKey: "events.statusUpdateDesc" },
    { id: "message.edited", labelKey: "events.messageEdited", descKey: "events.messageEditedDesc" },
    { id: "message.deleted", labelKey: "events.messageDeleted", descKey: "events.messageDeletedDesc" },
];

export default function WebhooksPage() {
    const t = useTranslations("webhooks");
    const tCommon = useTranslations("common");
    const { sessionId, sessions } = useSession();
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [showApiKey, setShowApiKey] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showRegenConfirm, setShowRegenConfirm] = useState(false);

    // New webhook form
    const [showNewForm, setShowNewForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [newSecret, setNewSecret] = useState("");
    const [newEvents, setNewEvents] = useState<string[]>(["message.received", "message.sent"]);

    // Testing state
    const [testingId, setTestingId] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<Record<string, any>>({});

    // Log viewer state
    const [logDialogId, setLogDialogId] = useState<string | null>(null);
    const [logDialogName, setLogDialogName] = useState("");
    const [logDialogSessionId, setLogDialogSessionId] = useState("");

    useEffect(() => {
        if (sessions.length > 0) {
            fetchWebhooks();
        }
        fetchApiKey();
    }, [sessionId, sessions]);

    const fetchWebhooks = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/webhooks/${sessionId}`);
            if (res.ok) {
                const responseData = await res.json();
                const data = responseData?.data || [];
                const currentSession = sessions.find(s => s.sessionId === sessionId);
                const currentSessionCuid = currentSession?.id;

                const filtered = data.filter((w: WebhookConfig) =>
                    w.sessionId === sessionId ||
                    w.sessionId === currentSessionCuid ||
                    !w.sessionId
                );
                setWebhooks(filtered);
            }
        } catch (error) {
            console.error("Failed to fetch webhooks", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApiKey = async () => {
        try {
            const res = await fetch("/api/user/api-key");
            if (res.ok) {
                const data = await res.json();
                setApiKey(data?.data?.apiKey);
            }
        } catch (error) {
            console.error("Failed to fetch API key", error);
        }
    };

    const generateNewApiKey = async () => {
        try {
            const res = await fetch("/api/user/api-key", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setApiKey(data?.data?.apiKey);
                toast.success(t("toastKeyGenerated"));
            }
        } catch (error) {
            toast.error(t("toastKeyFailed"));
        }
    };

    const handleTestWebhook = async (webhook: WebhookConfig) => {
        setTestingId(webhook.id);
        setTestResults(prev => ({ ...prev, [webhook.id]: { testing: true } }));
        try {
            const targetSessionId = webhook.sessionId || sessionId;
            const res = await fetch(`/api/webhooks/${targetSessionId}/${webhook.id}/test`, { method: "POST" });
            const data = await res.json();
            setTestResults(prev => ({ ...prev, [webhook.id]: data?.data || { success: false, error: "No response" } }));
            if (data?.data?.success) {
                toast.success(t("toastTestSuccess"));
            } else {
                toast.error(t("toastTestFailed", { error: data?.data?.error || "Unknown error" }));
            }
        } catch (error: any) {
            setTestResults(prev => ({ ...prev, [webhook.id]: { success: false, error: error.message } }));
            toast.error(t("toastTestError"));
        } finally {
            setTestingId(null);
        }
    };

    const openLogDialog = (webhook: WebhookConfig) => {
        const targetSessionId = webhook.sessionId || sessionId || "";
        setLogDialogId(webhook.id);
        setLogDialogName(webhook.name);
        setLogDialogSessionId(targetSessionId);
    };

    const closeLogDialog = () => {
        setLogDialogId(null);
        setLogDialogName("");
        setLogDialogSessionId("");
    };

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editSecret, setEditSecret] = useState("");
    const [editEvents, setEditEvents] = useState<string[]>([]);

    const handleEdit = (webhook: WebhookConfig) => {
        setEditingId(webhook.id);
        setEditName(webhook.name);
        setEditUrl(webhook.url);
        setEditSecret(webhook.secret || "");
        setEditEvents(webhook.events);
        setIsEditOpen(true);
    };

    const handleSaveWebhook = async () => {
        if (!newName || !newUrl || newEvents.length === 0) {
            toast.error(t("toastRequired"));
            return;
        }
        if (!sessionId) {
            toast.error(t("toastNoSession"));
            return;
        }
        try {
            const payload: any = { name: newName, url: newUrl, events: newEvents };
            if (newSecret) payload.secret = newSecret;
            const res = await fetch(`/api/webhooks/${sessionId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast.success(t("toastCreated"));
                setShowNewForm(false);
                setNewName("");
                setNewUrl("");
                setNewSecret("");
                setNewEvents(["message.received", "message.sent"]);
                fetchWebhooks();
            } else {
                toast.error(t("toastCreateFailed"));
            }
        } catch (error) {
            toast.error(tCommon("error"));
        }
    };

    const handleUpdateWebhook = async () => {
        if (!editName || !editUrl || editEvents.length === 0) {
            toast.error(t("toastRequired"));
            return;
        }
        if (!sessionId || !editingId) return;
        try {
            const webhook = webhooks.find(w => w.id === editingId);
            const targetSessionId = webhook?.sessionId || sessionId;
            const payload: any = { name: editName, url: editUrl, events: editEvents };
            if (editSecret) payload.secret = editSecret;
            const res = await fetch(`/api/webhooks/${targetSessionId}/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast.success(t("toastUpdated"));
                setIsEditOpen(false);
                setEditingId(null);
                fetchWebhooks();
            } else {
                toast.error(t("toastUpdateFailed"));
            }
        } catch (error) {
            toast.error(tCommon("error"));
        }
    };

    const toggleWebhookActive = async (id: string, isActive: boolean) => {
        try {
            const webhook = webhooks.find(w => w.id === id);
            const targetSessionId = webhook?.sessionId || sessionId;
            await fetch(`/api/webhooks/${targetSessionId}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive })
            });
            setWebhooks(webhooks.map(w => w.id === id ? { ...w, isActive } : w));
        } catch (error) {
            toast.error(t("toastUpdateFailed"));
        }
    };

    const toggleEventForWebhook = async (webhookId: string, eventId: string) => {
        const webhook = webhooks.find(w => w.id === webhookId);
        if (!webhook) return;
        const newEvents = webhook.events.includes(eventId)
            ? webhook.events.filter(e => e !== eventId)
            : [...webhook.events, eventId];
        const targetSessionId = webhook.sessionId || sessionId;
        try {
            await fetch(`/api/webhooks/${targetSessionId}/${webhookId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ events: newEvents })
            });
            setWebhooks(webhooks.map(w => w.id === webhookId ? { ...w, events: newEvents } : w));
        } catch (error) {
            toast.error(t("toastEventsFailed"));
        }
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const deleteWebhook = async (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const webhook = webhooks.find(w => w.id === deleteId);
            const targetSessionId = webhook?.sessionId || sessionId;
            await fetch(`/api/webhooks/${targetSessionId}/${deleteId}`, { method: "DELETE" });
            setWebhooks(webhooks.filter(w => w.id !== deleteId));
            toast.success(t("toastDeleted"));
        } catch (error) {
            toast.error(t("toastDeleteFailed"));
        } finally {
            setDeleteId(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(tCommon("copied"));
    };

    // Format JSON for display
    const formatJson = (obj: any): string => {
        try {
            return JSON.stringify(obj, null, 2);
        } catch {
            return String(obj);
        }
    };

    // Format timestamp
    const formatTime = (ts: string) => {
        const d = new Date(ts);
        return d.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold">{t("title")}</h1>
            </div>

            {/* API Key Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" /> {t("apiKeyCardTitle")}
                    </CardTitle>
                    <CardDescription>
                        {t("apiKeyCardDesc")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <div className="flex-1 bg-slate-100 rounded-md p-2 sm:p-3 font-mono text-xs sm:text-sm overflow-x-auto">
                            {apiKey ? (
                                showApiKey ? apiKey : "••••••••••••••••••••••••••••••••"
                            ) : (
                                <span className="text-muted-foreground">{t("noApiKey")}</span>
                            )}
                        </div>
                        {apiKey && (
                            <>
                                <Button variant="ghost" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKey)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                        <Button onClick={() => {
                            if (apiKey) setShowRegenConfirm(true);
                            else generateNewApiKey();
                        }}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {apiKey ? t("regenerateKey") : t("generateKey")}
                        </Button>
                    </div>
                    {apiKey && (
                        <p className="text-xs text-muted-foreground mt-2">
                            {t("curlExample")}: <code className="bg-slate-100 px-1 py-0.5 rounded">curl -H "X-API-Key: {apiKey?.slice(0, 10)}..." http://your-server/api/sessions</code>
                        </p>
                    )}
                </CardContent>

                <AlertDialog open={showRegenConfirm} onOpenChange={setShowRegenConfirm}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("regenKeyTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("regenConfirmDesc")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { setShowRegenConfirm(false); generateNewApiKey(); }} className="bg-red-600 hover:bg-red-700">{t("regenerateKey")}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Card>

            {/* Webhooks Section */}
            <SessionGuard>
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Webhook className="h-5 w-5" /> {t("sectionTitle")}
                                </CardTitle>
                                <CardDescription>
                                    {t("sectionDescription")}
                                </CardDescription>
                            </div>
                            <Button onClick={() => {
                                setNewName("");
                                setNewUrl("");
                                setNewSecret("");
                                setNewEvents(["message.received", "message.sent"]);
                                setShowNewForm(!showNewForm);
                            }}>
                                <Plus className="h-4 w-4 mr-2" /> {t("addWebhook")}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {showNewForm && (
                            <Card className="border-dashed border-2">
                                <CardHeader><CardTitle>{t("addNewWebhook")}</CardTitle></CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t("nameLabel")}</Label>
                                            <Input placeholder={t("namePlaceholder")} value={newName} onChange={(e) => setNewName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t("webhookUrl")}</Label>
                                            <Input placeholder="https://example.com/webhook" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t("secretKey")}</Label>
                                        <Input placeholder={t("secretPlaceholder")} value={newSecret} onChange={(e) => setNewSecret(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t("eventsLabel")}</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {AVAILABLE_EVENTS.map(event => (
                                                <div key={event.id} className="flex items-center gap-2 p-2 rounded border">
                                                    <Switch
                                                        checked={newEvents.includes(event.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) setNewEvents([...newEvents, event.id]);
                                                            else setNewEvents(newEvents.filter(e => e !== event.id));
                                                        }}
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium">{t(event.labelKey)}</p>
                                                        <p className="text-xs text-muted-foreground">{t(event.descKey)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="ghost" onClick={() => setShowNewForm(false)}>{tCommon("cancel")}</Button>
                                        <Button onClick={handleSaveWebhook}>{t("addWebhook")}</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {loading ? (
                            <p className="text-center text-muted-foreground py-8">{tCommon("loading")}</p>
                        ) : webhooks.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                {t("empty")}
                            </p>
                        ) : (
                            webhooks.map((webhook) => {
                                const isTesting = testingId === webhook.id;
                                const testResult = testResults[webhook.id];

                                return (
                                    <Card key={webhook.id} className={webhook.isActive ? "" : "opacity-60"}>
                                        <CardContent className="pt-4 space-y-3">
                                            {/* Header */}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold flex items-center gap-2">
                                                        {webhook.name}
                                                        <Badge variant={webhook.isActive ? "default" : "secondary"}>
                                                            {webhook.isActive ? t("activeLabel") : t("inactiveLabel")}
                                                        </Badge>
                                                        {webhook.sessionId && (
                                                            <Badge variant="outline" className="text-xs">{webhook.sessionId}</Badge>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground font-mono">{webhook.url}</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Switch
                                                        checked={webhook.isActive}
                                                        onCheckedChange={(checked) => toggleWebhookActive(webhook.id, checked)}
                                                    />
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(webhook)}>{tCommon("edit")}</Button>
                                                    <Button variant="ghost" size="icon" onClick={() => deleteWebhook(webhook.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Event Toggles */}
                                            <div className="space-y-2">
                                                <Label className="text-xs">{t("eventsToggleHint")}</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {AVAILABLE_EVENTS.map(event => (
                                                        <Badge
                                                            key={event.id}
                                                            variant={webhook.events.includes(event.id) ? "default" : "outline"}
                                                            className="cursor-pointer"
                                                            onClick={() => toggleEventForWebhook(webhook.id, event.id)}
                                                        >
                                                            {t(event.labelKey)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Test & Logs Buttons */}
                                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleTestWebhook(webhook)}
                                                    disabled={isTesting}
                                                >
                                                    {isTesting ? (
                                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    ) : (
                                                        <Play className="h-4 w-4 mr-1" />
                                                    )}
                                                    {t("testButton")}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openLogDialog(webhook)}
                                                >
                                                    <History className="h-4 w-4 mr-1" />
                                                    {t("logsButton")}
                                                </Button>
                                            </div>

                                            {/* Test Result */}
                                            {testResult && !testResult.testing && (
                                                <div className={`p-3 rounded-md text-sm font-mono whitespace-pre-wrap ${
                                                    testResult.success
                                                        ? "bg-green-50 border border-green-200 text-green-800"
                                                        : "bg-red-50 border border-red-200 text-red-800"
                                                }`}>
                                                    <div className="flex items-center gap-2 mb-1 font-semibold">
                                                        {testResult.success ? `✓ ${t("testSuccess")}` : `✗ ${t("testFailed")}`}
                                                        <span className="text-xs font-normal text-muted-foreground">
                                                            {testResult.responseTimeMs}ms
                                                        </span>
                                                    </div>
                                                    {testResult.statusCode && (
                                                        <div>{t("testStatus", { status: testResult.statusCode })}</div>
                                                    )}
                                                    {testResult.error && (
                                                        <div>{t("testError", { error: testResult.error })}</div>
                                                    )}
                                                    {testResult.responseBody && (
                                                        <details className="mt-1">
                                                            <summary className="cursor-pointer text-xs">{t("testResponse")}</summary>
                                                            <pre className="mt-1 text-xs overflow-x-auto">{testResult.responseBody}</pre>
                                                        </details>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </SessionGuard>

            {/* Edit Webhook Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t("dialogEditTitle")}</DialogTitle>
                        <DialogDescription>{t("dialogEditDesc")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t("nameLabel")}</Label>
                                <Input placeholder={t("namePlaceholder")} value={editName} onChange={(e) => setEditName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("webhookUrl")}</Label>
                                <Input placeholder="https://example.com/webhook" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t("secretKey")}</Label>
                            <Input placeholder={t("secretPlaceholder")} value={editSecret} onChange={(e) => setEditSecret(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("eventsLabel")}</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {AVAILABLE_EVENTS.map(event => (
                                    <div key={event.id} className="flex items-center gap-2 p-2 rounded border">
                                        <Switch
                                            checked={editEvents.includes(event.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) setEditEvents([...editEvents, event.id]);
                                                else setEditEvents(editEvents.filter(e => e !== event.id));
                                            }}
                                        />
                                        <div>
                                            <p className="text-sm font-medium">{t(event.labelKey)}</p>
                                            <p className="text-xs text-muted-foreground">{t(event.descKey)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)}>{tCommon("cancel")}</Button>
                        <Button onClick={handleUpdateWebhook}>{tCommon("save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("deleteConfirmDesc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">{tCommon("delete")}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Webhook Log Dialog */}
            {logDialogId && (
                <WebhookLogDialog
                    webhookId={logDialogId}
                    webhookName={logDialogName}
                    targetSessionId={logDialogSessionId}
                    open={!!logDialogId}
                    onClose={closeLogDialog}
                />
            )}
        </div>
    );
}
