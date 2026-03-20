"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/dashboard/session-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tag, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export const WAP_COLORS = [
    "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF",
    "#4B0082", "#9400D3", "#FF1493", "#00CED1", "#32CD32",
    "#FFD700", "#FF69B4", "#8B4513", "#2F4F4F", "#696969",
    "#708090", "#778899", "#B0C4DE", "#ADD8E6", "#F0E68C"
];

interface ChatLabel {
    id: string;
    sessionId: string;
    name: string;
    color: number;
    colorHex: string;
    _count: {
        chatLabels: number;
    };
}

export default function LabelsPage() {
    const { sessionId } = useSession();
    const [labels, setLabels] = useState<ChatLabel[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Form states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    
    const [currentName, setCurrentName] = useState("");
    const [currentColor, setCurrentColor] = useState(0);
    const [currentLabelId, setCurrentLabelId] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (sessionId) {
            fetchLabels();
        }
    }, [sessionId]);

    const fetchLabels = async () => {
        if (!sessionId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/labels/${sessionId}`);
            const data = await res.json();
            
            if (res.ok && data.data?.labels) {
                setLabels(data.data.labels);
            } else {
                toast.error(data.message || "Failed to load labels");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching labels");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!sessionId) return;
        if (!currentName.trim()) {
            toast.error("Label name is required");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/labels/${sessionId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: currentName, color: currentColor })
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("Label created successfully");
                setIsCreateOpen(false);
                fetchLabels();
                resetForm();
            } else {
                toast.error(data.message || "Failed to create label");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error creating label");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async () => {
        if (!sessionId || !currentLabelId) return;
        if (!currentName.trim()) {
            toast.error("Label name is required");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/labels/${sessionId}/${currentLabelId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: currentName, color: currentColor })
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("Label updated successfully");
                setIsEditOpen(false);
                fetchLabels();
                resetForm();
            } else {
                toast.error(data.message || "Failed to update label");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating label");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (labelId: string) => {
        if (!sessionId) return;
        try {
            const res = await fetch(`/api/labels/${sessionId}/${labelId}`, {
                method: "DELETE"
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("Label deleted successfully");
                fetchLabels();
            } else {
                toast.error(data.message || "Failed to delete label");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting label");
        }
    };

    const resetForm = () => {
        setCurrentName("");
        setCurrentColor(0);
        setCurrentLabelId(null);
    };

    const openEditModal = (label: ChatLabel) => {
        setCurrentLabelId(label.id);
        setCurrentName(label.name);
        setCurrentColor(label.color);
        setIsEditOpen(true);
    };

    if (!sessionId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-4">
                <div className="h-16 w-16 bg-muted/50 rounded-full flex justify-center items-center">
                    <Tag className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">No Session Selected</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                        Please select an active WhatsApp session from the sidebar to view labels.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Chat Labels</h1>
                    <p className="text-muted-foreground">Organize and manage tags for your important chats.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={(open) => {
                    setIsCreateOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            New Label
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Label</DialogTitle>
                            <DialogDescription>Add a new color-coded label.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Label Name</Label>
                                <Input 
                                    value={currentName} 
                                    onChange={(e) => setCurrentName(e.target.value)} 
                                    placeholder="e.g. VIP Customer" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Color Indicator</Label>
                                <div className="grid grid-cols-5 gap-2 mt-2">
                                    {WAP_COLORS.map((hex, index) => (
                                        <div 
                                            key={index}
                                            onClick={() => setCurrentColor(index)}
                                            className={`w-10 h-10 rounded-full cursor-pointer transition-all border-2 flex items-center justify-center ${currentColor === index ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                                            style={{ backgroundColor: hex }}
                                        >
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={submitting || !currentName.trim()}>
                                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Create Label"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : labels.length === 0 ? (
                <Card className="border-dashed shadow-none bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Tag className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold">No labels found</h3>
                        <p className="text-muted-foreground mb-4">You haven't created any chat labels yet.</p>
                        <Button variant="outline" onClick={() => setIsCreateOpen(true)}>Create your first label</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {labels.map((label) => (
                        <Card key={label.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-2 w-full" style={{ backgroundColor: label.colorHex }}></div>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg flex items-center gap-2 truncate pr-2">
                                        <Tag className="w-4 h-4 shrink-0" style={{ color: label.colorHex }} />
                                        <span className="truncate">{label.name}</span>
                                    </CardTitle>
                                    <div className="flex gap-1 shrink-0">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => openEditModal(label)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete label?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the <strong>{label.name}</strong> label from your system and remove it from any assigned chats. This cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(label.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="font-normal text-muted-foreground">
                                        {label._count.chatLabels} chats assigned
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit Label Modal */}
            <Dialog open={isEditOpen} onOpenChange={(open) => {
                setIsEditOpen(open);
                if (!open) resetForm();
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Label</DialogTitle>
                        <DialogDescription>Update the label name or color.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Label Name</Label>
                            <Input 
                                value={currentName} 
                                onChange={(e) => setCurrentName(e.target.value)} 
                                placeholder="e.g. VIP Customer" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Color Indicator</Label>
                            <div className="grid grid-cols-5 gap-2 mt-2">
                                {WAP_COLORS.map((hex, index) => (
                                    <div 
                                        key={index}
                                        onClick={() => setCurrentColor(index)}
                                        className={`w-10 h-10 rounded-full cursor-pointer transition-all border-2 flex items-center justify-center ${currentColor === index ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                                        style={{ backgroundColor: hex }}
                                    >
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleEdit} disabled={submitting || !currentName.trim()}>
                            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
