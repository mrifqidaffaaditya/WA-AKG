"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/dashboard/session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const { sessionId } = useSession();
    const [config, setConfig] = useState({
        ghostMode: false,
        antiDelete: false,
        readReceipts: true,
    });
    const [loading, setLoading] = useState(false);

    const [systemConfig, setSystemConfig] = useState({
        appName: "WA-AKG",
        logoUrl: "",
        timezone: "Asia/Jakarta"
    });
    const [systemLoading, setSystemLoading] = useState(false);

    useEffect(() => {
        // Fetch System Config
        fetch('/api/settings/system').then(r => r.json()).then(data => {
            if (data && !data.error) {
                setSystemConfig({
                    appName: data.appName || "WA-AKG",
                    logoUrl: data.logoUrl || "",
                    timezone: data.timezone || "Asia/Jakarta"
                });
            }
        });
    }, []);

    // ... existing useEffect for session config ...

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
                            >
                                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                                <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                                <option value="UTC">UTC</option>
                            </select>
                            <Button onClick={handleSaveSystem} disabled={systemLoading}>
                                {systemLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Scheduler will use this timezone to parse local times.</p>
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
        </div>
    );
}
