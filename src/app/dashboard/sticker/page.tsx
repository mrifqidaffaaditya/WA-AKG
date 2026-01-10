"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw, Send, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { useSession } from "@/components/dashboard/session-provider";
import { SessionGuard } from "@/components/dashboard/session-guard";

export default function StickerPage() {
    const { sessionId } = useSession();
    const [target, setTarget] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!sessionId || !target || !file) return alert("Please fill all fields");

        let jid = target.includes('@') ? target : `${target}@s.whatsapp.net`;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("sessionId", sessionId);
            formData.append("jid", jid);
            formData.append("file", file);

            const res = await fetch("/api/messages/sticker", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                toast.success("Sticker sent!"); // Changed alert to toast.success
                setFile(null);
                setTarget(""); // Added setTarget("") to clear the target input
            } else {
                const err = await res.json(); // Added to parse error response
                toast.error(err.error || "Failed to send sticker"); // Changed alert to toast.error
            }
        } catch (e) {
            console.error(e);
            toast.error("Error sending sticker"); // Changed alert to toast.error
        } finally {
            setLoading(false);
        }
    };

    return (
        <SessionGuard>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold tracking-tight">Sticker Maker</h2>
                </div>

                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Create & Send Sticker</CardTitle>
                        <CardDescription>Upload an image to convert it into a WhatsApp sticker.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Target Number</Label>
                            <Input
                                placeholder="628123456789"
                                value={target}
                                onChange={e => setTarget(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Image File</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={e => setFile(e.target.files?.[0] || null)}
                            />
                        </div>

                        <div className="pt-4">
                            <Button className="w-full" onClick={handleSend} disabled={loading || !sessionId || !file}>
                                {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Send Sticker
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SessionGuard>
    );
}
