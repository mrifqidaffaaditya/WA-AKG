"use client";

import { useState, useEffect } from "react";
import { useSession as useSessionProvider } from "@/components/dashboard/session-provider";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCw, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const { data: authSession } = useSession();
    const { sessionId } = useSessionProvider();
    const isSuperAdmin = (authSession?.user as any)?.role === "SUPERADMIN" || (authSession?.user as any)?.role === "OWNER";

    const [config, setConfig] = useState({
        ghostMode: false,
        antiDelete: false,
        readReceipts: true,
    });
    const [loading, setLoading] = useState(false);

    const [systemConfig, setSystemConfig] = useState({
        appName: "WA-AKG",
        logoUrl: "",
        timezone: "Asia/Jakarta",
        enableRegistration: true
    });
    const [systemLoading, setSystemLoading] = useState(false);

    const [botConfig, setBotConfig] = useState({
        botName: "WA-AKG Bot",
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

    useEffect(() => {
        // Fetch System Config
        fetch('/api/settings/system').then(r => r.json()).then(data => {
            if (data && !data.error) {
                setSystemConfig({
                    appName: data.appName || "WA-AKG",
                    logoUrl: data.logoUrl || "",
                    timezone: data.timezone || "Asia/Jakarta",
                    enableRegistration: data.enableRegistration !== undefined ? data.enableRegistration : true
                });
            }
        });
    }, []);

    // Fetch Session and Bot Config
    useEffect(() => {
        if (!sessionId) return;
        fetch(`/api/sessions/${sessionId}/settings`)
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setConfig({
                        ghostMode: data.config?.ghostMode || false,
                        antiDelete: data.config?.antiDelete || false,
                        readReceipts: data.config?.readReceipts ?? true
                    });
                }
            });

        fetch(`/api/sessions/${sessionId}/bot-config`)
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setBotConfig(prev => ({ ...prev, ...data, removeBgApiKey: data.removeBgApiKey || "" }));
                }
            });
    }, [sessionId]);

    const handleSaveSystem = async () => {
        setSystemLoading(true);
        try {
            const res = await fetch('/api/settings/system', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(systemConfig)
            });

            if (res.ok) {
                toast.success("System settings updated. Refresh to see changes.");
            } else {
                toast.error("Failed to update system settings");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error saving system settings");
        } finally {
            setSystemLoading(false);
        }
    };

    const handleSaveBot = async () => {
        if (!sessionId) return;
        setBotLoading(true);
        try {
            const res = await fetch(`/api/sessions/${sessionId}/bot-config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(botConfig)
            });
            if (res.ok) {
                toast.success("Bot settings saved successfully");
            } else {
                toast.error("Failed to save bot settings");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error saving bot settings");
        } finally {
            setBotLoading(false);
        }
    };

    const handleSave = async () => {
        if (!sessionId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/sessions/${sessionId}/settings`, {
                method: "PATCH",
                body: JSON.stringify({ config })
            });
            if (res.ok) {
                toast.success("Settings saved successfully");
            } else {
                toast.error("Failed to save settings");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error saving settings");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>

            {!isSuperAdmin && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-900">View Only Mode</p>
                                <p className="text-xs text-yellow-700 mt-1">
                                    Only Superadmins can modify system settings. You can view current settings but cannot make changes.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* System Configuration (Global) */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-xl">App Configuration</CardTitle>
                    <CardDescription>Global settings for the application branding.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Application Name</Label>
                        <div className="flex gap-2">
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="WA-AKG"
                                value={systemConfig.appName}
                                onChange={(e) => setSystemConfig(prev => ({ ...prev, appName: e.target.value }))}
                                disabled={!isSuperAdmin}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Changes the name in the sidebar and browser title.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label>Timezone</Label>
                        <div className="flex gap-2">
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={systemConfig.timezone}
                                onChange={(e) => setSystemConfig(prev => ({ ...prev, timezone: e.target.value }))}
                                disabled={!isSuperAdmin}
                            >
                                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                                <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                                <option value="UTC">UTC</option>
                            </select>
                        </div>
                        <p className="text-xs text-muted-foreground">Scheduler will use this timezone to parse local times.</p>
                    </div>

                    <div className="flex items-center justify-between space-x-2 pt-2 border-t border-border/50">
                        <Label htmlFor="enable-registration" className="flex flex-col space-y-1">
                            <span>Enable User Registration</span>
                            <span className="font-normal text-xs text-muted-foreground">Allow new users to sign up for accounts. Turn off to keep the platform private.</span>
                        </Label>
                        <Switch
                            id="enable-registration"
                            checked={systemConfig.enableRegistration}
                            onCheckedChange={c => setSystemConfig(prev => ({ ...prev, enableRegistration: c }))}
                            disabled={!isSuperAdmin}
                        />
                    </div>

                    <div className="pt-2">
                        <Button onClick={handleSaveSystem} disabled={systemLoading || !isSuperAdmin}>
                            {systemLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Configuration
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* System Updates */}
            <Card>
                <CardHeader>
                    <CardTitle>System Updates</CardTitle>
                    <CardDescription>Check for the latest version from GitHub.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={async () => {
                            setSystemLoading(true);
                            try {
                                const res = await fetch("/api/system/check-updates", { method: "POST" });
                                const data = await res.json();
                                if (data.success) {
                                    toast.success(data.message || "Check complete!");
                                } else {
                                    toast.error(data.message || "Failed to check updates");
                                }
                            } catch (e) {
                                toast.error("Error checking updates");
                            } finally {
                                setSystemLoading(false);
                            }
                        }}
                        disabled={systemLoading}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${systemLoading ? 'animate-spin' : ''}`} />
                        Check for Updates
                    </Button>
                </CardContent>
            </Card>

            {/* Session Selected Gateway */}
            {!sessionId ? (
                <Card className="border-dashed border-2 bg-background/50">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <AlertCircle className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">No Session Selected</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            Please select an active WhatsApp session from the navigation bar above to configure its Bot, Auto Reply, and Privacy settings.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Bot & Auto Reply Configuration (Per Session) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Bot & Auto Reply Configuration</CardTitle>
                            <CardDescription>Manage automated features and commands for this session.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-2">
                                <Label>Bot Name</Label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="WA-AKG Bot"
                                    value={botConfig.botName}
                                    onChange={(e) => setBotConfig(prev => ({ ...prev, botName: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">The display name used by the bot in automated responses.</p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 pt-2">
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="enable-ping" className="flex flex-col space-y-1">
                                        <span>Ping Command</span>
                                        <span className="font-normal text-xs text-muted-foreground">Respond to /ping</span>
                                    </Label>
                                    <Switch
                                        id="enable-ping"
                                        checked={botConfig.enablePing}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, enablePing: c }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="enable-uptime" className="flex flex-col space-y-1">
                                        <span>Uptime Command</span>
                                        <span className="font-normal text-xs text-muted-foreground">Respond to /uptime</span>
                                    </Label>
                                    <Switch
                                        id="enable-uptime"
                                        checked={botConfig.enableUptime}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, enableUptime: c }))}
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="enable-sticker" className="flex flex-col space-y-1">
                                        <span>Image to Sticker</span>
                                        <span className="font-normal text-xs text-muted-foreground">Auto-convert images</span>
                                    </Label>
                                    <Switch
                                        id="enable-sticker"
                                        checked={botConfig.enableSticker}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, enableSticker: c }))}
                                    />
                                </div>
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="enable-video-sticker" className="flex flex-col space-y-1">
                                        <span>Video to Sticker</span>
                                        <span className="font-normal text-xs text-muted-foreground">Auto-convert short videos</span>
                                    </Label>
                                    <Switch
                                        id="enable-video-sticker"
                                        checked={botConfig.enableVideoSticker}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, enableVideoSticker: c }))}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2 border-t pt-4 border-border/50">
                                <Label>Remove.bg API Key (Optional)</Label>
                                <input
                                    type="password"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                <Switch
                                    id="ghost-mode"
                                    checked={config.ghostMode}
                                    onCheckedChange={c => setConfig({ ...config, ghostMode: c })}
                                />
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="anti-delete" className="flex flex-col space-y-1">
                                    <span>Anti-Delete</span>
                                    <span className="font-normal text-xs text-muted-foreground">Keep messages even if the sender deletes them for everyone.</span>
                                </Label>
                                <Switch
                                    id="anti-delete"
                                    checked={config.antiDelete}
                                    onCheckedChange={c => setConfig({ ...config, antiDelete: c })}
                                />
                            </div>

                            <div className="pt-4">
                                <Button onClick={handleSave} disabled={loading || !sessionId}>
                                    <Save className="mr-2 h-4 w-4" /> Save Configuration
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
