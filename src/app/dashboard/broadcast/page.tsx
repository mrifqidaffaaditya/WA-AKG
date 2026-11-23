"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    RefreshCw,
    Send,
    CheckCircle2,
    XCircle,
    Radio,
    Clock,
    AlertTriangle,
    History,
    Eye,
    Calendar,
    FileText,
    Image as ImageIcon,
    Video as VideoIcon,
    Music,
    Paperclip,
    Sparkles,
    BookmarkPlus,
    Plus,
    Trash2,
    ExternalLink,
    PhoneCall,
    Copy,
    Upload,
    X
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/components/dashboard/session-provider";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { useSocket } from "@/components/chat/socket-context";
import { useTranslations } from "next-intl";

type BroadcastMessageType = "text" | "image" | "video" | "audio" | "document" | "interactive";
type ButtonType = "quick_reply" | "cta_url" | "cta_call" | "cta_copy" | "single_select";

interface InteractiveButtonItem {
    id: string;
    type: ButtonType;
    displayText: string;
    value: string;
}

interface BroadcastProgress {
    broadcastId: string;
    status: "running" | "completed";
    total: number;
    sent: number;
    failed: number;
    current?: string | null;
    progress?: number;
    errors?: { jid: string; error: string }[];
    startedAt?: string;
    completedAt?: string;
}

interface BroadcastRecipient {
    id: string;
    jid: string;
    status: string;
    error: string | null;
    sentAt: string | null;
}

interface BroadcastLog {
    id: string;
    sessionId: string;
    type?: BroadcastMessageType;
    message: string;
    mediaUrl?: string | null;
    mediaType?: string | null;
    fileName?: string | null;
    interactiveData?: any;
    total: number;
    sent: number;
    failed: number;
    status: string;
    delay: number;
    startedAt: string;
    completedAt: string | null;
    _count?: { recipients: number };
    recipients?: BroadcastRecipient[];
}

interface BroadcastTemplate {
    id: string;
    sessionId?: string | null;
    name: string;
    type: BroadcastMessageType;
    message?: string | null;
    mediaUrl?: string | null;
    mediaType?: string | null;
    fileName?: string | null;
    interactiveData?: any;
    createdAt: string;
    updatedAt: string;
}

