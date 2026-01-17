"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/dashboard/session-provider";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Bot, Wand2, Shield, Activity, Image as ImageIcon, MessageSquare } from "lucide-react";

interface BotConfig {
    id?: string;
    enabled: boolean;
    botName: string;
    botMode: 'ALL' | 'OWNER' | 'SPECIFIC';
    botAllowedJids: string[];
    autoReplyMode: 'ALL' | 'OWNER' | 'SPECIFIC';
    autoReplyAllowedJids: string[];
    enableSticker: boolean;
    enableVideoSticker: boolean;
    maxStickerDuration: number;
    enablePing: boolean;
    enableUptime: boolean;
    removeBgApiKey: string | null;
}

export default function BotSettingsPage() {
    const { sessionId: currentSessionId } = useSession();
    const [config, setConfig] = useState<BotConfig>({
        enabled: true,
        botName: "WA-AKG Bot",
        botMode: 'OWNER',
        botAllowedJids: [],
        autoReplyMode: 'ALL',
        autoReplyAllowedJids: [],
        enableSticker: true,
        enableVideoSticker: true,
        maxStickerDuration: 10,
        enablePing: true,
        enableUptime: true,
        removeBgApiKey: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Helpers to manage JID text area
    const [botJidsText, setBotJidsText] = useState("");
    const [autoReplyJidsText, setAutoReplyJidsText] = useState("");

    useEffect(() => {
        if (currentSessionId) {
            fetchConfig();
        }
    }, [currentSessionId]);

    const fetchConfig = async () => {
        if (!currentSessionId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/sessions/${currentSessionId}/bot-config`);
            if (res.ok) {
                const data = await res.json();
                setConfig({
                    ...data,
                    botName: data.botName || "WA-AKG Bot",
                    botMode: data.botMode || 'OWNER',
                    autoReplyMode: data.autoReplyMode || 'ALL',
                    botAllowedJids: Array.isArray(data.botAllowedJids) ? data.botAllowedJids : [],
                    autoReplyAllowedJids: Array.isArray(data.autoReplyAllowedJids) ? data.autoReplyAllowedJids : [],
                    enableVideoSticker: data.enableVideoSticker !== undefined ? data.enableVideoSticker : true,
                    maxStickerDuration: data.maxStickerDuration || 10,
                    removeBgApiKey: data.removeBgApiKey || ""
                });
                // Init text areas
                setBotJidsText((data.botAllowedJids || []).join('\n'));
                setAutoReplyJidsText((data.autoReplyAllowedJids || []).join('\n'));
            }
        } catch (error) {
            console.error("Failed to fetch config", error);
            toast.error("Failed to load bot settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!currentSessionId) return;
        setIsSaving(true);

        // Parse JIDs
        const botJids = botJidsText.split('\n').map(s => s.trim()).filter(Boolean);
        const autoReplyJids = autoReplyJidsText.split('\n').map(s => s.trim()).filter(Boolean);

        const payload = {
            ...config,
            botAllowedJids: botJids,
            autoReplyAllowedJids: autoReplyJids
        };

        try {
            const res = await fetch(`/api/sessions/${currentSessionId}/bot-config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to save");

            toast.success("Bot settings saved successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SessionGuard>
            {/* Note: SessionGuard handles the no session state, so we can assume currentSessionId exists in logic, but TS might complain so we keep safe checks if needed or rely on guard blocking it */}
            {isLoading ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="container max-w-4xl py-6 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Bot Magic Settings 🪄</h1>
                            <p className="text-muted-foreground">
                                Configure your WhatsApp Bot features and "Magic Commands".
                            </p>
                        </div>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>

                    <div className="grid gap-6">
                        {/* Main Switch */}
                        <Card className={config.enabled ? "border-primary/50 bg-primary/5" : ""}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">Enable Bot Features</CardTitle>
                                    <CardDescription>
                                        Turn on/off all magic commands for this session.
                                    </CardDescription>
                                </div>
                                <Switch
                                    checked={config.enabled}
                                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
                                />
                            </CardHeader>
                        </Card>

                        {/* Bot Identity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Bot className="h-5 w-5" /> Bot Identity
                                </CardTitle>
                                <CardDescription>
                                    Customize how your bot identifies itself.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Bot Name</Label>
                                    <Input
                                        placeholder="e.g. WA-AKG Bot"
                                        value={config.botName || ""}
                                        onChange={(e) => setConfig(prev => ({ ...prev, botName: e.target.value }))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Displayed in stickermaker watermarks and help menus.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Access Control */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield className="h-5 w-5" /> Access Control
                                </CardTitle>
                                <CardDescription>
                                    Who can use the bot and trigger auto-replies?
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Bot Commands */}
                                <div className="space-y-4">
                                    <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:items-center md:justify-between">
                                        <Label className="text-base flex items-center gap-2">
                                            <Bot className="h-4 w-4" /> Bot Commands Access
                                        </Label>
                                        <Select
                                            value={config.botMode}
                                            onValueChange={(val: any) => setConfig(prev => ({ ...prev, botMode: val }))}
                                        >
                                            <SelectTrigger className="w-full md:w-[200px]">
                                                <SelectValue placeholder="Select Mode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="OWNER">Owner Only (Me)</SelectItem>
                                                <SelectItem value="ALL">Public (Everyone)</SelectItem>
                                                <SelectItem value="SPECIFIC">Specific Contacts</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Controls who can use commands like <code>#sticker</code>, <code>#ping</code>.
                                    </p>

                                    {config.botMode === 'SPECIFIC' && (
                                        <div className="ml-1 pl-4 border-l-2 border-slate-200 space-y-2">
                                            <Label>Allowed JIDs (one per line)</Label>
                                            <Textarea
                                                placeholder="628123456789@s.whatsapp.net"
                                                value={botJidsText}
                                                onChange={(e) => setBotJidsText(e.target.value)}
                                                className="font-mono text-sm max-h-[150px]"
                                            />
                                            <p className="text-xs text-muted-foreground">Enter specific WhatsApp IDs (JIDs) allowed to use the bot.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t" />

                                {/* Auto Reply */}
                                <div className="space-y-4">
                                    <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:items-center md:justify-between">
                                        <Label className="text-base flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" /> Auto Reply Access
                                        </Label>
                                        <Select
                                            value={config.autoReplyMode}
                                            onValueChange={(val: any) => setConfig(prev => ({ ...prev, autoReplyMode: val }))}
                                        >
                                            <SelectTrigger className="w-full md:w-[200px]">
                                                <SelectValue placeholder="Select Mode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">Everyone (Public)</SelectItem>
                                                <SelectItem value="OWNER">Owner Only (Me)</SelectItem>
                                                <SelectItem value="SPECIFIC">Specific Contacts</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Controls whose messages trigger Auto Replies.
                                    </p>

                                    {config.autoReplyMode === 'SPECIFIC' && (
                                        <div className="ml-1 pl-4 border-l-2 border-slate-200 space-y-2">
                                            <Label>Allowed JIDs (one per line)</Label>
                                            <Textarea
                                                placeholder="628123456789@s.whatsapp.net"
                                                value={autoReplyJidsText}
                                                onChange={(e) => setAutoReplyJidsText(e.target.value)}
                                                className="font-mono text-sm max-h-[150px]"
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Wand2 className="h-5 w-5" /> Enabled Features
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-3 gap-6">
                                <div className="flex items-center justify-between md:block md:space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" /> Sticker (#sticker)
                                    </Label>
                                    <Switch
                                        checked={config.enableSticker}
                                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableSticker: checked }))}
                                    />
                                </div>

                                <div className="space-y-3 p-3 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-2 font-medium">
                                            <ImageIcon className="h-4 w-4" /> Enable Video/GIF
                                        </Label>
                                        <Switch
                                            checked={config.enableSticker && config.enableVideoSticker}
                                            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableVideoSticker: checked }))}
                                            disabled={!config.enableSticker}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <Label className="text-xs text-muted-foreground whitespace-nowrap">
                                            Max Duration
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min={1}
                                                max={60}
                                                className="h-8 w-20 text-right"
                                                value={config.maxStickerDuration || ""}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setConfig(prev => ({
                                                        ...prev,
                                                        maxStickerDuration: val === "" ? 0 : parseInt(val)
                                                    }));
                                                }}
                                                disabled={!config.enableVideoSticker}
                                            />
                                            <span className="text-xs text-muted-foreground">sec</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:block md:space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Activity className="h-4 w-4" /> Ping (#ping)
                                    </Label>
                                    <Switch
                                        checked={config.enablePing}
                                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enablePing: checked }))}
                                    />
                                </div>

                                <div className="flex items-center justify-between md:block md:space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4" /> Uptime (#uptime)
                                    </Label>
                                    <Switch
                                        checked={config.enableUptime}
                                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableUptime: checked }))}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Integrations (RemoveBG) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Shield className="h-5 w-5" /> Integrations
                                </CardTitle>
                                <CardDescription>
                                    Configure external keys for enhanced features.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Remove.bg API Key</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="password"
                                            placeholder="rb_xxxxxxxxxxxxxxxx"
                                            value={config.removeBgApiKey || ""}
                                            onChange={(e) => setConfig(prev => ({ ...prev, removeBgApiKey: e.target.value }))}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Required for background removal features. Get one at <a href="https://www.remove.bg/api" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">remove.bg</a>.
                                        <br />Command: <code>#sticker nobg</code>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </SessionGuard>
    );
}
