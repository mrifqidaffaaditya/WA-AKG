"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RefreshCw, Send, Users } from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@/components/dashboard/session-provider";

export default function BroadcastPage() {
    const { sessionId } = useSession();
    const [contacts, setContacts] = useState(""); // Raw text input
    const [message, setMessage] = useState("");
    const [delay, setDelay] = useState([2000]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!sessionId) return alert("No active session found");
        setLoading(true);

        try {
            // Parse contacts
            const recipients = contacts.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).map(s => {
                // Formatting helper: ensure ends with @s.whatsapp.net if just number
                if (!s.includes('@')) return `${s}@s.whatsapp.net`;
                return s;
            });

            const res = await fetch("/api/messages/broadcast", {
                method: "POST",
                body: JSON.stringify({
                    sessionId,
                    recipients,
                    message: message, // Send as string, API handles conversion
                    delay: delay[0]
                })
            });

            if (res.ok) {
                toast.success("Broadcast started!");
                setContacts("");
                setMessage("");
            } else {
                toast.error("Failed to start broadcast");
            }

        } catch (e) {
            console.error(e);
            toast.error("Error sending broadcast");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Broadcast / Blast</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recipients</CardTitle>
                        <CardDescription>Enter phone numbers separated by comma or new line.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Target Numbers (e.g., 628123456789)</Label>
                            <Textarea
                                placeholder="628123456789&#10;628987654321"
                                className="min-h-[200px]"
                                value={contacts}
                                onChange={e => setContacts(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">{contacts.split(/[\n,]+/).filter(Boolean).length} numbers identified</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Message Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea
                                placeholder="Type your message here..."
                                className="min-h-[150px]"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Delay (ms): {delay[0]}</Label>
                                <Slider
                                    defaultValue={[2000]}
                                    max={10000}
                                    step={100}
                                    value={delay}
                                    onValueChange={setDelay}
                                />
                                <p className="text-xs text-muted-foreground">Randomized delay to prevent ban.</p>
                            </div>

                            <Button className="w-full" onClick={handleSend} disabled={loading || !sessionId}>
                                {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Start Broadcast
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
