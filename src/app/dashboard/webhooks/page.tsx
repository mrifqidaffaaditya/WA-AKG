"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Copy, RefreshCw, Webhook, Key, Eye, EyeOff } from "lucide-react";
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

const AVAILABLE_EVENTS = [
    { id: "message.received", label: "Message Received", description: "When a new message is received" },
    { id: "message.sent", label: "Message Sent", description: "When a message is sent" },
    { id: "message.status", label: "Message Status", description: "When message status changes (delivered, read)" },
    { id: "connection.update", label: "Connection Update", description: "When session connects/disconnects" },
    { id: "group.update", label: "Group Update", description: "When group info changes" },
    { id: "contact.update", label: "Contact Update", description: "When contact info changes" },
    { id: "status.update", label: "Status/Story", description: "When a status is posted or viewed" },
];

import { useSession } from "@/components/dashboard/session-provider";

export default function WebhooksPage() {
    const { sessionId, sessions } = useSession(); // Get active session ID and list of sessions
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [showApiKey, setShowApiKey] = useState(false);
    const [loading, setLoading] = useState(true);

    // New webhook form
    const [showNewForm, setShowNewForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [newSecret, setNewSecret] = useState("");
    const [newEvents, setNewEvents] = useState<string[]>(["message.received", "message.sent"]);

    useEffect(() => {
        if (sessions.length > 0) {
            fetchWebhooks();
        }
        fetchApiKey();
    }, [sessionId, sessions]); // Refetch when sessionId changes or sessions are loaded

    const fetchWebhooks = async () => {
        setLoading(true);
        try {
            // Ideally backend filters, but we filter here for now
            const res = await fetch("/api/webhooks");
            if (res.ok) {
                const data = await res.json();

                // Find current session to get its internal ID (CUID)
                const currentSession = sessions.find(s => s.sessionId === sessionId);
                const currentSessionCuid = currentSession?.id;

                // Filter by active session (check both String ID and CUID)
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
                setApiKey(data.apiKey);
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
                setApiKey(data.apiKey);
                toast.success("New API key generated!");
            }
        } catch (error) {
            toast.error("Failed to generate API key");
        }
    };

    const createWebhook = async () => {
        if (!newName || !newUrl || newEvents.length === 0) {
            toast.error("Name, URL, and at least one event are required");
            return;
        }

        if (!sessionId) {
            toast.error("No active session selected");
            return;
        }

        try {
            const res = await fetch("/api/webhooks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName,
                    url: newUrl,
                    secret: newSecret || null,
                    events: newEvents,
                    sessionId: sessionId // Attach active session ID
                })
            });

            if (res.ok) {
                toast.success("Webhook created!");
                setShowNewForm(false);
                setNewName("");
                setNewUrl("");
                setNewSecret("");
                setNewEvents(["message.received", "message.sent"]);
                fetchWebhooks();
            } else {
                toast.error("Failed to create webhook");
            }
        } catch (error) {
            toast.error("Failed to create webhook");
        }
    };

    const toggleWebhookActive = async (id: string, isActive: boolean) => {
        try {
            await fetch(`/api/webhooks/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive })
            });
            setWebhooks(webhooks.map(w => w.id === id ? { ...w, isActive } : w));
        } catch (error) {
            toast.error("Failed to update webhook");
        }
    };

    const toggleEventForWebhook = async (webhookId: string, eventId: string) => {
        const webhook = webhooks.find(w => w.id === webhookId);
        if (!webhook) return;

        const newEvents = webhook.events.includes(eventId)
            ? webhook.events.filter(e => e !== eventId)
            : [...webhook.events, eventId];

        try {
            await fetch(`/api/webhooks/${webhookId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ events: newEvents })
            });
            setWebhooks(webhooks.map(w => w.id === webhookId ? { ...w, events: newEvents } : w));
        } catch (error) {
            toast.error("Failed to update webhook events");
        }
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const deleteWebhook = async (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await fetch(`/api/webhooks/${deleteId}`, { method: "DELETE" });
            setWebhooks(webhooks.filter(w => w.id !== deleteId));
            toast.success("Webhook deleted");
        } catch (error) {
            toast.error("Failed to delete webhook");
        } finally {
            setDeleteId(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Webhooks & API</h1>
            </div>

            {/* API Key Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" /> API Key
                    </CardTitle>
                    <CardDescription>
                        Use this key to authenticate API requests. Include it in the X-API-Key header.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 rounded-md p-3 font-mono text-sm">
                            {apiKey ? (
                                showApiKey ? apiKey : "••••••••••••••••••••••••••••••••"
                            ) : (
                                <span className="text-muted-foreground">No API key generated</span>
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
                        <Button onClick={generateNewApiKey}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {apiKey ? "Regenerate" : "Generate"}
                        </Button>
                    </div>
                    {apiKey && (
                        <p className="text-xs text-muted-foreground mt-2">
                            Example: <code className="bg-slate-100 px-1 py-0.5 rounded">curl -H "X-API-Key: {apiKey?.slice(0, 10)}..." http://your-server/api/sessions</code>
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Webhooks Section */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Webhook className="h-5 w-5" /> Webhooks
                            </CardTitle>
                            <CardDescription>
                                Send real-time events to external URLs when activities happen in WhatsApp.
                                <br />
                                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                                    Active Session: {sessionId || "None"}
                                </span>
                            </CardDescription>
                        </div>
                        <Button onClick={() => setShowNewForm(!showNewForm)} disabled={!sessionId}>
                            <Plus className="h-4 w-4 mr-2" /> Add Webhook
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!sessionId && (
                        <div className="bg-yellow-50 p-4 border border-yellow-200 rounded text-yellow-800 text-sm">
                            Please select a session in the top bar to manage webhooks.
                        </div>
                    )}

                    {/* New Webhook Form */}
                    {showNewForm && (
                        <Card className="border-dashed border-2">
                            <CardContent className="pt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input
                                            placeholder="My Server"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Webhook URL</Label>
                                        <Input
                                            placeholder="https://example.com/webhook"
                                            value={newUrl}
                                            onChange={(e) => setNewUrl(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Secret (optional, for HMAC signature)</Label>
                                    <Input
                                        placeholder="your-secret-key"
                                        value={newSecret}
                                        onChange={(e) => setNewSecret(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Events</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {AVAILABLE_EVENTS.map(event => (
                                            <div key={event.id} className="flex items-center gap-2 p-2 rounded border">
                                                <Switch
                                                    checked={newEvents.includes(event.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setNewEvents([...newEvents, event.id]);
                                                        } else {
                                                            setNewEvents(newEvents.filter(e => e !== event.id));
                                                        }
                                                    }}
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">{event.label}</p>
                                                    <p className="text-xs text-muted-foreground">{event.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="ghost" onClick={() => setShowNewForm(false)}>Cancel</Button>
                                    <Button onClick={createWebhook}>Create Webhook</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Existing Webhooks */}
                    {loading ? (
                        <p className="text-center text-muted-foreground py-8">Loading...</p>
                    ) : webhooks.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No webhooks configured for this session. Click "Add Webhook" to create one.
                        </p>
                    ) : (
                        webhooks.map((webhook) => (
                            <Card key={webhook.id} className={webhook.isActive ? "" : "opacity-60"}>
                                <CardContent className="pt-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold flex items-center gap-2">
                                                {webhook.name}
                                                <Badge variant={webhook.isActive ? "default" : "secondary"}>
                                                    {webhook.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                                {webhook.sessionId && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {webhook.sessionId}
                                                    </Badge>
                                                )}
                                            </h3>
                                            <p className="text-sm text-muted-foreground font-mono">{webhook.url}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={webhook.isActive}
                                                onCheckedChange={(checked) => toggleWebhookActive(webhook.id, checked)}
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => deleteWebhook(webhook.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Event Toggles */}
                                    <div className="space-y-2">
                                        <Label className="text-xs">Events (click to toggle)</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {AVAILABLE_EVENTS.map(event => (
                                                <Badge
                                                    key={event.id}
                                                    variant={webhook.events.includes(event.id) ? "default" : "outline"}
                                                    className="cursor-pointer"
                                                    onClick={() => toggleEventForWebhook(webhook.id, event.id)}
                                                >
                                                    {event.label}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the webhook configuration.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
