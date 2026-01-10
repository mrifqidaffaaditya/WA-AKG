"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/dashboard/session-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Bot, Wand2, Shield, Activity, Image as ImageIcon } from "lucide-react";

interface BotConfig {
    id?: string;
    enabled: boolean;
    publicMode: boolean;
    enableSticker: boolean;
    enablePing: boolean;
    enableUptime: boolean;
    removeBgApiKey: string | null;
}

export default function BotSettingsPage() {
    const { sessionId: currentSessionId } = useSession();
    const [config, setConfig] = useState<BotConfig>({
        enabled: true,
        publicMode: false,
        enableSticker: true,
        enablePing: true,
        enableUptime: true,
        removeBgApiKey: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
                    removeBgApiKey: data.removeBgApiKey || ""
                });
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
        try {
            const res = await fetch(`/api/sessions/${currentSessionId}/bot-config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
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

    if (!currentSessionId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <Bot className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold">No Session Selected</h2>
                <p className="text-muted-foreground">Please select a session to configure bot settings.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
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

                {/* Features */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Wand2 className="h-5 w-5" /> Features & Access
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Public Mode */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Public Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                    If enabled, <strong>anyone</strong> can use bot commands. If disabled, only <strong>you</strong> (the sender) can use them.
                                </p>
                            </div>
                            <Switch
                                checked={config.publicMode}
                                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, publicMode: checked }))}
                            />
                        </div>

                        <div className="border-t" />

                        {/* Individual Features */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="flex items-center justify-between md:block md:space-y-2">
                                <Label className="flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" /> Sticker (#sticker)
                                </Label>
                                <Switch
                                    checked={config.enableSticker}
                                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableSticker: checked }))}
                                />
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
                                Required for background removal features. Get one at <a href="https://www.remove.bg/api" target="_blank" className="underline hover:text-primary">remove.bg</a>.
                                <br />Command: <code>#sticker nobg</code>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
