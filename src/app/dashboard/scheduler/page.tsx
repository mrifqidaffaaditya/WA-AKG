"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, CalendarClock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SearchFilter } from "@/components/dashboard/search-filter";
import { useSession } from "@/components/dashboard/session-provider";
import { SessionGuard } from "@/components/dashboard/session-guard";

interface ScheduledMessage {
    id: string;
    jid: string;
    content: string;
    sendAt: string;
    status: string;
}

export default function SchedulerPage() {
    const { sessionId: selectedSessionId } = useSession();

    // ... rest of state
    const [messages, setMessages] = useState<ScheduledMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form state ...
    const [showForm, setShowForm] = useState(false);
    const [newJid, setNewJid] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newSendAt, setNewSendAt] = useState("");

    // Delete state
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Remove local updateSession logic as it is handled by provider

    useEffect(() => {
        if (selectedSessionId) {
            fetchMessages(selectedSessionId);
        } else {
            setMessages([]);
        }
    }, [selectedSessionId]);

    const fetchMessages = async (sessionId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/scheduler?sessionId=${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            } else {
                setMessages([]);
            }
        } catch (error) {
            toast.error("Failed to fetch scheduled messages");
        } finally {
            setLoading(false);
        }
    };

    const createSchedule = async () => {
        if (!selectedSessionId || !newJid || !newContent || !newSendAt) return;

        // Append domain if missing
        let jid = newJid;
        if (!jid.includes("@")) {
            jid = jid + "@s.whatsapp.net"; // Default to private chat
        }

        try {
            const res = await fetch("/api/scheduler", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: selectedSessionId,
                    jid,
                    content: newContent,
                    sendAt: newSendAt // Input type datetime-local sends ISO string format
                })
            });

            if (res.ok) {
                toast.success("Message scheduled");
                setShowForm(false);
                setNewJid("");
                setNewContent("");
                setNewSendAt("");
                fetchMessages(selectedSessionId);
            } else {
                toast.error("Failed to schedule message");
            }
        } catch (error) {
            toast.error("Failed to schedule message");
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/scheduler/${deleteId}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Schedule cancelled");
                setMessages(messages.filter(m => m.id !== deleteId));
            } else {
                toast.error("Failed to cancel schedule");
            }
        } catch (error) {
            toast.error("Failed to cancel schedule");
        } finally {
            setDeleteId(null);
        }
    };

    const filteredMessages = messages.filter(m =>
        m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.jid.includes(searchTerm)
    );

    return (
        <SessionGuard>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <CalendarClock className="h-6 w-6" /> Scheduler
                        </h1>
                        <p className="text-muted-foreground">
                            {selectedSessionId ? "Schedule messages for active session." : "Select a session from the top bar."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => selectedSessionId && fetchMessages(selectedSessionId)} disabled={loading || !selectedSessionId}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button onClick={() => setShowForm(!showForm)} disabled={!selectedSessionId}>
                            <Plus className="h-4 w-4 mr-2" /> Schedule Message
                        </Button>
                    </div>
                </div>

                <SearchFilter
                    placeholder="Search schedules..."
                    onSearch={setSearchTerm}
                />

                {/* New Schedule Form */}
                {showForm && (
                    <Card className="border-2 border-primary/20">
                        <CardHeader>
                            <CardTitle>Schedule New Message</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Receiver</Label>
                                    <Input
                                        value={newJid}
                                        onChange={e => setNewJid(e.target.value)}
                                        placeholder="Phone number (e.g. 628123456789)"
                                    />
                                    <p className="text-xs text-muted-foreground">Enter number only, default suffix added automatically.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Send At</Label>
                                    <Input
                                        type="datetime-local"
                                        value={newSendAt}
                                        onChange={e => setNewSendAt(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                    placeholder="Hello there!"
                                    rows={4}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button onClick={createSchedule}>Schedule</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Messages List */}
                {loading ? (
                    <div className="text-center p-8">Loading...</div>
                ) : filteredMessages.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground border rounded-lg bg-slate-50">
                        {selectedSessionId ? "No scheduled messages found matching criteria." : "No session selected."}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredMessages.map(msg => (
                            <Card key={msg.id} className={msg.status === 'SENT' ? 'opacity-70' : ''}>
                                <CardContent className="flex justify-between items-center p-4">
                                    <div>
                                        <div className="font-bold flex items-center gap-2">
                                            {msg.jid.split('@')[0]}
                                            <span className={`text-xs px-2 py-0.5 rounded font-normal ${msg.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                msg.status === 'SENT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {msg.status}
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium mt-1">{msg.content}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Scheduled for: {new Date(msg.sendAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(msg.id)} className="text-destructive hover:text-destructive hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Schedule?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this scheduled message.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </SessionGuard>
    );
}
