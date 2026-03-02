"use client";

import { useState, useEffect } from "react";
import { useSession as useSessionProvider } from "@/components/dashboard/session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { RefreshCw, Save, AlertCircle, Bot } from "lucide-react";
import { toast } from "sonner";

export default function BotSettingsPage() {
    const { sessionId } = useSessionProvider();

    const [botConfig, setBotConfig] = useState({
        botName: "WA-AKG Bot",
        prefix: "#",
        enableSticker: true,
        enableVideoSticker: true,
        maxStickerDuration: 10,
        enablePing: true,
        enableUptime: true,
        removeBgApiKey: "",
        botMode: "OWNER",
        autoReplyMode: "ALL"
    });
    const [botLoading, setBotLoading] = useState(false);

    const [privacyConfig, setPrivacyConfig] = useState({
        ghostMode: false,
        antiDelete: false,
        readReceipts: true,
    });
    const [privacyLoading, setPrivacyLoading] = useState(false);

    useEffect(() => {
        if (!sessionId) return;

        fetch(`/api/sessions/${sessionId}/bot-config`)
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(responseData => {
                const data = responseData?.data;
                if (data && !responseData.error) {
                    setBotConfig(prev => ({ ...prev, ...data, removeBgApiKey: data.removeBgApiKey || "", prefix: data.prefix || "#" }));
                }
            })
            .catch(() => { });

        fetch(`/api/sessions/${sessionId}/settings`)
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(responseData => {
                const data = responseData?.data;
                if (data && !responseData.error) {
                    setPrivacyConfig({
                        ghostMode: data.config?.ghostMode || false,
                        antiDelete: data.config?.antiDelete || false,
                        readReceipts: data.config?.readReceipts ?? true
                    });
                }
            })
            .catch(() => { });
    }, [sessionId]);

    const handleSaveBot = async () => {
        if (!sessionId) return;
        setBotLoading(true);
        try {
            const res = await fetch(`/api/sessions/${sessionId}/bot-config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(botConfig)
            });
            if (res.ok) toast.success("Bot settings saved successfully");
            else toast.error("Failed to save bot settings");
        } catch (e) {
            console.error(e);
            toast.error("Error saving bot settings");
        } finally {
            setBotLoading(false);
        }
    };

    const handleSavePrivacy = async () => {
        if (!sessionId) return;
        setPrivacyLoading(true);
        try {
            const res = await fetch(`/api/sessions/${sessionId}/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ config: privacyConfig })
            });
            if (res.ok) toast.success("Privacy settings saved");
            else toast.error("Failed to save privacy settings");
        } catch (e) {
            console.error(e);
            toast.error("Error saving privacy settings");
        } finally {
            setPrivacyLoading(false);
        }
    };

    const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Bot Settings</h2>
                <p className="text-muted-foreground text-sm mt-1">Configure bot features and session privacy for the active WhatsApp session.</p>
            </div>

            {/* No Session Selected */}
            {!sessionId ? (
                <Card className="border-dashed border-2 bg-background/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Bot className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">No Session Selected</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            Please select an active WhatsApp session from the navigation bar above to configure its Bot and Privacy settings.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Bot & Auto Reply Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Bot & Auto Reply Configuration</CardTitle>
                            <CardDescription>Manage automated features and commands for this session.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-2">
                                <Label>Bot Name</Label>
                                <input
                                    className={inputClass}
                                    placeholder="WA-AKG Bot"
                                    value={botConfig.botName}
                                    onChange={(e) => setBotConfig(prev => ({ ...prev, botName: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">The display name used by the bot in automated responses.</p>
                            </div>

                            <div className="grid gap-2">
                                <Label>Command Prefix</Label>
                                <Input
                                    className="max-w-[100px]"
                                    placeholder="#"
                                    maxLength={3}
                                    value={botConfig.prefix}
                                    onChange={(e) => setBotConfig(prev => ({ ...prev, prefix: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">The prefix character for bot commands (e.g. <code className="bg-muted px-1 rounded">#sticker</code>, <code className="bg-muted px-1 rounded">#ping</code>). Default: <code className="bg-muted px-1 rounded">#</code></p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 pt-2">
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="enable-ping" className="flex flex-col space-y-1">
                                        <span>Ping Command</span>
                                        <span className="font-normal text-xs text-muted-foreground">Respond to /ping</span>
                                    </Label>
                                    <Switch id="enable-ping" checked={botConfig.enablePing}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, enablePing: c }))} />
                                </div>
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="enable-uptime" className="flex flex-col space-y-1">
                                        <span>Uptime Command</span>
                                        <span className="font-normal text-xs text-muted-foreground">Respond to /uptime</span>
                                    </Label>
                                    <Switch id="enable-uptime" checked={botConfig.enableUptime}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, enableUptime: c }))} />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="enable-sticker" className="flex flex-col space-y-1">
                                        <span>Image to Sticker</span>
                                        <span className="font-normal text-xs text-muted-foreground">Auto-convert images</span>
                                    </Label>
                                    <Switch id="enable-sticker" checked={botConfig.enableSticker}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, enableSticker: c }))} />
                                </div>
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="enable-video-sticker" className="flex flex-col space-y-1">
                                        <span>Video to Sticker</span>
                                        <span className="font-normal text-xs text-muted-foreground">Auto-convert short videos</span>
                                    </Label>
                                    <Switch id="enable-video-sticker" checked={botConfig.enableVideoSticker}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, enableVideoSticker: c }))} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Max Sticker Video Duration: <strong>{botConfig.maxStickerDuration}s</strong></Label>
                                <Slider
                                    value={[botConfig.maxStickerDuration]}
                                    onValueChange={([v]) => setBotConfig(prev => ({ ...prev, maxStickerDuration: v }))}
                                    min={3}
                                    max={30}
                                    step={1}
                                />
                                <p className="text-xs text-muted-foreground">Maximum video duration (in seconds) allowed for sticker conversion. Longer videos = larger file sizes.</p>
                            </div>

                            <div className="grid gap-2 border-t pt-4 border-border/50">
                                <Label>Remove.bg API Key (Optional)</Label>
                                <input
                                    type="password"
                                    className={inputClass}
                                    placeholder="Enter your Remove.bg API Key"
                                    value={botConfig.removeBgApiKey || ""}
                                    onChange={(e) => setBotConfig(prev => ({ ...prev, removeBgApiKey: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">Enables background removal for stickers (e.g. /sticker nocrop).</p>
                            </div>

                            <div className="pt-2">
                                <Button onClick={handleSaveBot} disabled={botLoading || !sessionId}>
                                    {botLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Bot Configuration
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Privacy & Utility */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Privacy & Utility</CardTitle>
                            <CardDescription>Configure ghost mode and other features for your active session.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="ghost-mode" className="flex flex-col space-y-1">
                                    <span>Ghost Mode</span>
                                    <span className="font-normal text-xs text-muted-foreground">View status and read messages without sending blue ticks.</span>
                                </Label>
                                <Switch id="ghost-mode" checked={privacyConfig.ghostMode}
                                    onCheckedChange={c => setPrivacyConfig(prev => ({ ...prev, ghostMode: c }))} />
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="anti-delete" className="flex flex-col space-y-1">
                                    <span>Anti-Delete</span>
                                    <span className="font-normal text-xs text-muted-foreground">Keep messages even if the sender deletes them for everyone.</span>
                                </Label>
                                <Switch id="anti-delete" checked={privacyConfig.antiDelete}
                                    onCheckedChange={c => setPrivacyConfig(prev => ({ ...prev, antiDelete: c }))} />
                            </div>

                            <div className="pt-4">
                                <Button onClick={handleSavePrivacy} disabled={privacyLoading || !sessionId}>
                                    {privacyLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Privacy Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
