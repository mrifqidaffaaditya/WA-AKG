"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, MessageSquare, RefreshCw } from "lucide-react";
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

interface AutoReply {
    id: string;
    keyword: string;
    response: string;
    matchType: string;
    isMedia: boolean;
    mediaUrl: string | null;
    triggerType: string;
}

export default function AutoReplyPage() {
    const { sessionId: selectedSessionId } = useSession();

    const [rules, setRules] = useState<AutoReply[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form state ...
    const [showForm, setShowForm] = useState(false);
    const [newKeyword, setNewKeyword] = useState("");
    const [newResponse, setNewResponse] = useState("");
    const [newMatchType, setNewMatchType] = useState("EXACT");
    const [newIsMedia, setNewIsMedia] = useState(false);
    const [newMediaUrl, setNewMediaUrl] = useState("");
    const [newTriggerType, setNewTriggerType] = useState("ALL");

    // Delete state
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Remove local listener

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (selectedSessionId) {
            fetchRules(selectedSessionId);
        } else {
            setRules([]);
        }
    }, [selectedSessionId]);

    const fetchRules = async (sessionId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/autoreplies/${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                setRules(data?.data || []);
            } else {
                setRules([]); // or error
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch auto replies");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (rule: AutoReply) => {
        setEditingId(rule.id);
        setNewKeyword(rule.keyword);
        setNewResponse(rule.response);
        setNewMatchType(rule.matchType);
        setNewIsMedia(rule.isMedia || false);
        setNewMediaUrl(rule.mediaUrl || "");
        setNewTriggerType(rule.triggerType || "ALL");
        setShowForm(true);
    };

    const handleSaveRule = async () => {
        if (!selectedSessionId || !newKeyword || !newResponse) return;

        try {
            const url = editingId
                ? `/api/autoreplies/${selectedSessionId}/${editingId}`
                : `/api/autoreplies/${selectedSessionId}`;

            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    keyword: newKeyword,
                    response: newResponse,
                    matchType: newMatchType,
                    isMedia: newIsMedia,
                    mediaUrl: newMediaUrl,
                    triggerType: newTriggerType // Added triggerType
                })
            });

            if (res.ok) {
                toast.success(editingId ? "Rule updated" : "Rule created");
                setShowForm(false);
                setNewKeyword("");
                setNewResponse("");
                setNewMatchType("EXACT");
                setNewIsMedia(false);
                setNewMediaUrl("");
                setNewTriggerType("ALL"); // Reset newTriggerType
                setEditingId(null);
                fetchRules(selectedSessionId);
            } else {
                toast.error(editingId ? "Failed to update rule" : "Failed to create rule");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/autoreplies/${selectedSessionId}/${deleteId}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Rule deleted");
                setRules(rules.filter(r => r.id !== deleteId));
            } else {
                toast.error("Failed to delete rule");
            }
        } catch (error) {
            toast.error("Failed to delete rule");
        } finally {
            setDeleteId(null);
        }
    };

    const filteredRules = rules.filter(r =>
        r.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.response.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <SessionGuard>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" /> Auto Reply
                        </h1>
                        <p className="text-sm text-muted-foreground">Automatically reply to incoming messages based on keywords.</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => selectedSessionId && fetchRules(selectedSessionId)} disabled={loading || !selectedSessionId}>
                            <RefreshCw className={`h-4 w-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button size="sm" className="flex-1 sm:flex-none" onClick={() => {
                            setEditingId(null);
                            setNewKeyword("");
                            setNewResponse("");
                            setNewMatchType("EXACT");
                            setNewIsMedia(false);
                            setNewMediaUrl("");
                            setNewTriggerType("ALL");
                            setShowForm(!showForm);
                        }} disabled={!selectedSessionId}>
                            <Plus className="h-4 w-4 mr-1 sm:mr-2" /> Add Rule
                        </Button>
                    </div>
                </div>

                <SearchFilter
                    placeholder="Search rules..."
                    onSearch={setSearchTerm}
                />

                {/* New/Edit Rule Form */}
                {showForm && (
                    <Card className="border-2 border-primary/20">
                        <CardHeader>
                            <CardTitle>{editingId ? "Edit Auto Reply Rule" : "New Auto Reply Rule"}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Keyword</Label>
                                <Input
                                    value={newKeyword}
                                    onChange={e => setNewKeyword(e.target.value)}
                                    placeholder="e.g. !hello"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                    <Label>Match Type</Label>
                                    <Select value={newMatchType} onValueChange={setNewMatchType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EXACT">Exact Match</SelectItem>
                                            <SelectItem value="CONTAINS">Contains</SelectItem>
                                            <SelectItem value="STARTS_WITH">Starts With</SelectItem>
                                            <SelectItem value="REGEX">Regex</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Respond IN</Label>
                                    <Select value={newTriggerType} onValueChange={setNewTriggerType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Chats</SelectItem>
                                            <SelectItem value="PRIVATE">Private Only</SelectItem>
                                            <SelectItem value="GROUP">Group Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-4 border p-3 rounded-md">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isMedia"
                                        className="h-4 w-4 rounded border-gray-300"
                                        checked={newIsMedia}
                                        onChange={(e) => setNewIsMedia(e.target.checked)}
                                    />
                                    <Label htmlFor="isMedia">Send Media</Label>
                                </div>

                                {newIsMedia && (
                                    <div className="space-y-2">
                                        <Label>Media URL</Label>
                                        <Input
                                            placeholder="https://example.com/image.jpg"
                                            value={newMediaUrl}
                                            onChange={(e) => setNewMediaUrl(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">Direct link to image, video, or document.</p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Response Message</Label>
                                <Textarea
                                    value={newResponse}
                                    onChange={e => setNewResponse(e.target.value)}
                                    placeholder="Hello! How can I help you?"
                                    rows={4}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                    setNewKeyword("");
                                    setNewResponse("");
                                    setNewIsMedia(false);
                                    setNewMediaUrl("");
                                }}>Cancel</Button>
                                <Button onClick={handleSaveRule}>{editingId ? "Update" : "Save"}</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Rules List */}
                {loading ? (
                    <div className="text-center p-8">Loading rules...</div>
                ) : filteredRules.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground border rounded-lg bg-slate-50">
                        {selectedSessionId ? "No auto reply rules found matching criteria." : "No session selected."}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredRules.map(rule => (
                            <Card key={rule.id}>
                                <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 sm:p-4">
                                    <div>
                                        <div className="font-bold flex items-center gap-2">
                                            {rule.keyword}
                                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-normal">{rule.matchType}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">{rule.response}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(rule)}>
                                            Edit
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(rule.id)} className="text-destructive hover:text-destructive hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Rule?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will verify delete this auto reply rule.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </SessionGuard>
    );
}
