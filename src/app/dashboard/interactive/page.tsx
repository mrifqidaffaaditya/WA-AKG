"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sparkles,
    Send,
    Plus,
    Trash2,
    ExternalLink,
    PhoneCall,
    Copy,
    ListFilter,
    MousePointerClick,
    Zap,
    CheckCircle2,
    XCircle,
    Loader2,
    History,
    Phone,
    Layers,
    Info,
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/components/dashboard/session-provider";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { sendInteractiveChatMessage } from "@/app/dashboard/chat/actions";
import { ButtonType, InteractiveButtonItem } from "@/components/chat/interactive-message-dialog";

interface TriggerLog {
    id: string;
    timestamp: string;
    target: string;
    type: string;
    status: "success" | "error";
    error?: string;
}

export default function InteractivePage() {
    return (
        <SessionGuard>
            <InteractiveContent />
        </SessionGuard>
    );
}

function InteractiveContent() {
    const { sessionId, sessions } = useSession();
    const [targetPhone, setTargetPhone] = useState("");
    const [activeTab, setActiveTab] = useState("presets");
    const [triggerLogs, setTriggerLogs] = useState<TriggerLog[]>([]);

    // Sending states
    const [sendingPresetId, setSendingPresetId] = useState<string | null>(null);
    const [isSendingCustom, setIsSendingCustom] = useState(false);

    // Custom composer state
    const [title, setTitle] = useState("Pengumuman Penting");
    const [body, setBody] = useState("Halo! Ini adalah pesan interaktif native flow WhatsApp. Silakan pilih aksi di bawah:");
    const [footer, setFooter] = useState("Powered by WA-AKG Bot");
    const [buttons, setButtons] = useState<InteractiveButtonItem[]>([
        { id: "1", type: "quick_reply", displayText: "Konfirmasi Pesanan", value: "confirm_order" },
        { id: "2", type: "cta_url", displayText: "Kunjungi Website", value: "https://google.com" },
        { id: "3", type: "cta_copy", displayText: "Salin Voucher DISKON", value: "DISKON50" },
    ]);

    // Format target phone into WhatsApp JID
    const formatJid = (input: string): string => {
        let clean = input.trim();
        if (clean.includes("@")) return clean;
        clean = clean.replace(/\D/g, "");
        if (clean.startsWith("0")) {
            clean = "62" + clean.substring(1);
        }
        return `${clean}@s.whatsapp.net`;
    };

    const validateTarget = (): string | null => {
        if (!targetPhone.trim()) {
            toast.error("Nomor tujuan WhatsApp wajib diisi");
            return null;
        }
        const jid = formatJid(targetPhone);
        if (!jid.startsWith("62") && !jid.startsWith("1") && jid.length < 10) {
            toast.error("Format nomor WhatsApp tidak valid. Masukkan format 08xx atau 628xx");
            return null;
        }
        return jid;
    };

    // Predefined 1-Click Test Triggers
    const presets = [
        {
            id: "quick_reply",
            title: "Quick Reply Buttons",
            subtitle: "3 Tombol Respon Cepat (Quick Reply)",
            description: "Penerima dapat memilih jawaban instan dengan 1 ketukan tanpa mengetik.",
            badge: "Paling Populer",
            payload: {
                title: "Konfirmasi Layanan",
                body: "Halo! Apakah Anda ingin melanjutkan konfirmasi dan aktivasi layanan sekarang?",
                footer: "Pilih salah satu tombol di bawah",
                buttons: [
                    { type: "quick_reply", displayText: "✅ Ya, Lanjutkan", id: "btn_yes" },
                    { type: "quick_reply", displayText: "❌ Batalkan", id: "btn_no" },
                    { type: "quick_reply", displayText: "💬 Tanya Admin", id: "btn_cs" }
                ]
            }
        },
        {
            id: "cta_actions",
            title: "Call To Action (CTA)",
            subtitle: "Link Web, Telepon & Salin Kode Promo",
            description: "Tombol aksi native yang membuka browser web, dialer telepon, dan otomatis menyalin teks.",
            badge: "Multi-Aksi",
            payload: {
                title: "Promo Spesial Hari Ini! 🎉",
                body: "Dapatkan penawaran terbatas! Gunakan tombol di bawah untuk langsung membuka promo, menghubungi kami, atau menyalin kode voucher.",
                footer: "Syarat & ketentuan berlaku",
                buttons: [
                    { type: "cta_url", displayText: "🌐 Buka Promo Website", url: "https://google.com" },
                    { type: "cta_call", displayText: "📞 Hubungi Hotline", phoneNumber: "+628123456789" },
                    { type: "cta_copy", displayText: "📋 Salin Kupon: HEMAT50", copyCode: "HEMAT50" }
                ]
            }
        },
        {
            id: "single_select",
            title: "Interactive List Menu",
            subtitle: "Daftar Menu Dropdown (Single Select)",
            description: "Mengirim tombol menu yang membuka drawer daftar opsi / kategori produk WhatsApp.",
            badge: "Katalog",
            payload: {
                title: "Katalog Pilihan Layanan",
                body: "Silakan tekan tombol 'Buka Pilihan Menu' untuk melihat daftar layanan dan memilih opsi yang diinginkan:",
                footer: "Pilih dari daftar menu interaktif",
                buttons: [
                    {
                        type: "single_select",
                        title: "Daftar Layanan",
                        buttonText: "📋 Buka Pilihan Menu",
                        sections: [
                            {
                                title: "Layanan Utama",
                                rows: [
                                    { id: "srv_wa", title: "WhatsApp Gateway", description: "Layanan broadcast & integrasi API" },
                                    { id: "srv_bot", title: "Smart Chatbot AI", description: "Otomasi customer service 24/7" }
                                ]
                            },
                            {
                                title: "Bantuan & Dukungan",
                                rows: [
                                    { id: "srv_faq", title: "Pusat Bantuan / FAQ", description: "Pertanyaan seputar integrasi" },
                                    { id: "srv_agent", title: "Hubungkan ke Live Agent", description: "Konsultasi langsung dengan tim support" }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        {
            id: "announcement",
            title: "Pengumuman / Announcement Card",
            subtitle: "Header Card & Konfirmasi Baca",
            description: "Pesan kartu informasi dengan header judul tebal, pesan pengumuman, dan tombol feedback.",
            badge: "Broadcast Card",
            payload: {
                title: "📢 PEMBERITAHUAN PEMELIHARAAN SISTEM",
                body: "Halo rekan-rekan, sistem server akan melakukan peningkatan infrastruktur pada malam ini pukul 23:00 - 01:00 WIB. Layanan akan kembali normal setelah proses selesai.",
                footer: "Tim Teknis WhatsApp AKG",
                buttons: [
                    { type: "quick_reply", displayText: "👍 Saya Mengerti", id: "ack_ok" },
                    { type: "cta_url", displayText: "📖 Cek Status Server", url: "https://google.com" }
                ]
            }
        }
    ];

    // Trigger test execution
    const handleTriggerTest = async (preset: typeof presets[0]) => {
        const jid = validateTarget();
        if (!jid) return;

        setSendingPresetId(preset.id);
        try {
            toast.info(`Mengirim test "${preset.title}" ke ${targetPhone}...`);
            await sendInteractiveChatMessage(sessionId, jid, preset.payload);
            toast.success(`Berhasil! Pesan interaktif telah terkirim ke ${targetPhone}`);

            setTriggerLogs(prev => [
                {
                    id: String(Date.now()),
                    timestamp: new Date().toLocaleTimeString(),
                    target: targetPhone,
                    type: preset.title,
                    status: "success"
                },
                ...prev.slice(0, 19)
            ]);
        } catch (error: any) {
            console.error("Test trigger error:", error);
            toast.error(error.message || "Gagal mengirim test interaktif");
            setTriggerLogs(prev => [
                {
                    id: String(Date.now()),
                    timestamp: new Date().toLocaleTimeString(),
                    target: targetPhone,
                    type: preset.title,
                    status: "error",
                    error: error.message
                },
                ...prev.slice(0, 19)
            ]);
        } finally {
            setSendingPresetId(null);
        }
    };

    // Custom button handlers
    const handleAddButton = () => {
        if (buttons.length >= 10) {
            toast.warning("Maksimal 10 tombol interaktif");
            return;
        }
        const newId = String(Date.now());
        setButtons(prev => [
            ...prev,
            { id: newId, type: "quick_reply", displayText: `Tombol ${prev.length + 1}`, value: `action_${newId}` }
        ]);
    };

    const handleRemoveButton = (id: string) => {
        setButtons(prev => prev.filter(b => b.id !== id));
    };

    const handleUpdateButton = (id: string, field: keyof InteractiveButtonItem, value: any) => {
        setButtons(prev =>
            prev.map(b => {
                if (b.id !== id) return b;
                const updated = { ...b, [field]: value };
                if (field === "type") {
                    if (value === "cta_url" && !b.value.startsWith("http")) updated.value = "https://";
                    else if (value === "cta_call" && !b.value.startsWith("+")) updated.value = "+62";
                    else if (value === "cta_copy") updated.value = "KODEPROMO";
                    else if (value === "single_select") updated.value = "Pilihan 1, Pilihan 2";
                }
                return updated;
            })
        );
    };

    const handleSendCustom = async () => {
        const jid = validateTarget();
        if (!jid) return;

        if (!body.trim() && !title.trim()) {
            toast.error("Isi pesan atau judul wajib diisi");
            return;
        }

        setIsSendingCustom(true);
        try {
            const formattedButtons = buttons.map((b, idx) => {
                if (b.type === "cta_url") {
                    return { type: "cta_url", displayText: b.displayText || `Link ${idx + 1}`, url: b.value || "https://google.com" };
                } else if (b.type === "cta_call") {
                    return { type: "cta_call", displayText: b.displayText || `Telepon ${idx + 1}`, phoneNumber: b.value || "+628123456789" };
                } else if (b.type === "cta_copy") {
                    return { type: "cta_copy", displayText: b.displayText || `Salin Kode`, copyCode: b.value || "CODE" };
                } else if (b.type === "single_select") {
                    const items = (b.value || "Opsi 1, Opsi 2").split(",").map(s => s.trim()).filter(Boolean);
                    return {
                        type: "single_select",
                        title: b.displayText || "Pilihan",
                        buttonText: b.displayText || "Pilih Opsi",
                        sections: [
                            {
                                title: "Daftar Opsi",
                                rows: items.map((it, i) => ({ id: `row_${i}`, title: it, description: "" }))
                            }
                        ]
                    };
                } else {
                    return {
                        type: "quick_reply",
                        displayText: b.displayText || `Tombol ${idx + 1}`,
                        id: b.value || `btn_${idx + 1}`
                    };
                }
            });

            await sendInteractiveChatMessage(sessionId, jid, {
                title: title.trim() || undefined,
                body: body.trim(),
                footer: footer.trim() || undefined,
                buttons: formattedButtons
            });

            toast.success(`Pesan interaktif berhasil dikirim ke ${targetPhone}!`);

            setTriggerLogs(prev => [
                {
                    id: String(Date.now()),
                    timestamp: new Date().toLocaleTimeString(),
                    target: targetPhone,
                    type: `Custom (${buttons.length} Tombol)`,
                    status: "success"
                },
                ...prev.slice(0, 19)
            ]);
        } catch (error: any) {
            console.error("Custom interactive send error:", error);
            toast.error(error.message || "Gagal mengirim pesan interaktif");
            setTriggerLogs(prev => [
                {
                    id: String(Date.now()),
                    timestamp: new Date().toLocaleTimeString(),
                    target: targetPhone,
                    type: `Custom (${buttons.length} Tombol)`,
                    status: "error",
                    error: error.message
                },
                ...prev.slice(0, 19)
            ]);
        } finally {
            setIsSendingCustom(false);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                        <Sparkles className="h-6 w-6 text-primary" />
                        Interactive Message & Test Trigger
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Kirim dan uji coba pesan interaktif WhatsApp Native Flow (Quick Reply, CTA Link, Call, Copy Code, List Menu) langsung dari dashboard.
                    </p>
                </div>
            </div>

            {/* Target & Session Configuration Bar */}
            <Card className="border-border/60 shadow-sm bg-gradient-to-r from-card via-card to-primary/5">
                <CardContent className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-4 space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                Sesi WhatsApp Aktif
                            </Label>
                            <div className="text-sm font-medium px-3 py-2 rounded-lg bg-muted/40 border border-border/50 truncate">
                                {sessions.find(s => s.sessionId === sessionId)?.name || sessionId || "Tidak ada sesi aktif"}
                            </div>
                        </div>

                        <div className="md:col-span-8 space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-primary" />
                                Nomor WhatsApp Tujuan Pengujian (Penerima)
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    value={targetPhone}
                                    onChange={(e) => setTargetPhone(e.target.value)}
                                    placeholder="Contoh: 08123456789 atau 628123456789"
                                    className="text-sm font-mono h-10"
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Masukkan nomor WhatsApp yang akan menerima pesan interaktif untuk menguji tampilannya.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-2 max-w-md h-10">
                    <TabsTrigger value="presets" className="text-xs flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        1-Click Test Triggers
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="text-xs flex items-center gap-2">
                        <Layers className="h-4 w-4 text-blue-500" />
                        Custom Message Builder
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: 1-Click Test Triggers */}
                <TabsContent value="presets" className="space-y-6">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
                        <Zap className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                            <p className="font-semibold text-sm">Mode Uji Coba Cepat (1-Click Test Trigger)</p>
                            <p className="text-muted-foreground mt-1 leading-relaxed">
                                Pastikan nomor tujuan telah dimasukkan pada kolom di atas, lalu klik salah satu tombol <span className="font-semibold text-foreground">"Trigger Test Sekarang"</span> untuk langsung mengirimkan contoh pesan interaktif ke nomor tersebut.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {presets.map((preset) => (
                            <Card key={preset.id} className="border-border/60 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                                            {preset.title}
                                        </CardTitle>
                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                            {preset.badge}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-muted-foreground">{preset.subtitle}</p>
                                    <CardDescription className="text-xs leading-relaxed mt-2">
                                        {preset.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4 pt-0">
                                    {/* Mock Bubble Preview */}
                                    <div className="bg-muted/40 rounded-xl p-3 border border-border/40 space-y-2">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-foreground">{preset.payload.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-3">{preset.payload.body}</p>
                                            {preset.payload.footer && (
                                                <p className="text-[10px] text-muted-foreground/80 italic">{preset.payload.footer}</p>
                                            )}
                                        </div>

                                        <div className="pt-2 border-t border-border/40 space-y-1.5">
                                            {preset.payload.buttons.map((b: any, idx) => (
                                                <div
                                                    key={idx}
                                                    className="text-xs font-medium py-1.5 px-3 rounded-lg bg-background border border-border/60 text-center text-primary flex items-center justify-center gap-2 shadow-2xs"
                                                >
                                                    {b.type === "cta_url" && <ExternalLink className="h-3.5 w-3.5" />}
                                                    {b.type === "cta_call" && <PhoneCall className="h-3.5 w-3.5" />}
                                                    {b.type === "cta_copy" && <Copy className="h-3.5 w-3.5" />}
                                                    {b.type === "single_select" && <ListFilter className="h-3.5 w-3.5" />}
                                                    {b.type === "quick_reply" && <MousePointerClick className="h-3.5 w-3.5" />}
                                                    <span>{b.displayText || b.buttonText || b.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full text-xs font-semibold gap-2 h-9"
                                        disabled={sendingPresetId !== null}
                                        onClick={() => handleTriggerTest(preset)}
                                    >
                                        {sendingPresetId === preset.id ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Mengirim ke {targetPhone}...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="h-3.5 w-3.5 text-amber-400" />
                                                Trigger Test Sekarang
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* TAB 2: Custom Builder */}
                <TabsContent value="custom">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Editor Form (7 cols) */}
                        <Card className="lg:col-span-7 border-border/60 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-primary" />
                                    Komposisi Pesan Interaktif
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Rancang pesan dengan teks custom dan kombinasi tombol native flow.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Header / Judul Pesan (Opsional)</Label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Contoh: Pengumuman Layanan"
                                        className="text-xs h-9"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Isi Pesan Utama / Body (Wajib)</Label>
                                    <Textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        placeholder="Ketik isi pesan interaktif..."
                                        rows={4}
                                        className="text-xs resize-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Footer Text (Opsional)</Label>
                                    <Input
                                        value={footer}
                                        onChange={(e) => setFooter(e.target.value)}
                                        placeholder="Contoh: Balas pesan ini untuk info lebih lanjut"
                                        className="text-xs h-9"
                                    />
                                </div>

                                {/* Dynamic Buttons */}
                                <div className="space-y-3 pt-3 border-t border-border/40">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-medium flex items-center gap-1.5">
                                            <MousePointerClick className="h-3.5 w-3.5 text-primary" />
                                            Daftar Tombol Interaktif ({buttons.length}/10)
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddButton}
                                            disabled={buttons.length >= 10}
                                            className="h-8 text-xs gap-1.5"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Tambah Tombol
                                        </Button>
                                    </div>

                                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                        {buttons.length === 0 && (
                                            <p className="text-xs text-muted-foreground text-center py-6 bg-muted/20 rounded-xl border border-dashed">
                                                Belum ada tombol. Klik "Tambah Tombol" untuk menambahkan.
                                            </p>
                                        )}
                                        {buttons.map((btn, index) => (
                                            <div
                                                key={btn.id}
                                                className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2.5 text-xs"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                                                        {index + 1}
                                                    </span>
                                                    <div className="w-36 shrink-0">
                                                        <Select
                                                            value={btn.type}
                                                            onValueChange={(val: ButtonType) =>
                                                                handleUpdateButton(btn.id, "type", val)
                                                            }
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="quick_reply">Quick Reply</SelectItem>
                                                                <SelectItem value="cta_url">Open URL</SelectItem>
                                                                <SelectItem value="cta_call">Call Phone</SelectItem>
                                                                <SelectItem value="cta_copy">Copy Code</SelectItem>
                                                                <SelectItem value="single_select">List Menu</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Input
                                                        value={btn.displayText}
                                                        onChange={(e) =>
                                                            handleUpdateButton(btn.id, "displayText", e.target.value)
                                                        }
                                                        placeholder="Label Tombol"
                                                        className="h-8 text-xs flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                                        onClick={() => handleRemoveButton(btn.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>

                                                <div className="pl-8">
                                                    {btn.type === "cta_url" && (
                                                        <Input
                                                            value={btn.value}
                                                            onChange={(e) =>
                                                                handleUpdateButton(btn.id, "value", e.target.value)
                                                            }
                                                            placeholder="https://example.com/promo"
                                                            className="h-8 text-xs"
                                                        />
                                                    )}
                                                    {btn.type === "cta_call" && (
                                                        <Input
                                                            value={btn.value}
                                                            onChange={(e) =>
                                                                handleUpdateButton(btn.id, "value", e.target.value)
                                                            }
                                                            placeholder="+6281234567890"
                                                            className="h-8 text-xs"
                                                        />
                                                    )}
                                                    {btn.type === "cta_copy" && (
                                                        <Input
                                                            value={btn.value}
                                                            onChange={(e) =>
                                                                handleUpdateButton(btn.id, "value", e.target.value)
                                                            }
                                                            placeholder="Kode yang akan disalin (contoh: DISKON50)"
                                                            className="h-8 text-xs"
                                                        />
                                                    )}
                                                    {btn.type === "quick_reply" && (
                                                        <Input
                                                            value={btn.value}
                                                            onChange={(e) =>
                                                                handleUpdateButton(btn.id, "value", e.target.value)
                                                            }
                                                            placeholder="ID Tombol (contoh: btn_confirm)"
                                                            className="h-8 text-xs"
                                                        />
                                                    )}
                                                    {btn.type === "single_select" && (
                                                        <Input
                                                            value={btn.value}
                                                            onChange={(e) =>
                                                                handleUpdateButton(btn.id, "value", e.target.value)
                                                            }
                                                            placeholder="Item dipisah koma (Opsi 1, Opsi 2, Opsi 3)"
                                                            className="h-8 text-xs"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Preview & Submit (5 cols) */}
                        <div className="lg:col-span-5 space-y-4">
                            <Card className="border-border/60 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-amber-500" />
                                        Live WhatsApp Mockup
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Pratinjau tampilan pesan interaktif di aplikasi WhatsApp penerima.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="bg-[#efeae2] dark:bg-[#0b141a] p-4 rounded-xl border border-border/50 flex flex-col justify-center items-center shadow-inner relative overflow-hidden min-h-[280px]">
                                        <div className="w-full max-w-xs bg-white dark:bg-[#1f2c34] rounded-2xl shadow-md border border-border/20 overflow-hidden text-left">
                                            <div className="p-3.5 space-y-1.5">
                                                {title && (
                                                    <h4 className="text-xs font-bold text-foreground leading-tight">
                                                        {title}
                                                    </h4>
                                                )}
                                                <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                                    {body || "Ketik isi pesan di formulir..."}
                                                </p>
                                                {footer && (
                                                    <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/20">
                                                        {footer}
                                                    </p>
                                                )}
                                                <div className="text-[9px] text-muted-foreground text-right mt-1">
                                                    12:00 PM ✓✓
                                                </div>
                                            </div>

                                            {buttons.length > 0 && (
                                                <div className="border-t border-border/30 divide-y divide-border/30 bg-muted/10">
                                                    {buttons.map((btn) => (
                                                        <div
                                                            key={btn.id}
                                                            className="py-2.5 px-3 text-center text-xs font-medium text-primary hover:bg-primary/5 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                                                        >
                                                            {btn.type === "cta_url" && <ExternalLink className="h-3.5 w-3.5" />}
                                                            {btn.type === "cta_call" && <PhoneCall className="h-3.5 w-3.5" />}
                                                            {btn.type === "cta_copy" && <Copy className="h-3.5 w-3.5" />}
                                                            {btn.type === "single_select" && <ListFilter className="h-3.5 w-3.5" />}
                                                            {btn.type === "quick_reply" && <MousePointerClick className="h-3.5 w-3.5" />}
                                                            <span className="truncate">{btn.displayText || "Tombol"}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <span className="text-[10px] text-muted-foreground mt-3">
                                            Native Flow Protocol Baileys
                                        </span>
                                    </div>

                                    <Button
                                        onClick={handleSendCustom}
                                        disabled={isSendingCustom}
                                        className="w-full mt-4 font-semibold text-xs gap-2 h-10"
                                    >
                                        {isSendingCustom ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Mengirim ke {targetPhone}...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Kirim Pesan Interaktif Custom
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Recent Activity Log */}
            {triggerLogs.length > 0 && (
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="py-3 px-6 border-b border-border/40">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <History className="h-4 w-4 text-muted-foreground" />
                            Riwayat Uji Coba Pengiriman
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/40 max-h-60 overflow-y-auto">
                            {triggerLogs.map((log) => (
                                <div key={log.id} className="px-6 py-3 flex items-center justify-between text-xs hover:bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        {log.status === "success" ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-destructive shrink-0" />
                                        )}
                                        <div>
                                            <span className="font-semibold text-foreground">{log.type}</span>
                                            <span className="text-muted-foreground mx-1.5">ke</span>
                                            <span className="font-mono text-foreground">{log.target}</span>
                                            {log.error && (
                                                <p className="text-[11px] text-destructive mt-0.5">{log.error}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">{log.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