export default function BroadcastPage() {
    const t = useTranslations("broadcast");
    const tCommon = useTranslations("common");
    const { sessionId } = useSession();

    // Tabs
    const [activeTab, setActiveTab] = useState<"new" | "templates" | "history">("new");

    // Composer Form State
    const [contacts, setContacts] = useState("");
    const [messageType, setMessageType] = useState<BroadcastMessageType>("text");
    const [message, setMessage] = useState("");
    const [mediaSourceMode, setMediaSourceMode] = useState<"upload" | "url">("upload");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [mediaUrl, setMediaUrl] = useState("");
    const [fileName, setFileName] = useState("");
    const [ptt, setPtt] = useState(false);
    const [delay, setDelay] = useState([2000]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Interactive Composer State
    const [interactiveTitle, setInteractiveTitle] = useState("");
    const [interactiveBody, setInteractiveBody] = useState("");
    const [interactiveFooter, setInteractiveFooter] = useState("");
    const [buttons, setButtons] = useState<InteractiveButtonItem[]>([
        { id: "1", type: "quick_reply", displayText: "Konfirmasi Pesanan", value: "confirm" },
        { id: "2", type: "cta_url", displayText: "Kunjungi Website", value: "https://google.com" },
    ]);

    // Live Socket Progress
    const [broadcastProgress, setBroadcastProgress] = useState<BroadcastProgress | null>(null);

    // Saved Broadcast Templates
    const [templates, setTemplates] = useState<BroadcastTemplate[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [savingTemplate, setSavingTemplate] = useState(false);

    // History
    const [history, setHistory] = useState<BroadcastLog[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<BroadcastLog | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    const { getSocket, joinSession } = useSocket();

    // Clean up file preview URL on unmount or file change
    useEffect(() => {
        if (!selectedFile) {
            setFilePreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(selectedFile);
        setFilePreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    // Socket for progress updates
    useEffect(() => {
        const socket = getSocket();
        if (!socket || !sessionId) return;

        const onConnect = () => joinSession(sessionId);
        if (socket.connected) joinSession(sessionId);
        socket.on("connect", onConnect);

        const handler = (data: BroadcastProgress) => {
            setBroadcastProgress(data);
            if (data.status === "completed") {
                setLoading(false);
                fetchHistory();
                if (data.failed === 0) {
                    toast.success(t("completeSuccess", { sent: data.sent }));
                } else {
                    toast.warning(t("completeWarning", { sent: data.sent, failed: data.failed }));
                }
            }
        };

        socket.on("broadcast.progress", handler);
        return () => {
            socket.off("connect", onConnect);
            socket.off("broadcast.progress", handler);
        };
    }, [sessionId, getSocket, joinSession, t]);

    // Fetch history
    const fetchHistory = useCallback(async () => {
        if (!sessionId) return;
        setHistoryLoading(true);
        try {
            const res = await fetch(`/api/messages/${sessionId}/broadcast/history?limit=20`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data.data || []);
            }
        } catch (e) {
            console.error("Failed to fetch broadcast history", e);
        } finally {
            setHistoryLoading(false);
        }
    }, [sessionId]);

    // Fetch templates
    const fetchTemplates = useCallback(async () => {
        if (!sessionId) return;
        setTemplatesLoading(true);
        try {
            const res = await fetch(`/api/messages/${sessionId}/broadcast/templates`);
            if (res.ok) {
                const data = await res.json();
                setTemplates(data.data || []);
            }
        } catch (e) {
            console.error("Failed to fetch templates", e);
        } finally {
            setTemplatesLoading(false);
        }
    }, [sessionId]);

    // Load data on mount & tab switch
    useEffect(() => {
        if (sessionId) {
            if (activeTab === "history") fetchHistory();
            if (activeTab === "templates") fetchTemplates();
        }
    }, [activeTab, sessionId, fetchHistory, fetchTemplates]);

    // Open detail modal
    const openDetail = async (log: BroadcastLog) => {
        setSelectedLog(log);
        setDetailOpen(true);
        setDetailLoading(true);
        try {
            const res = await fetch(`/api/messages/${sessionId}/broadcast/history/${log.id}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedLog(data.data);
            }
        } catch (e) {
            console.error("Failed to fetch broadcast detail", e);
        } finally {
            setDetailLoading(false);
        }
    };

    const normalizeRecipientInput = (input: string): string | null => {
        let clean = input.trim();
        if (!clean) return null;
        if (clean.endsWith("@g.us") || clean.endsWith("@newsletter")) {
            return clean;
        }
        if (clean.includes("@")) {
            const [user, server] = clean.split("@");
            const numeric = user.replace(/\D/g, "");
            if (!numeric) return null;
            return `${numeric}@${server || "s.whatsapp.net"}`;
        }
        clean = clean.replace(/\D/g, "");
        if (!clean) return null;
        if (clean.startsWith("0")) {
            clean = "62" + clean.substring(1);
        }
        return `${clean}@s.whatsapp.net`;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (!fileName) setFileName(file.name);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Button management for interactive messages
    const addButton = () => {
        if (buttons.length >= 3) {
            toast.warning(t("maxButtonsHint"));
            return;
        }
        const newId = String(Date.now());
        setButtons([...buttons, { id: newId, type: "quick_reply", displayText: `Button ${buttons.length + 1}`, value: `btn_${newId}` }]);
    };

    const updateButton = (id: string, field: keyof InteractiveButtonItem, val: string) => {
        setButtons(buttons.map(b => b.id === id ? { ...b, [field]: val } : b));
    };

    const removeButton = (id: string) => {
        setButtons(buttons.filter(b => b.id !== id));
    };

    // Presets for interactive messages
    const interactivePresets = [
        {
            id: "quick_reply",
            name: "Konfirmasi Cepat (Quick Reply)",
            payload: {
                title: "Konfirmasi Pesanan",
                body: "Halo! Terima kasih telah menghubungi kami. Silakan konfirmasi pesanan Anda dengan memilih salah satu tombol di bawah:",
                footer: "Pilih untuk membalas",
                buttons: [
                    { id: "1", type: "quick_reply" as const, displayText: "✅ Konfirmasi", value: "confirm_yes" },
                    { id: "2", type: "quick_reply" as const, displayText: "❌ Batalkan", value: "confirm_no" },
                    { id: "3", type: "quick_reply" as const, displayText: "💬 Tanya CS", value: "confirm_cs" }
                ]
            }
        },
        {
            id: "promo_cta",
            name: "Promo & CTA Link (Diskon 50%)",
            payload: {
                title: "Promo Spesial Hari Ini! 🎉",
                body: "Dapatkan diskon potongan 50% untuk semua produk favorit Anda. Gunakan kode promo berikut sekarang!",
                footer: "Syarat & ketentuan berlaku",
                buttons: [
                    { id: "1", type: "cta_url" as const, displayText: "🌐 Kunjungi Website", value: "https://google.com" },
                    { id: "2", type: "cta_call" as const, displayText: "📞 Hubungi Hotline", value: "+628123456789" },
                    { id: "3", type: "cta_copy" as const, displayText: "📋 Salin DISKON50", value: "DISKON50" }
                ]
            }
        },
        {
            id: "customer_support",
            name: "Bantuan & Layanan Pelanggan",
            payload: {
                title: "Pusat Bantuan Pelanggan",
                body: "Ada pertanyaan atau kendala? Tim dukungan kami siap melayani Anda 24/7.",
                footer: "Official Support Service",
                buttons: [
                    { id: "1", type: "quick_reply" as const, displayText: "Pertanyaan Umum (FAQ)", value: "faq" },
                    { id: "2", type: "cta_url" as const, displayText: "Live Chat Support", value: "https://wa.me/628123456789" },
                    { id: "3", type: "cta_copy" as const, displayText: "Salin Email CS", value: "support@example.com" }
                ]
            }
        }
    ];

    const applyPreset = (presetId: string) => {
        const preset = interactivePresets.find(p => p.id === presetId);
        if (!preset) return;
        setInteractiveTitle(preset.payload.title);
        setInteractiveBody(preset.payload.body);
        setInteractiveFooter(preset.payload.footer);
        setButtons(preset.payload.buttons.map(b => ({ ...b })));
        toast.info(t("presetLoaded", { name: preset.name }));
    };

    // Load saved template into composer
    const applySavedTemplate = (tmpl: BroadcastTemplate) => {
        setMessageType(tmpl.type || "text");
        setMessage(tmpl.message || "");
        setMediaUrl(tmpl.mediaUrl || "");
        setFileName(tmpl.fileName || "");
        clearFile();

        if (tmpl.interactiveData) {
            setInteractiveTitle(tmpl.interactiveData.title || "");
            setInteractiveBody(tmpl.interactiveData.body || tmpl.message || "");
            setInteractiveFooter(tmpl.interactiveData.footer || "");
            if (Array.isArray(tmpl.interactiveData.buttons)) {
                setButtons(tmpl.interactiveData.buttons);
            }
        }
        setActiveTab("new");
        toast.info(t("presetLoaded", { name: tmpl.name }));
    };

    // Save current broadcast as template
    const handleSaveTemplate = async () => {
        if (!templateName.trim()) {
            toast.error(t("templateNameLabel") + " is required");
            return;
        }
        setSavingTemplate(true);
        try {
            const payload: any = {
                name: templateName.trim(),
                type: messageType,
                message: messageType === "interactive" ? (interactiveBody || message) : message,
                mediaUrl: mediaUrl || undefined,
                fileName: fileName || undefined,
            };
            if (messageType === "interactive") {
                payload.interactiveData = {
                    title: interactiveTitle,
                    body: interactiveBody || message,
                    footer: interactiveFooter,
                    buttons
                };
            }
            const res = await fetch(`/api/messages/${sessionId}/broadcast/templates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(t("templateSavedSuccess"));
                setSaveTemplateOpen(false);
                setTemplateName("");
                fetchTemplates();
            } else {
                toast.error(data.message || "Failed to save template");
            }
        } catch (e: any) {
            toast.error(e.message || "Error saving template");
        } finally {
            setSavingTemplate(false);
        }
    };

    // Delete saved template
    const handleDeleteTemplate = async (templateId: string) => {
        try {
            const res = await fetch(`/api/messages/${sessionId}/broadcast/templates/${templateId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                toast.success(t("templateDeletedSuccess"));
                setTemplates(templates.filter(t => t.id !== templateId));
            } else {
                toast.error("Failed to delete template");
            }
        } catch (e) {
            toast.error("Error deleting template");
        }
    };

    // Send Broadcast
    const handleSend = async () => {
        if (!sessionId) return toast.error(t("noActiveSession"));

        const recipients = Array.from(
            new Set(contacts.split(/[\n,]+/).map(normalizeRecipientInput).filter((s): s is string => Boolean(s)))
        );

        if (recipients.length === 0) {
            return toast.error(t("recipientsRequired"));
        }

        if (messageType === "text" && !message.trim()) {
            return toast.error(t("messageRequired"));
        }

        if (["image", "video", "audio", "document"].includes(messageType) && !selectedFile && !mediaUrl.trim()) {
            return toast.error("Please provide a file or media URL");
        }

        if (messageType === "interactive" && !interactiveBody.trim() && !message.trim()) {
            return toast.error("Interactive body text is required");
        }

        setLoading(true);
        setBroadcastProgress(null);

        try {
            let res: Response;

            if (selectedFile) {
                // Send via FormData
                const formData = new FormData();
                formData.append("recipients", JSON.stringify(recipients));
                formData.append("type", messageType);
                formData.append("message", messageType === "interactive" ? (interactiveBody || message) : message);
                formData.append("file", selectedFile);
                if (fileName) formData.append("fileName", fileName);
                if (mediaUrl) formData.append("mediaUrl", mediaUrl);
                formData.append("ptt", ptt ? "true" : "false");
                formData.append("delay", String(delay[0]));

                if (messageType === "interactive") {
                    formData.append("interactiveData", JSON.stringify({
                        title: interactiveTitle,
                        body: interactiveBody || message,
                        footer: interactiveFooter,
                        buttons: buttons.map(b => ({
                            type: b.type,
                            displayText: b.displayText,
                            id: b.type === "quick_reply" ? (b.value || b.id) : undefined,
                            url: b.type === "cta_url" ? b.value : undefined,
                            phoneNumber: b.type === "cta_call" ? b.value : undefined,
                            copyCode: b.type === "cta_copy" ? b.value : undefined,
                        }))
                    }));
                }

                res = await fetch(`/api/messages/${sessionId}/broadcast`, {
                    method: "POST",
                    body: formData
                });
            } else {
                // Send via JSON
                const payload: any = {
                    recipients,
                    type: messageType,
                    message: messageType === "interactive" ? (interactiveBody || message) : message,
                    mediaUrl: mediaUrl.trim() || undefined,
                    fileName: fileName.trim() || undefined,
                    ptt,
                    delay: delay[0]
                };

                if (messageType === "interactive") {
                    payload.interactiveData = {
                        title: interactiveTitle,
                        body: interactiveBody || message,
                        footer: interactiveFooter,
                        buttons: buttons.map(b => ({
                            type: b.type,
                            displayText: b.displayText,
                            id: b.type === "quick_reply" ? (b.value || b.id) : undefined,
                            url: b.type === "cta_url" ? b.value : undefined,
                            phoneNumber: b.type === "cta_call" ? b.value : undefined,
                            copyCode: b.type === "cta_copy" ? b.value : undefined,
                        }))
                    };
                }

                res = await fetch(`/api/messages/${sessionId}/broadcast`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            }

            const data = await res.json();

            if (res.ok) {
                toast.info(t("broadcastStarted", { count: recipients.length }));
            } else {
                toast.error(data.message || t("failedToStart"));
                setLoading(false);
            }
        } catch (e: any) {
            console.error(e);
            toast.error(t("errorSending"));
            setLoading(false);
        }
    };

    const recipientCount = Array.from(
        new Set(contacts.split(/[\n,]+/).map(normalizeRecipientInput).filter((s): s is string => Boolean(s)))
    ).length;

    const formatJid = (jid: string) => {
        if (!jid) return "-";
        return jid.replace("@s.whatsapp.net", "").replace("@g.us", " (Group)");
    };

    const formatTime = (ts: string) => {
        const d = new Date(ts);
        return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const tabs = [
        { id: "new" as const, label: t("tabNew"), icon: Send },
        { id: "templates" as const, label: t("tabTemplates"), icon: BookmarkPlus },
        { id: "history" as const, label: t("tabHistory"), icon: History },
    ];

    const messageTypeOptions: { type: BroadcastMessageType; label: string; icon: any; color: string }[] = [
        { type: "text", label: t("typeText"), icon: FileText, color: "text-muted-foreground" },
        { type: "image", label: t("typeImage"), icon: ImageIcon, color: "text-emerald-500" },
        { type: "video", label: t("typeVideo"), icon: VideoIcon, color: "text-purple-500" },
        { type: "audio", label: t("typeAudio"), icon: Music, color: "text-amber-500" },
        { type: "document", label: t("typeDocument"), icon: Paperclip, color: "text-blue-500" },
        { type: "interactive", label: t("typeInteractive"), icon: Sparkles, color: "text-pink-500" },
    ];

    return (
        <SessionGuard>
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl sm:text-3xl font-bold tracking-tight">{t("title")}</h2>
                    <p className="text-muted-foreground text-sm mt-1">{t("subtitle")}</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                activeTab === tab.id
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab: New Broadcast */}
                {activeTab === "new" && (
                    <>
                        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-12">
                            {/* Recipients Card (4 cols) */}
                            <Card className="lg:col-span-5 flex flex-col">
                                <CardHeader>
                                    <CardTitle>{t("recipientsTitle")}</CardTitle>
                                    <CardDescription>{t("recipientsDescription")}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1 flex flex-col">
                                    <div className="space-y-2 flex-1 flex flex-col">
                                        <Label>{t("targetLabel")}</Label>
                                        <Textarea
                                            placeholder={"628123456789\n628987654321"}
                                            className="min-h-[220px] font-mono text-sm flex-1"
                                            value={contacts}
                                            onChange={e => setContacts(e.target.value)}
                                            disabled={loading}
                                        />
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{t("numbersIdentified", { count: recipientCount })}</span>
                                            {recipientCount > 0 && (
                                                <Badge variant="outline" className="text-xs">
                                                    {recipientCount} targets
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delay Settings */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <div className="flex justify-between items-center text-sm">
                                            <Label>{t("delayLabel")}</Label>
                                            <span className="font-mono text-xs font-semibold text-primary">
                                                {(delay[0] / 1000).toFixed(1)}s
                                            </span>
                                        </div>
                                        <Slider
                                            defaultValue={[2000]}
                                            min={1000}
                                            max={15000}
                                            step={500}
                                            value={delay}
                                            onValueChange={setDelay}
                                            disabled={loading}
                                        />
                                        <p className="text-xs text-muted-foreground">{t("delayAntarPesan")}</p>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="pt-2 space-y-2">
                                        <Button
                                            className="w-full"
                                            size="lg"
                                            onClick={handleSend}
                                            disabled={loading || !sessionId || recipientCount === 0}
                                        >
                                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                            {loading ? t("broadcasting") : t("startButton")}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Message Composer Card (7 cols) */}
                            <Card className="lg:col-span-7">
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <div>
                                        <CardTitle>{t("messageTitle")}</CardTitle>
                                        <CardDescription>{t("subtitle")}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSaveTemplateOpen(true)}
                                            disabled={loading}
                                            className="gap-1.5 text-xs"
                                        >
                                            <BookmarkPlus className="h-3.5 w-3.5" />
                                            {t("saveAsTemplate")}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Message Type Selector Buttons */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {t("typeLabel")}
                                        </Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {messageTypeOptions.map(opt => (
                                                <button
                                                    key={opt.type}
                                                    type="button"
                                                    onClick={() => setMessageType(opt.type)}
                                                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                                                        messageType === opt.type
                                                            ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                                                            : "hover:bg-muted/50 border-input text-muted-foreground"
                                                    }`}
                                                >
                                                    <opt.icon className={`h-4 w-4 shrink-0 ${messageType === opt.type ? "text-primary" : opt.color}`} />
                                                    <span className="truncate">{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Media Section: Image, Video, Audio, Document */}
                                    {["image", "video", "audio", "document"].includes(messageType) && (
                                        <div className="p-3 bg-muted/40 rounded-lg border space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-medium flex items-center gap-1.5">
                                                    <Upload className="h-3.5 w-3.5" />
                                                    {t("mediaSource")}
                                                </Label>
                                                <div className="flex gap-1 text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => setMediaSourceMode("upload")}
                                                        className={`px-2.5 py-1 rounded ${mediaSourceMode === "upload" ? "bg-background shadow-xs font-medium" : "text-muted-foreground"}`}
                                                    >
                                                        {t("uploadFile")}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setMediaSourceMode("url")}
                                                        className={`px-2.5 py-1 rounded ${mediaSourceMode === "url" ? "bg-background shadow-xs font-medium" : "text-muted-foreground"}`}
                                                    >
                                                        {t("mediaUrl")}
                                                    </button>
                                                </div>
                                            </div>

                                            {mediaSourceMode === "upload" ? (
                                                <div className="space-y-2">
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        className="hidden"
                                                        accept={
                                                            messageType === "image" ? "image/*" :
                                                            messageType === "video" ? "video/*" :
                                                            messageType === "audio" ? "audio/*" :
                                                            "*/*"
                                                        }
                                                        onChange={handleFileChange}
                                                    />

                                                    {!selectedFile ? (
                                                        <div
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                                                        >
                                                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                                            <p className="text-sm font-medium">{t("chooseFile")}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {messageType === "image" && "PNG, JPG, WebP up to 25MB"}
                                                                {messageType === "video" && "MP4, MKV up to 50MB"}
                                                                {messageType === "audio" && "MP3, OGG, WAV, M4A up to 25MB"}
                                                                {messageType === "document" && "PDF, DOCX, ZIP, etc. up to 50MB"}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between p-2.5 bg-background rounded-md border text-sm">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                {messageType === "image" && <ImageIcon className="h-4 w-4 text-emerald-500 shrink-0" />}
                                                                {messageType === "video" && <VideoIcon className="h-4 w-4 text-purple-500 shrink-0" />}
                                                                {messageType === "audio" && <Music className="h-4 w-4 text-amber-500 shrink-0" />}
                                                                {messageType === "document" && <Paperclip className="h-4 w-4 text-blue-500 shrink-0" />}
                                                                <span className="truncate font-medium">{selectedFile.name}</span>
                                                                <span className="text-xs text-muted-foreground shrink-0">
                                                                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                                                </span>
                                                            </div>
                                                            <Button variant="ghost" size="sm" onClick={clearFile} className="h-7 w-7 p-0 text-red-500">
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {/* File Preview */}
                                                    {filePreview && messageType === "image" && (
                                                        <div className="mt-2 max-h-48 overflow-hidden rounded-md border flex items-center justify-center bg-black/5">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={filePreview} alt="Preview" className="max-h-48 object-contain" />
                                                        </div>
                                                    )}
                                                    {filePreview && messageType === "audio" && (
                                                        <audio controls src={filePreview} className="w-full mt-2" />
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Input
                                                        placeholder={t("mediaUrlPlaceholder")}
                                                        value={mediaUrl}
                                                        onChange={e => setMediaUrl(e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            {/* Extra options for document / audio */}
                                            {messageType === "document" && (
                                                <div className="space-y-1">
                                                    <Label className="text-xs">{t("fileNameLabel")}</Label>
                                                    <Input
                                                        placeholder="file.pdf"
                                                        value={fileName}
                                                        onChange={e => setFileName(e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            {messageType === "audio" && (
                                                <div className="flex items-center justify-between pt-1">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-xs font-medium">{t("voiceNote")}</Label>
                                                        <p className="text-[11px] text-muted-foreground">Kirim sebagai rekaman suara WhatsApp (Voice Note)</p>
                                                    </div>
                                                    <Switch checked={ptt} onCheckedChange={setPtt} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Interactive Message Section */}
                                    {messageType === "interactive" && (
                                        <div className="space-y-4 p-3 bg-muted/40 rounded-lg border">
                                            {/* Presets Selector */}
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs font-semibold flex items-center gap-1.5">
                                                    <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                                                    {t("loadPreset")}
                                                </Label>
                                                <Select onValueChange={applyPreset}>
                                                    <SelectTrigger className="h-8 text-xs w-[220px]">
                                                        <SelectValue placeholder={t("selectPreset")} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {interactivePresets.map(p => (
                                                            <SelectItem key={p.id} value={p.id} className="text-xs">
                                                                {p.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Header Title (optional) */}
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">{t("interactiveTitle")}</Label>
                                                <Input
                                                    placeholder="Pengumuman / Judul Pesan"
                                                    value={interactiveTitle}
                                                    onChange={e => setInteractiveTitle(e.target.value)}
                                                />
                                            </div>

                                            {/* Body (required) */}
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium">{t("messageLabel")} *</Label>
                                                <Textarea
                                                    placeholder="Halo! Silakan pilih salah satu tombol berikut..."
                                                    className="min-h-[90px] text-sm"
                                                    value={interactiveBody}
                                                    onChange={e => {
                                                        setInteractiveBody(e.target.value);
                                                        setMessage(e.target.value);
                                                    }}
                                                />
                                            </div>

                                            {/* Footer (optional) */}
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">{t("interactiveFooter")}</Label>
                                                <Input
                                                    placeholder="Balas dengan memilih tombol di bawah"
                                                    value={interactiveFooter}
                                                    onChange={e => setInteractiveFooter(e.target.value)}
                                                />
                                            </div>

                                            {/* Buttons Builder */}
                                            <div className="space-y-2 pt-2 border-t">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                                                        {t("buttonsLabel")} ({buttons.length}/3)
                                                    </Label>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={addButton}
                                                        disabled={buttons.length >= 3}
                                                        className="h-7 text-xs gap-1"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        {t("addButton")}
                                                    </Button>
                                                </div>

                                                <div className="space-y-2">
                                                    {buttons.map((btn, idx) => (
                                                        <div key={btn.id} className="p-2.5 bg-background rounded-md border space-y-2 text-xs">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <Select
                                                                    value={btn.type}
                                                                    onValueChange={(val: ButtonType) => updateButton(btn.id, "type", val)}
                                                                >
                                                                    <SelectTrigger className="h-7 text-xs w-[140px]">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="quick_reply" className="text-xs">{t("btnQuickReply")}</SelectItem>
                                                                        <SelectItem value="cta_url" className="text-xs">{t("btnCtaUrl")}</SelectItem>
                                                                        <SelectItem value="cta_call" className="text-xs">{t("btnCtaCall")}</SelectItem>
                                                                        <SelectItem value="cta_copy" className="text-xs">{t("btnCtaCopy")}</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeButton(btn.id)}
                                                                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                <Input
                                                                    placeholder={t("buttonText")}
                                                                    value={btn.displayText}
                                                                    onChange={e => updateButton(btn.id, "displayText", e.target.value)}
                                                                    className="h-7 text-xs"
                                                                />
                                                                <Input
                                                                    placeholder={
                                                                        btn.type === "cta_url" ? "https://example.com" :
                                                                        btn.type === "cta_call" ? "+628123456789" :
                                                                        btn.type === "cta_copy" ? "KODEKUPON" :
                                                                        "ID / Payload"
                                                                    }
                                                                    value={btn.value}
                                                                    onChange={e => updateButton(btn.id, "value", e.target.value)}
                                                                    className="h-7 text-xs"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* WhatsApp Interactive Preview */}
                                            <div className="pt-2 border-t">
                                                <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
                                                    {t("preview")}
                                                </Label>
                                                <div className="max-w-sm bg-card p-3 rounded-lg border shadow-xs space-y-2">
                                                    {interactiveTitle && (
                                                        <p className="font-semibold text-sm text-foreground">{interactiveTitle}</p>
                                                    )}
                                                    <p className="text-xs text-foreground whitespace-pre-wrap">
                                                        {interactiveBody || message || "Pratinjau isi pesan interaktif..."}
                                                    </p>
                                                    {interactiveFooter && (
                                                        <p className="text-[11px] text-muted-foreground">{interactiveFooter}</p>
                                                    )}
                                                    <div className="pt-2 border-t space-y-1">
                                                        {buttons.map((b, i) => (
                                                            <div
                                                                key={i}
                                                                className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-muted/60 text-primary text-xs font-medium hover:bg-muted"
                                                            >
                                                                {b.type === "cta_url" && <ExternalLink className="h-3 w-3" />}
                                                                {b.type === "cta_call" && <PhoneCall className="h-3 w-3" />}
                                                                {b.type === "cta_copy" && <Copy className="h-3 w-3" />}
                                                                {b.type === "quick_reply" && <Sparkles className="h-3 w-3" />}
                                                                <span>{b.displayText || `Button ${i + 1}`}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Text Message Input (for Text, Image, Video, Document caption) */}
                                    {messageType !== "interactive" && (
                                        <div className="space-y-2">
                                            <Label>
                                                {["image", "video", "document"].includes(messageType) ? t("captionLabel") : t("messageLabel")}
                                            </Label>
                                            <Textarea
                                                placeholder={t("messagePlaceholder")}
                                                className="min-h-[140px]"
                                                value={message}
                                                onChange={e => setMessage(e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Live Socket Progress Card */}
                        {broadcastProgress && (
                            <Card className={`border-2 transition-colors ${
                                broadcastProgress.status === "completed"
                                    ? (broadcastProgress.failed === 0 ? "border-green-500/30 bg-green-50/30 dark:bg-green-950/10" : "border-yellow-500/30 bg-yellow-50/30 dark:bg-yellow-950/10")
                                    : "border-blue-500/30 bg-blue-50/30 dark:bg-blue-950/10"
                            }`}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        {broadcastProgress.status === "running" ? (
                                            <><Radio className="h-5 w-5 text-blue-500 animate-pulse" /><span>{t("broadcastInProgress")}</span></>
                                        ) : broadcastProgress.failed === 0 ? (
                                            <><CheckCircle2 className="h-5 w-5 text-green-500" /><span>{t("broadcastCompleted")}</span></>
                                        ) : (
                                            <><AlertTriangle className="h-5 w-5 text-yellow-500" /><span>{t("broadcastCompletedWithErrors")}</span></>
                                        )}
                                    </CardTitle>
                                    <CardDescription>ID: {broadcastProgress.broadcastId}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{t("progressTitle")}</span>
                                            <span className="font-mono font-medium">
                                                {broadcastProgress.sent + broadcastProgress.failed} / {broadcastProgress.total} ({broadcastProgress.progress || 0}%)
                                            </span>
                                        </div>
                                        <Progress value={broadcastProgress.progress || 0} className="h-3" />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-background rounded-lg p-3 text-center border">
                                            <div className="text-2xl font-bold text-green-600">{broadcastProgress.sent}</div>
                                            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                                <CheckCircle2 className="h-3 w-3" /> {t("sent")}
                                            </div>
                                        </div>
                                        <div className="bg-background rounded-lg p-3 text-center border">
                                            <div className="text-2xl font-bold text-red-500">{broadcastProgress.failed}</div>
                                            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                                <XCircle className="h-3 w-3" /> {t("failed")}
                                            </div>
                                        </div>
                                        <div className="bg-background rounded-lg p-3 text-center border">
                                            <div className="text-2xl font-bold text-muted-foreground">
                                                {broadcastProgress.total - broadcastProgress.sent - broadcastProgress.failed}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                                <Clock className="h-3 w-3" /> {t("pending")}
                                            </div>
                                        </div>
                                    </div>

                                    {broadcastProgress.status === "running" && broadcastProgress.current && (
                                        <div className="flex items-center gap-2 text-sm px-3 py-2 bg-muted/50 rounded-lg">
                                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />
                                            <span className="text-muted-foreground">{t("nowSending")}</span>
                                            <span className="font-mono font-medium">{formatJid(broadcastProgress.current)}</span>
                                        </div>
                                    )}

                                    {broadcastProgress.status === "completed" && broadcastProgress.errors && broadcastProgress.errors.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
                                                <XCircle className="h-4 w-4" /> {t("failed")} ({broadcastProgress.errors.length})
                                            </h4>
                                            <div className="max-h-40 overflow-y-auto bg-red-50 dark:bg-red-950/30 rounded-lg p-2 space-y-1">
                                                {broadcastProgress.errors.map((err, i) => (
                                                    <div key={i} className="flex justify-between items-center text-xs py-1 px-2 bg-background/60 rounded">
                                                        <span className="font-mono">{formatJid(err.jid)}</span>
                                                        <span className="text-red-500 truncate ml-2 max-w-[200px]">{err.error}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {/* Tab: Saved Templates (Save Broadcast Feature) */}
                {activeTab === "templates" && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <BookmarkPlus className="h-5 w-5 text-primary" />
                                    {t("savedTemplatesTitle")}
                                </CardTitle>
                                <CardDescription>{t("savedTemplatesDesc")}</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => { setActiveTab("new"); setSaveTemplateOpen(true); }} className="gap-1.5">
                                <Plus className="h-4 w-4" />
                                {t("saveAsTemplate")}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {templatesLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground space-y-3">
                                    <BookmarkPlus className="h-10 w-10 mx-auto opacity-40" />
                                    <p className="text-sm">{t("noTemplates")}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {templates.map(tmpl => (
                                        <div
                                            key={tmpl.id}
                                            className="p-4 rounded-xl border bg-card hover:border-primary/50 transition-all flex flex-col justify-between space-y-3 shadow-xs"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-semibold text-sm line-clamp-1">{tmpl.name}</h3>
                                                    <Badge variant="outline" className="text-[11px] uppercase shrink-0">
                                                        {tmpl.type}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-3">
                                                    {tmpl.message || (tmpl.interactiveData?.body || tmpl.fileName || `[${tmpl.type} template]`)}
                                                </p>
                                                {tmpl.fileName && (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Paperclip className="h-3 w-3" />
                                                        <span className="truncate">{tmpl.fileName}</span>
                                                    </div>
                                                )}
                                                {tmpl.interactiveData?.buttons && (
                                                    <div className="flex flex-wrap gap-1 pt-1">
                                                        {tmpl.interactiveData.buttons.slice(0, 3).map((b: any, idx: number) => (
                                                            <span key={idx} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                                                {b.displayText}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t text-xs">
                                                <span className="text-muted-foreground text-[11px]">
                                                    {new Date(tmpl.createdAt).toLocaleDateString()}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                        onClick={() => handleDeleteTemplate(tmpl.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="h-8 text-xs gap-1"
                                                        onClick={() => applySavedTemplate(tmpl)}
                                                    >
                                                        <Send className="h-3 w-3" />
                                                        {t("useTemplate")}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Tab: History */}
                {activeTab === "history" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                {t("historyTitle")}
                            </CardTitle>
                            <CardDescription>{t("historyPermanent")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {historyLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-sm">{t("noHistoryShort")}</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {history.map(log => (
                                        <div key={log.id}
                                            className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                                        >
                                            {/* Status icon */}
                                            <div className="shrink-0">
                                                {log.status === "completed" ? (
                                                    log.failed === 0
                                                        ? <CheckCircle2 className="h-8 w-8 text-green-500" />
                                                        : <AlertTriangle className="h-8 w-8 text-yellow-500" />
                                                ) : (
                                                    <Radio className="h-8 w-8 text-blue-500 animate-pulse" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                                                        {log.type || "text"}
                                                    </Badge>
                                                    <p className="text-sm font-medium truncate">{log.message}</p>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3 text-green-500" /> {log.sent}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <XCircle className="h-3 w-3 text-red-500" /> {log.failed}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" /> {formatTime(log.startedAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* View button */}
                                            <Button variant="ghost" size="sm" className="shrink-0" onClick={() => openDetail(log)}>
                                                <Eye className="h-4 w-4 mr-1" /> {t("detailButton")}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Detail Modal */}
                <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {selectedLog?.status === "completed"
                                    ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    : <Radio className="h-5 w-5 text-blue-500 animate-pulse" />
                                }
                                {t("detailTitle")}
                            </DialogTitle>
                        </DialogHeader>

                        {detailLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : selectedLog ? (
                            <div className="flex flex-col gap-4 overflow-hidden min-h-0">
                                {/* Summary stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-muted/30 rounded-lg p-3 text-center border">
                                        <div className="text-xl font-bold text-green-600">{selectedLog.sent}</div>
                                        <div className="text-xs text-muted-foreground">{t("sent")}</div>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-3 text-center border">
                                        <div className="text-xl font-bold text-red-500">{selectedLog.failed}</div>
                                        <div className="text-xs text-muted-foreground">{t("failed")}</div>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-3 text-center border">
                                        <div className="text-xl font-bold">{selectedLog.total}</div>
                                        <div className="text-xs text-muted-foreground">{t("total")}</div>
                                    </div>
                                </div>

                                {/* Message & Payload Info */}
                                <div className="bg-muted/30 rounded-lg p-3 space-y-2 border">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-xs uppercase font-mono">
                                            {selectedLog.type || "text"}
                                        </Badge>
                                        {selectedLog.mediaUrl && (
                                            <a
                                                href={selectedLog.mediaUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline flex items-center gap-1"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                {selectedLog.fileName || "View Attachment"}
                                            </a>
                                        )}
                                    </div>

                                    {/* Media preview if image or video */}
                                    {selectedLog.mediaUrl && selectedLog.type === "image" && (
                                        <div className="max-h-48 overflow-hidden rounded bg-black/5 flex items-center justify-center">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={selectedLog.mediaUrl} alt="Broadcast Media" className="max-h-48 object-contain" />
                                        </div>
                                    )}

                                    <p className="text-sm whitespace-pre-wrap break-words">{selectedLog.message}</p>

                                    {/* Interactive buttons breakdown */}
                                    {selectedLog.interactiveData?.buttons && (
                                        <div className="pt-2 border-t space-y-1">
                                            <p className="text-[11px] font-semibold text-muted-foreground uppercase">{t("buttonsLabel")}:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedLog.interactiveData.buttons.map((btn: any, idx: number) => (
                                                    <span key={idx} className="text-xs px-2 py-1 bg-background rounded border font-medium">
                                                        {btn.displayText}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Time */}
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                    <span>{t("started")} {formatTime(selectedLog.startedAt)}</span>
                                    {selectedLog.completedAt && <span>{t("completed")} {formatTime(selectedLog.completedAt)}</span>}
                                </div>

                                {/* Recipients list */}
                                {selectedLog.recipients && selectedLog.recipients.length > 0 && (
                                    <div className="flex-1 overflow-y-auto min-h-0 border rounded-lg p-2">
                                        <h4 className="text-xs font-semibold mb-2">{t("recipients")} ({selectedLog.recipients.length})</h4>
                                        <div className="space-y-1">
                                            {selectedLog.recipients.map(r => (
                                                <div key={r.id}
                                                    className={`flex items-center justify-between gap-2 text-xs py-1.5 px-2 rounded ${
                                                        r.status === "sent" ? "bg-green-500/5" :
                                                        r.status === "failed" ? "bg-red-500/5" : "bg-muted/30"
                                                    }`}
                                                >
                                                    <span className="font-mono truncate">{formatJid(r.jid)}</span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className={`px-1.5 py-0.5 rounded font-medium ${
                                                            r.status === "sent" ? "text-green-600 bg-green-500/10" :
                                                            r.status === "failed" ? "text-red-500 bg-red-500/10" : "text-muted-foreground bg-muted/50"
                                                        }`}>
                                                            {r.status}
                                                        </span>
                                                        {r.error && (
                                                            <span className="text-red-500 max-w-[200px] truncate" title={r.error}>{r.error}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </DialogContent>
                </Dialog>

                {/* Save Broadcast Template Dialog */}
                <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <BookmarkPlus className="h-5 w-5 text-primary" />
                                {t("saveTemplateDialogTitle")}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="templateName">{t("templateNameLabel")}</Label>
                                <Input
                                    id="templateName"
                                    placeholder={t("templateNamePlaceholder")}
                                    value={templateName}
                                    onChange={e => setTemplateName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border space-y-1">
                                <p className="font-semibold text-foreground">Detail Template:</p>
                                <p>• Tipe: <span className="font-mono uppercase font-semibold">{messageType}</span></p>
                                {selectedFile && <p>• File: {selectedFile.name}</p>}
                                {mediaUrl && <p>• URL: {mediaUrl}</p>}
                                {messageType === "interactive" && buttons.length > 0 && (
                                    <p>• Tombol: {buttons.length} tombol aktif</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSaveTemplateOpen(false)}>
                                {tCommon("cancel")}
                            </Button>
                            <Button onClick={handleSaveTemplate} disabled={savingTemplate || !templateName.trim()}>
                                {savingTemplate ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <BookmarkPlus className="mr-2 h-4 w-4" />}
                                {t("saveTemplateBtn")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </SessionGuard>
    );
}
