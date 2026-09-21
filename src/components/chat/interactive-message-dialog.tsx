"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
    Loader2,
    HelpCircle,
    Layers
} from "lucide-react";
import { toast } from "sonner";

interface InteractiveMessageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sessionId: string;
    jid: string;
    recipientName?: string;
    onSuccess?: () => void;
}

export type ButtonType = "quick_reply" | "cta_url" | "cta_call" | "cta_copy" | "single_select";

export interface InteractiveButtonItem {
    id: string;
    type: ButtonType;
    displayText: string;
    value: string; // url, phone, copy text, or id
}

export function InteractiveMessageDialog({
    open,
    onOpenChange,
    sessionId,
    jid,
    recipientName,
    onSuccess,
}: InteractiveMessageDialogProps) {
    const [activeTab, setActiveTab] = useState("presets");
    const [sendingPreset, setSendingPreset] = useState<string | null>(null);

    // Custom composer state
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("Halo! Terima kasih telah menghubungi kami. Silakan pilih opsi di bawah ini:");
    const [footer, setFooter] = useState("Otomasi Pesan WhatsApp");
    const [buttons, setButtons] = useState<InteractiveButtonItem[]>([
        { id: "1", type: "quick_reply", displayText: "Konfirmasi Pesanan", value: "confirm_order" },
        { id: "2", type: "cta_url", displayText: "Kunjungi Website", value: "https://google.com" },
    ]);
    const [submittingCustom, setSubmittingCustom] = useState(false);

    const displayName = recipientName || jid.split("@")[0];

    // Presets definition
    const presets = [
        {
            id: "quick_reply",
            title: "Quick Reply Buttons",
            subtitle: "3 Tombol Respon Cepat",
            description: "Mengirim pesan interaktif dengan tombol respon instan (Ya, Tidak, Bantuan).",
            badge: "Paling Populer",
            payload: {
                title: "Konfirmasi Layanan",
                body: `Halo kak ${displayName}! Apakah Anda ingin melanjutkan transaksi dan mengonfirmasi pesanan hari ini?`,
                footer: "Balas dengan memilih salah satu tombol",
                buttons: [
                    { type: "quick_reply", displayText: "✅ Ya, Lanjutkan", id: "btn_yes" },
                    { type: "quick_reply", displayText: "❌ Batalkan", id: "btn_no" },
                    { type: "quick_reply", displayText: "💬 Tanya CS", id: "btn_cs" }
                ]
            }
        },
        {
            id: "cta_actions",
            title: "Call To Action (CTA)",
            subtitle: "Link Web, Telepon & Salin Kode",
            description: "Mengirim tombol aksi native: membuka link web, menelpon nomor telepon, dan menyalin kode promo.",
            badge: "Multi-Aksi",
            payload: {
                title: "Promo Spesial Hari Ini! 🎉",
                body: "Dapatkan diskon potongan hingga 50% untuk pesanan Anda. Gunakan kode promo eksklusif berikut sebelum habis!",
                footer: "Syarat & ketentuan berlaku",
                buttons: [
                    { type: "cta_url", displayText: "🌐 Kunjungi Website", url: "https://google.com" },
                    { type: "cta_call", displayText: "📞 Hubungi Support", phoneNumber: "+628123456789" },
                    { type: "cta_copy", displayText: "📋 Salin Kode: DISKON50", copyCode: "DISKON50" }
                ]
            }
        },
        {
            id: "single_select",
            title: "Interactive List Menu",
            subtitle: "Dropdown Menu Pilihan",
            description: "Mengirim tombol menu yang membuka daftar pilihan/kategori (single select).",
            badge: "Katalog",
            payload: {
                title: "Katalog Layanan Kami",
                body: "Pilih salah satu menu atau layanan yang ingin Anda ketahui lebih detail melalui tombol menu di bawah:",
                footer: "Pilih dari daftar menu",
                buttons: [
                    {
                        type: "single_select",
                        title: "Daftar Layanan",
                        buttonText: "📋 Buka Pilihan Menu",
                        sections: [
                            {
                                title: "Layanan Utama",
                                rows: [
                                    { id: "srv_wa", title: "WhatsApp Gateway", description: "Layanan broadcast & otomasi chat" },
                                    { id: "srv_bot", title: "Smart Chatbot AI", description: "Otomasi customer service 24/7" }
                                ]
                            },
                            {
                                title: "Bantuan & Dukungan",
                                rows: [
                                    { id: "srv_faq", title: "FAQ & Panduan", description: "Pertanyaan yang sering diajukan" },
                                    { id: "srv_agent", title: "Bicara dengan Agen", description: "Terhubung langsung dengan staf CS" }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        {
            id: "announcement",
            title: "Pengumuman & Feedback",
            subtitle: "Header Card & Feedback",
            description: "Pesan kartu pengumuman dengan judul besar, teks isi, dan tombol konfirmasi.",
            badge: "Pengumuman",
            payload: {
                title: "📢 PEMBERITAHUAN SISTEM",
                body: "Halo, sistem kami akan melakukan pemeliharaan rutin pada malam ini pukul 23:00 WIB. Terima kasih atas pengertian Anda.",
                footer: "Pusat Informasi Otomasi",
                buttons: [
                    { type: "quick_reply", displayText: "👍 Mengerti", id: "ack_ok" },
                    { type: "cta_url", displayText: "📖 Baca Catatan Rilis", url: "https://google.com" }
                ]
            }
        }
    ];

    const handleSendPreset = async (preset: typeof presets[0]) => {
        setSendingPreset(preset.id);
        try {
            toast.info(`Mengirim test "${preset.title}" ke ${displayName}...`);
            const res = await fetch(`/api/messages/${sessionId}/${encodeURIComponent(jid)}/interactive`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(preset.payload)
            });
            const data = await res.json();
            if (!res.ok || !data.status) {
                throw new Error(data.message || data.error || "Gagal mengirim pesan interaktif");
            }
            toast.success(`Berhasil! Pesan interaktif telah dikirim ke ${displayName}`);
            onSuccess?.();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Test trigger error:", error);
            toast.error(error.message || "Gagal mengirim pesan interaktif");
        } finally {
            setSendingPreset(null);
        }
    };

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
                // Set sensible default value when type changes
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
        if (!body.trim() && !title.trim()) {
            toast.error("Isi pesan atau judul wajib diisi");
            return;
        }

        setSubmittingCustom(true);
        try {
            // Transform buttons into API payload structure
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

            const res = await fetch(`/api/messages/${sessionId}/${encodeURIComponent(jid)}/interactive`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim() || undefined,
                    body: body.trim(),
                    footer: footer.trim() || undefined,
                    buttons: formattedButtons
                })
            });

            const data = await res.json();
            if (!res.ok || !data.status) {
                throw new Error(data.message || data.error || "Gagal mengirim pesan interaktif");
            }

            toast.success("Pesan interaktif berhasil dikirim!");
            onSuccess?.();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Custom interactive send error:", error);
            toast.error(error.message || "Gagal mengirim pesan interaktif");
        } finally {
            setSubmittingCustom(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border border-border/60 shadow-2xl">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/5 via-background to-background">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-semibold flex items-center gap-2">
                                    Interactive Message & Test Trigger
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Kirim pesan WhatsApp Native Flow interaktif ke <span className="font-semibold text-foreground">{displayName}</span>
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 pt-3 pb-1 border-b bg-muted/20">
                        <TabsList className="grid grid-cols-2 w-full max-w-sm">
                            <TabsTrigger value="presets" className="text-xs flex items-center gap-2">
                                <Zap className="h-3.5 w-3.5 text-amber-500" />
                                1-Click Test Triggers
                            </TabsTrigger>
                            <TabsTrigger value="custom" className="text-xs flex items-center gap-2">
                                <Layers className="h-3.5 w-3.5 text-blue-500" />
                                Custom Builder
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* TAB 1: 1-Click Test Triggers */}
                    <TabsContent value="presets" className="flex-1 overflow-y-auto p-6 space-y-4 m-0">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
                            <Zap className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div>
                                <p className="font-semibold">Uji Langsung Tombol Interaktif WhatsApp</p>
                                <p className="text-muted-foreground mt-0.5">
                                    Klik tombol <span className="font-medium text-foreground">"Trigger Test Sekarang"</span> pada salah satu template berikut untuk menguji penerimaan tombol di nomor penerima.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {presets.map((preset) => (
                                <div
                                    key={preset.id}
                                    className="rounded-xl border border-border/60 bg-card p-4 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all group"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                                {preset.title}
                                            </h4>
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                                {preset.badge}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground mb-2">{preset.subtitle}</p>
                                        <p className="text-xs text-muted-foreground/80 leading-relaxed mb-3">
                                            {preset.description}
                                        </p>

                                        {/* Mock preview buttons */}
                                        <div className="bg-muted/40 rounded-lg p-2.5 mb-4 border border-border/30 space-y-1.5">
                                            <p className="text-[11px] font-medium text-foreground line-clamp-2">
                                                {preset.payload.body}
                                            </p>
                                            <div className="pt-1.5 border-t border-border/40 space-y-1">
                                                {preset.payload.buttons.map((b: any, i) => (
                                                    <div
                                                        key={i}
                                                        className="text-[10px] font-medium py-1 px-2 rounded bg-background/80 border border-border/50 text-center text-primary flex items-center justify-center gap-1.5 shadow-2xs"
                                                    >
                                                        {b.type === "cta_url" && <ExternalLink className="h-3 w-3" />}
                                                        {b.type === "cta_call" && <PhoneCall className="h-3 w-3" />}
                                                        {b.type === "cta_copy" && <Copy className="h-3 w-3" />}
                                                        {b.type === "single_select" && <ListFilter className="h-3 w-3" />}
                                                        {b.type === "quick_reply" && <MousePointerClick className="h-3 w-3" />}
                                                        <span>{b.displayText || b.buttonText || b.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        className="w-full text-xs font-semibold gap-2"
                                        disabled={sendingPreset !== null}
                                        onClick={() => handleSendPreset(preset)}
                                    >
                                        {sendingPreset === preset.id ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="h-3.5 w-3.5 text-amber-400" />
                                                Trigger Test Sekarang
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* TAB 2: Custom Builder */}
                    <TabsContent value="custom" className="flex-1 overflow-y-auto p-6 m-0">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Editor Left Column (7 cols) */}
                            <div className="lg:col-span-7 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Header / Judul (Opsional)</Label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Contoh: Pengumuman Layanan"
                                        className="text-xs h-9"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium">Isi Pesan / Body (Wajib)</Label>
                                    <Textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        placeholder="Tuliskan isi pesan Anda di sini..."
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
                                <div className="space-y-2 pt-2 border-t border-border/40">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-medium flex items-center gap-1.5">
                                            <MousePointerClick className="h-3.5 w-3.5 text-primary" />
                                            Tombol Aksi ({buttons.length}/10)
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddButton}
                                            disabled={buttons.length >= 10}
                                            className="h-7 text-xs gap-1.5"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Tambah Tombol
                                        </Button>
                                    </div>

                                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                                        {buttons.length === 0 && (
                                            <p className="text-xs text-muted-foreground text-center py-4 bg-muted/20 rounded-lg border border-dashed">
                                                Belum ada tombol. Klik "Tambah Tombol" di atas.
                                            </p>
                                        )}
                                        {buttons.map((btn, index) => (
                                            <div
                                                key={btn.id}
                                                className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2 text-xs"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center shrink-0">
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

                                                {/* Button parameter input based on type */}
                                                <div className="pl-7">
                                                    {btn.type === "cta_url" && (
                                                        <Input
                                                            value={btn.value}
                                                            onChange={(e) =>
                                                                handleUpdateButton(btn.id, "value", e.target.value)
                                                            }
                                                            placeholder="https://example.com/promo"
                                                            className="h-7 text-[11px]"
                                                        />
                                                    )}
                                                    {btn.type === "cta_call" && (
                                                        <Input
                                                            value={btn.value}
                                                            onChange={(e) =>
                                                                handleUpdateButton(btn.id, "value", e.target.value)
                                                            }
                                                            placeholder="+6281234567890"
                                                            className="h-7 text-[11px]"
                                                        />
                                                    )}
                                                    {btn.type === "cta_copy" && (
                                                        <Input
                                                            value={btn.value}
                                                            onChange={(e) =>
                                                                handleUpdateButton(btn.id, "value", e.target.value)
                                                            }
                                                            placeholder="Kode yang akan disalin (contoh: DISKON50)"
                                                            className="h-7 text-[11px]"
                                                        />
                                                    )}
                                                    {btn.type === "quick_reply" && (
                                                        <Input
                                                            value={btn.value}
                                                            onChange={(e) =>
                                                                handleUpdateButton(btn.id, "value", e.target.value)
                                                            }
                                                            placeholder="ID Tombol (contoh: btn_confirm)"
                                                            className="h-7 text-[11px]"
                                                        />
                                                    )}
                                                    {btn.type === "single_select" && (
                                                        <Input
                                                            value={btn.value}
                                                            onChange={(e) =>
                                                                handleUpdateButton(btn.id, "value", e.target.value)
                                                            }
                                                            placeholder="Item dipisah koma (Opsi 1, Opsi 2, Opsi 3)"
                                                            className="h-7 text-[11px]"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Preview Right Column (5 cols) */}
                            <div className="lg:col-span-5 flex flex-col">
                                <Label className="text-xs font-medium mb-2 flex items-center gap-1.5 text-muted-foreground">
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                    Live WhatsApp Preview
                                </Label>

                                {/* WhatsApp bubble mockup */}
                                <div className="flex-1 bg-[#efeae2] dark:bg-[#0b141a] p-4 rounded-xl border border-border/50 flex flex-col justify-center items-center shadow-inner relative overflow-hidden min-h-[300px]">
                                    <div className="w-full max-w-xs bg-white dark:bg-[#1f2c34] rounded-2xl shadow-md border border-border/20 overflow-hidden text-left">
                                        <div className="p-3.5 space-y-1.5">
                                            {title && (
                                                <h4 className="text-xs font-bold text-foreground leading-tight">
                                                    {title}
                                                </h4>
                                            )}
                                            <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                                {body || "Ketik isi pesan di sebelah kiri..."}
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

                                        {/* Buttons attached at bottom */}
                                        {buttons.length > 0 && (
                                            <div className="border-t border-border/30 divide-y divide-border/30 bg-muted/10">
                                                {buttons.map((btn) => (
                                                    <div
                                                        key={btn.id}
                                                        className="py-2 px-3 text-center text-xs font-medium text-primary hover:bg-primary/5 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
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
                                        Native Flow UI WhatsApp Client
                                    </span>
                                </div>

                                <Button
                                    onClick={handleSendCustom}
                                    disabled={submittingCustom}
                                    className="w-full mt-4 font-semibold text-xs gap-2"
                                >
                                    {submittingCustom ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Mengirim Pesan...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Kirim Pesan Interaktif
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
