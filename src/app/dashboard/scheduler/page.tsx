"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, CalendarClock, RefreshCw, Pencil, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import moment from "moment-timezone";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SearchFilter } from "@/components/dashboard/search-filter";
import { useSession } from "@/components/dashboard/session-provider";
import { SessionGuard } from "@/components/dashboard/session-guard";

interface ScheduledMessage {
    id: string;
    jid: string;
    content: string | null;
    sendAt: string;
    status: string;
    mediaUrl?: string;
    mediaType?: string;
    cronExpression?: string;
    recurrenceRule?: string;
}

export default function SchedulerPage() {
    const { sessionId: selectedSessionId } = useSession();

    const [messages, setMessages] = useState<ScheduledMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [systemTimezone, setSystemTimezone] = useState("Asia/Jakarta");
    const [activeTab, setActiveTab] = useState("pending");

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [newJidType, setNewJidType] = useState("personal");
    const [newJid, setNewJid] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newSendAt, setNewSendAt] = useState("");
    const [newSendTime, setNewSendTime] = useState("");
    const [newMediaUrl, setNewMediaUrl] = useState("");
    const [newMediaType, setNewMediaType] = useState("image");
    
    // Recurrence State for Create
    const [isRecurring, setIsRecurring] = useState("once");
    const [recurrenceType, setRecurrenceType] = useState("minutes");
    const [recurringMinutes, setRecurringMinutes] = useState(5);
    const [recurringHours, setRecurringHours] = useState(1);
    const [recurringDays, setRecurringDays] = useState<number[]>([]);
    const [customCron, setCustomCron] = useState("");

    // Delete state
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Edit state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [editJidType, setEditJidType] = useState("personal");
    const [editJid, setEditJid] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editSendAt, setEditSendAt] = useState("");
    const [editSendTime, setEditSendTime] = useState("");
    const [editMediaUrl, setEditMediaUrl] = useState("");
    const [editMediaType, setEditMediaType] = useState("image");

    const [editIsRecurring, setEditIsRecurring] = useState("once");
    const [editRecurrenceType, setEditRecurrenceType] = useState("minutes");
    const [editRecurringMinutes, setEditRecurringMinutes] = useState(5);
    const [editRecurringHours, setEditRecurringHours] = useState(1);
    const [editRecurringDays, setEditRecurringDays] = useState<number[]>([]);
    const [editCustomCron, setEditCustomCron] = useState("");

    useEffect(() => {
        fetch('/api/settings/system')
            .then(res => res.json())
            .then(data => {
                if (data.status && data.data?.timezone) {
                    setSystemTimezone(data.data.timezone);
                }
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (selectedSessionId) {
            fetchMessages(selectedSessionId, activeTab);
        } else {
            setMessages([]);
        }
    }, [selectedSessionId, activeTab]);

    const fetchMessages = async (sessionId: string, tab: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/scheduler/${sessionId}?tab=${tab}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data?.data || []);
            } else {
                setMessages([]);
            }
        } catch (error) {
            toast.error("Failed to fetch scheduled messages");
        } finally {
            setLoading(false);
        }
    };

    const parseRecurrence = (ruleStr: string | undefined, cronExpr: string | undefined, setRecurring: any, setType: any, setMins: any, setHrs: any, setDays: any, setCron: any) => {
        if (!cronExpr) {
            setRecurring("once");
            return;
        }
        setRecurring("recurring");
        setCron(cronExpr);
        if (ruleStr) {
            try {
                const rule = JSON.parse(ruleStr);
                setType(rule.type || "cron");
                if (rule.type === "minutes") setMins(rule.value);
                if (rule.type === "hours") setHrs(rule.value);
                if (rule.type === "days") setDays(rule.value);
            } catch(e) {
                setType("cron");
            }
        } else {
            setType("cron");
        }
    };

    const handleEdit = (msg: ScheduledMessage) => {
        setEditId(msg.id);
        const isGroup = msg.jid.includes("@g.us");
        const isNewsletter = msg.jid.includes("@newsletter");
        setEditJidType(isGroup ? "group" : isNewsletter ? "newsletter" : "personal");
        const jidUser = msg.jid.split('@')[0];
        setEditJid(jidUser);
        setEditContent(msg.content || "");
        setEditMediaUrl(msg.mediaUrl || "");
        setEditMediaType(msg.mediaType || "image");
        
        const localIso = moment.tz(msg.sendAt, systemTimezone).format('YYYY-MM-DDTHH:mm');
        setEditSendAt(localIso);
        
        const localTime = moment.tz(msg.sendAt, systemTimezone).format('HH:mm');
        setEditSendTime(localTime);
        
        parseRecurrence(msg.recurrenceRule, msg.cronExpression, setEditIsRecurring, setEditRecurrenceType, setEditRecurringMinutes, setEditRecurringHours, setEditRecurringDays, setEditCustomCron);

        setIsEditOpen(true);
    };

    const buildCronData = (isRec: string, type: string, mins: number, hrs: number, days: number[], custom: string, finalSendAt: string) => {
        if (isRec === "once") return { cronExpression: null, recurrenceRule: null };
        
        let cron = "";
        const rule: any = { type };
        
        if (type === "minutes") {
            cron = `*/${mins} * * * *`;
            rule.value = mins;
        } else if (type === "hours") {
            cron = `0 */${hrs} * * *`;
            rule.value = hrs;
        } else if (type === "days") {
            // Because finalSendAt for days is constructed as YYYY-MM-DDT14:30:00, 
            // parsing it via Date locally gives correct local hours and minutes.
            const date = new Date(finalSendAt);
            const m = date.getMinutes();
            const h = date.getHours();
            const dStr = days.length > 0 ? days.join(',') : '*';
            cron = `${m} ${h} * * ${dStr}`;
            rule.value = days;
        } else {
            cron = custom;
            rule.value = custom;
        }
        
        return { cronExpression: cron, recurrenceRule: JSON.stringify(rule) };
    };

    const handleSaveSchedule = async () => {
        if (!selectedSessionId || !newJid || (!newContent && !newMediaUrl)) {
            toast.error("Please fill required fields (JID, Content/Media)");
            return;
        }

        let finalSendAt = newSendAt;
        if (isRecurring === "recurring") {
            if (recurrenceType === "days") {
                if (!newSendTime) {
                    toast.error("Please specify a Time of Day");
                    return;
                }
                // Construct a valid local date-time string
                finalSendAt = `${moment().format('YYYY-MM-DD')}T${newSendTime}:00`;
            } else {
                // For minutes, hours, cron: start from now
                finalSendAt = moment().tz(systemTimezone).format('YYYY-MM-DDTHH:mm:ss');
            }
        } else {
            if (!newSendAt) {
                toast.error("Please specify Send At");
                return;
            }
        }

        let jid = newJid;
        if (!jid.includes("@")) {
            if (newJidType === "group") jid += "@g.us";
            else if (newJidType === "newsletter") jid += "@newsletter";
            else jid += "@s.whatsapp.net";
        }

        const cronData = buildCronData(isRecurring, recurrenceType, recurringMinutes, recurringHours, recurringDays, customCron, finalSendAt);

        try {
            const res = await fetch(`/api/scheduler/${selectedSessionId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jid,
                    content: newContent,
                    sendAt: finalSendAt,
                    mediaUrl: newMediaUrl,
                    mediaType: newMediaType,
                    ...cronData
                })
            });

            if (res.ok) {
                toast.success("Message scheduled");
                setShowForm(false);
                setNewJid("");
                setNewContent("");
                setNewSendAt("");
                setNewSendTime("");
                setNewMediaUrl("");
                setNewMediaType("image");
                setNewJidType("personal");
                fetchMessages(selectedSessionId, activeTab);
            } else {
                toast.error("Failed to schedule message");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleUpdateSchedule = async () => {
        if (!selectedSessionId || !editId || !editJid || (!editContent && !editMediaUrl)) {
            toast.error("Please fill required fields");
            return;
        }

        let finalSendAt = editSendAt;
        if (editIsRecurring === "recurring") {
            if (editRecurrenceType === "days") {
                if (!editSendTime) {
                    toast.error("Please specify a Time of Day");
                    return;
                }
                finalSendAt = `${moment().format('YYYY-MM-DD')}T${editSendTime}:00`;
            } else {
                finalSendAt = moment().tz(systemTimezone).format('YYYY-MM-DDTHH:mm:ss');
            }
        } else {
            if (!editSendAt) {
                toast.error("Please specify Send At");
                return;
            }
        }

        let jid = editJid;
        if (!jid.includes("@")) {
            if (editJidType === "group") jid += "@g.us";
            else if (editJidType === "newsletter") jid += "@newsletter";
            else jid += "@s.whatsapp.net";
        }

        const cronData = buildCronData(editIsRecurring, editRecurrenceType, editRecurringMinutes, editRecurringHours, editRecurringDays, editCustomCron, finalSendAt);

        try {
            const res = await fetch(`/api/scheduler/${selectedSessionId}/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jid,
                    content: editContent,
                    sendAt: finalSendAt,
                    mediaUrl: editMediaUrl,
                    mediaType: editMediaType,
                    ...cronData
                })
            });

            if (res.ok) {
                toast.success("Schedule updated");
                setIsEditOpen(false);
                fetchMessages(selectedSessionId, activeTab);
            } else {
                toast.error("Failed to update schedule");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/scheduler/${selectedSessionId}/${deleteId}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Schedule deleted");
                fetchMessages(selectedSessionId, activeTab);
            } else {
                toast.error("Failed to delete schedule");
            }
        } catch (error) {
            toast.error("Failed to delete schedule");
        } finally {
            setDeleteId(null);
        }
    };

    const filteredMessages = messages.filter(m =>
        (m.content || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.jid.includes(searchTerm)
    );

    const renderRecurrenceForm = (
        isRec: string, setRec: any, 
        type: string, setType: any, 
        mins: number, setMins: any, 
        hrs: number, setHrs: any, 
        days: number[], setDays: any, 
        cron: string, setCron: any,
        sendAtStr: string, setSendAtStr: any,
        sendTimeStr: string, setSendTimeStr: any
    ) => (
        <div className="space-y-4 border p-4 rounded-md bg-slate-50 mt-4">
            <Label className="font-semibold text-base">Schedule Type</Label>
            <RadioGroup value={isRec} onValueChange={setRec} className="flex gap-4">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="once" id={`r-once-${type}`} />
                    <Label htmlFor={`r-once-${type}`}>One-time</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recurring" id={`r-rec-${type}`} />
                    <Label htmlFor={`r-rec-${type}`}>Recurring</Label>
                </div>
            </RadioGroup>

            {isRec === "once" && (
                <div className="space-y-2 mt-4 pt-4 border-t border-slate-200">
                    <Label>Send At (Date & Time)</Label>
                    <Input type="datetime-local" value={sendAtStr} onChange={e => setSendAtStr(e.target.value)} />
                    <p className="text-xs text-muted-foreground">The exact date and time this message will be sent.</p>
                </div>
            )}

            {isRec === "recurring" && (
                <div className="space-y-4 pt-4 mt-2 border-t border-slate-200">
                    <Label className="font-medium">Repeat Interval</Label>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="minutes">Every X Minutes</SelectItem>
                            <SelectItem value="hours">Every X Hours</SelectItem>
                            <SelectItem value="days">Specific Days of Week</SelectItem>
                            <SelectItem value="cron">Custom Cron</SelectItem>
                        </SelectContent>
                    </Select>

                    {type === "minutes" && (
                        <div className="flex items-center gap-2">
                            <Label>Every</Label>
                            <Input type="number" min={1} value={mins} onChange={e => setMins(parseInt(e.target.value) || 1)} className="w-20" />
                            <Label>Minutes</Label>
                        </div>
                    )}

                    {type === "hours" && (
                        <div className="flex items-center gap-2">
                            <Label>Every</Label>
                            <Input type="number" min={1} value={hrs} onChange={e => setHrs(parseInt(e.target.value) || 1)} className="w-20" />
                            <Label>Hours</Label>
                        </div>
                    )}

                    {type === "days" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Select Days</Label>
                                <div className="flex flex-wrap gap-4">
                                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                                        <div key={d} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={`d-${d}-${type}`} 
                                                checked={days.includes(i)}
                                                onCheckedChange={(c) => {
                                                    if (c) setDays([...days, i]);
                                                    else setDays(days.filter(x => x !== i));
                                                }}
                                            />
                                            <Label htmlFor={`d-${d}-${type}`}>{d}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2 pt-2 border-t border-slate-200">
                                <Label>Time of Day</Label>
                                <Input type="time" value={sendTimeStr} onChange={e => setSendTimeStr(e.target.value)} className="w-32" />
                            </div>
                        </div>
                    )}

                    {type === "cron" && (
                        <div className="space-y-2">
                            <Label>Cron Expression</Label>
                            <Input value={cron} onChange={e => setCron(e.target.value)} placeholder="0 12 * * *" />
                        </div>
                    )}
                    
                    {type !== "days" && (
                        <p className="text-xs text-muted-foreground mt-2">
                            The schedule will be evaluated starting from the current time.
                        </p>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <SessionGuard>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                            <CalendarClock className="h-5 w-5 sm:h-6 sm:w-6" /> Scheduler
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {selectedSessionId ? "Schedule messages for active session." : "Select a session from the top bar."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => selectedSessionId && fetchMessages(selectedSessionId, activeTab)} disabled={loading || !selectedSessionId}>
                            <RefreshCw className={`h-4 w-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button size="sm" className="flex-1 sm:flex-none" onClick={() => setShowForm(!showForm)} disabled={!selectedSessionId}>
                            <Plus className="h-4 w-4 mr-1 sm:mr-2" /> Schedule
                        </Button>
                    </div>
                </div>

                <SearchFilter
                    placeholder="Search schedules..."
                    onSearch={setSearchTerm}
                />

                {showForm && (
                    <Card className="border-2 border-primary/20">
                        <CardHeader>
                            <CardTitle>Schedule New Message</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label>Recipient JID</Label>
                                    <RadioGroup value={newJidType} onValueChange={setNewJidType} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="personal" id="new-personal" />
                                            <Label htmlFor="new-personal" className="cursor-pointer">Personal</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="group" id="new-group" />
                                            <Label htmlFor="new-group" className="cursor-pointer">Group</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="newsletter" id="new-newsletter" />
                                            <Label htmlFor="new-newsletter" className="cursor-pointer">Newsletter</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <Input value={newJid} onChange={e => setNewJid(e.target.value)} placeholder={newJidType === 'group' ? "120363... (Group ID)" : newJidType === 'newsletter' ? "120363... (Channel ID)" : "62812345678"} />
                            </div>
                            
                            {renderRecurrenceForm(
                                isRecurring, setIsRecurring, 
                                recurrenceType, setRecurrenceType, 
                                recurringMinutes, setRecurringMinutes, 
                                recurringHours, setRecurringHours, 
                                recurringDays, setRecurringDays, 
                                customCron, setCustomCron,
                                newSendAt, setNewSendAt,
                                newSendTime, setNewSendTime
                            )}

                            <div className="space-y-2 mt-4">
                                <Label>Message (Optional)</Label>
                                <Textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Hello!" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Media URL (Optional)</Label>
                                    <Input value={newMediaUrl} onChange={e => setNewMediaUrl(e.target.value)} placeholder="https://..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Media Type</Label>
                                    <Select value={newMediaType} onValueChange={setNewMediaType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="image">Image</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="document">Document</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button onClick={handleSaveSchedule} disabled={(!newContent && !newMediaUrl) || !newJid}>Schedule</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="pending">Pending Queue</TabsTrigger>
                        <TabsTrigger value="history">History Logs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="mt-0">
                        {loading ? <div className="text-center p-8">Loading...</div> : filteredMessages.length === 0 ? <div className="text-center p-8 text-muted-foreground border rounded bg-slate-50">No pending messages.</div> : (
                            <div className="grid gap-4">
                                {filteredMessages.map(msg => (
                                    <Card key={msg.id}>
                                        <CardContent className="flex flex-col sm:flex-row justify-between p-4 gap-4">
                                            <div>
                                                <div className="font-bold flex items-center gap-2">
                                                    {msg.jid.split('@')[0]}
                                                    {msg.jid.includes("@g.us") ? <span className="text-xs px-2 py-0.5 rounded font-normal bg-purple-100 text-purple-800">Group</span> : null}
                                                    {msg.jid.includes("@newsletter") ? <span className="text-xs px-2 py-0.5 rounded font-normal bg-orange-100 text-orange-800">Channel</span> : null}
                                                    <span className="text-xs px-2 py-0.5 rounded font-normal bg-yellow-100 text-yellow-800">{msg.status}</span>
                                                    {msg.cronExpression && <span className="text-xs px-2 py-0.5 rounded font-normal bg-blue-100 text-blue-800">Recurring</span>}
                                                </div>
                                                <div className="text-sm font-medium mt-1">{msg.content || "[Media Only]"}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Next Run: {moment(msg.sendAt).tz(systemTimezone).format('YYYY-MM-DD HH:mm:ss')}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(msg)}>Edit</Button>
                                                <Button variant="ghost" size="icon" onClick={() => setDeleteId(msg.id)} className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="history" className="mt-0">
                        {loading ? <div className="text-center p-8">Loading...</div> : filteredMessages.length === 0 ? <div className="text-center p-8 text-muted-foreground border rounded bg-slate-50">No history found.</div> : (
                            <div className="grid gap-4">
                                {filteredMessages.map(msg => (
                                    <Card key={msg.id} className="opacity-80">
                                        <CardContent className="flex flex-col sm:flex-row justify-between p-4 gap-4">
                                            <div>
                                                <div className="font-bold flex items-center gap-2">
                                                    {msg.jid.split('@')[0]}
                                                    {msg.jid.includes("@g.us") ? <span className="text-xs px-2 py-0.5 rounded font-normal bg-purple-100 text-purple-800">Group</span> : null}
                                                    {msg.jid.includes("@newsletter") ? <span className="text-xs px-2 py-0.5 rounded font-normal bg-orange-100 text-orange-800">Channel</span> : null}
                                                    {msg.status === 'SENT' ? <span className="text-xs px-2 py-0.5 rounded font-normal bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Sent</span> : <span className="text-xs px-2 py-0.5 rounded font-normal bg-red-100 text-red-800 flex items-center gap-1"><XCircle className="w-3 h-3"/> Failed</span>}
                                                </div>
                                                <div className="text-sm font-medium mt-1">{msg.content || "[Media Only]"}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Processed: {moment(msg.sendAt).tz(systemTimezone).format('YYYY-MM-DD HH:mm:ss')}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => setDeleteId(msg.id)} className="text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Record?</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete this schedule record?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Dialog open={isEditOpen} onOpenChange={o => !o && setIsEditOpen(false)}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Schedule</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label>Recipient JID</Label>
                                    <RadioGroup value={editJidType} onValueChange={setEditJidType} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="personal" id="edit-personal" />
                                            <Label htmlFor="edit-personal" className="cursor-pointer">Personal</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="group" id="edit-group" />
                                            <Label htmlFor="edit-group" className="cursor-pointer">Group</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="newsletter" id="edit-newsletter" />
                                            <Label htmlFor="edit-newsletter" className="cursor-pointer">Newsletter</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <Input value={editJid} onChange={e => setEditJid(e.target.value)} placeholder={editJidType === 'group' ? "120363... (Group ID)" : editJidType === 'newsletter' ? "120363... (Channel ID)" : "62812345678"} />
                            </div>
                            
                            {renderRecurrenceForm(
                                editIsRecurring, setEditIsRecurring, 
                                editRecurrenceType, setEditRecurrenceType, 
                                editRecurringMinutes, setEditRecurringMinutes, 
                                editRecurringHours, setEditRecurringHours, 
                                editRecurringDays, setEditRecurringDays, 
                                editCustomCron, setEditCustomCron,
                                editSendAt, setEditSendAt,
                                editSendTime, setEditSendTime
                            )}

                            <div className="space-y-2 mt-4">
                                <Label>Message (Optional)</Label>
                                <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Media URL (Optional)</Label>
                                    <Input value={editMediaUrl} onChange={e => setEditMediaUrl(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Media Type</Label>
                                    <Select value={editMediaType} onValueChange={setEditMediaType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="image">Image</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="document">Document</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateSchedule} disabled={(!editContent && !editMediaUrl) || !editJid}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </SessionGuard>
    );
}
