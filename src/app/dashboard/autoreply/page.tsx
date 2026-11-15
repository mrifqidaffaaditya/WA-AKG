"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/dashboard/session-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BotMessageSquare, Loader2, Plus, Trash2, MessageCircleReply, Image as ImageIcon, Pencil } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAutoReplies, createAutoReply, deleteAutoReply, updateAutoReply } from "./actions";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { useTranslations } from "next-intl";

interface AutoReply {
    id: string;
    keyword: string;
    matchType: string;
    response: string;
    isMedia: boolean;
    mediaUrl: string | null;
    mediaType: string | null;
    triggerType: string;
    createdAt: Date;
}

export default function AutoReplyPage() {
    const t = useTranslations("autoreply");
    const tCommon = useTranslations("common");
    const { sessionId } = useSession();
    const [rules, setRules] = useState<AutoReply[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Form states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [keyword, setKeyword] = useState("");
    const [response, setResponse] = useState("");
    const [matchType, setMatchType] = useState("EXACT");
    const [triggerType, setTriggerType] = useState("ALL");
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaType, setMediaType] = useState("image");

    // Edit states
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [editKeyword, setEditKeyword] = useState("");
    const [editResponse, setEditResponse] = useState("");
    const [editMatchType, setEditMatchType] = useState("EXACT");
    const [editTriggerType, setEditTriggerType] = useState("ALL");
    const [editMediaUrl, setEditMediaUrl] = useState("");
    const [editMediaType, setEditMediaType] = useState("image");

    useEffect(() => {
        if (sessionId) {
            fetchRules();
        }
    }, [sessionId]);

    const fetchRules = async () => {
        if (!sessionId) return;
        setLoading(true);
        try {
            // Using direct Server Action instead of API route
            const data = await getAutoReplies(sessionId);
            setRules(data as unknown as AutoReply[]);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error fetching auto-replies");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!sessionId) return;
        if (!keyword.trim() || (!response.trim() && !mediaUrl.trim())) {
            toast.error(t("requiredFields"));
            return;
        }

        setSubmitting(true);
        try {
            // Using direct Server Action instead of API route
            await createAutoReply(sessionId, {
                keyword: keyword.trim(),
                response: response.trim(),
                matchType,
                triggerType,
                isMedia: !!mediaUrl.trim(),
                mediaUrl: mediaUrl.trim() || null,
                mediaType: mediaType || null
            });

            toast.success(tCommon("saved"));
            setIsCreateOpen(false);
            fetchRules();
            resetForm();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error creating auto-reply");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (ruleId: string) => {
        if (!sessionId) return;
        try {
            // Using direct Server Action
            await deleteAutoReply(sessionId, ruleId);
            toast.success(tCommon("deleted"));
            fetchRules();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error deleting auto-reply");
        }
    };

    const resetForm = () => {
        setKeyword("");
        setResponse("");
        setMatchType("EXACT");
        setTriggerType("ALL");
        setMediaUrl("");
        setMediaType("image");
    };

    const handleEdit = (rule: AutoReply) => {
        setEditId(rule.id);
        setEditKeyword(rule.keyword);
        setEditResponse(rule.response || "");
        setEditMatchType(rule.matchType);
        setEditTriggerType(rule.triggerType);
        setEditMediaUrl(rule.mediaUrl || "");
        setEditMediaType(rule.mediaType || "image");
        setIsEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!sessionId || !editId) return;
        if (!editKeyword.trim() || (!editResponse.trim() && !editMediaUrl.trim())) {
            toast.error(t("requiredFields"));
            return;
        }

        setSubmitting(true);
        try {
            await updateAutoReply(sessionId, editId, {
                keyword: editKeyword.trim(),
                response: editResponse.trim(),
                matchType: editMatchType,
                triggerType: editTriggerType,
                isMedia: !!editMediaUrl.trim(),
                mediaUrl: editMediaUrl.trim() || null,
                mediaType: editMediaType || null
            });

            toast.success(t("updatedSuccess"));
            setIsEditOpen(false);
            fetchRules();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error updating auto-reply");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SessionGuard>
            <div className="max-w-5xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-muted-foreground">{t("subtitle")}</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={(open) => {
                    setIsCreateOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            {t("addRule")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{t("dialogCreateTitle")}</DialogTitle>
                            <DialogDescription>{t("dialogCreateDescription")}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t("keyword")}</Label>
                                    <Input 
                                        value={keyword} 
                                        onChange={(e) => setKeyword(e.target.value)} 
                                        placeholder={t("keywordPlaceholder")} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("matchType")}</Label>
                                    <Select value={matchType} onValueChange={setMatchType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EXACT">{t("matchExact")}</SelectItem>
                                            <SelectItem value="CONTAINS">{t("matchContains")}</SelectItem>
                                            <SelectItem value="STARTS_WITH">{t("matchStartsWith")}</SelectItem>
                                            <SelectItem value="REGEX">{t("matchRegex")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t("triggerType")}</Label>
                                <Select value={triggerType} onValueChange={setTriggerType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">{t("triggerAll")}</SelectItem>
                                        <SelectItem value="PRIVATE">{t("triggerPersonal")}</SelectItem>
                                        <SelectItem value="GROUP">{t("triggerGroups")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>{t("response")}</Label>
                                <Textarea 
                                    value={response} 
                                    onChange={(e) => setResponse(e.target.value)} 
                                    placeholder={t("responsePlaceholder")} 
                                    className="min-h-[120px]"
                                />
                                <p className="text-xs text-muted-foreground">{t("formattingTip")}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t("mediaUrl")}</Label>
                                    <Input 
                                        value={mediaUrl} 
                                        onChange={(e) => setMediaUrl(e.target.value)} 
                                        placeholder="https://example.com/image.jpg" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("mediaType")}</Label>
                                    <Select value={mediaType} onValueChange={setMediaType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="image">{t("mediaImage")}</SelectItem>
                                            <SelectItem value="video">{t("mediaVideo")}</SelectItem>
                                            <SelectItem value="document">{t("mediaDocument")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{tCommon("cancel")}</Button>
                            <Button onClick={handleCreate} disabled={submitting || !keyword.trim() || (!response.trim() && !mediaUrl.trim())}>
                                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : tCommon("save")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : rules.length === 0 ? (
                <Card className="border-dashed shadow-none bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <BotMessageSquare className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold">{t("empty")}</h3>
                        <p className="text-muted-foreground mb-4">{t("emptyDescription")}</p>
                        <Button variant="outline" onClick={() => setIsCreateOpen(true)}>{t("createFirst")}</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rules.map((rule) => (
                        <Card key={rule.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 border-b">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1 pr-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <span className="font-mono bg-muted px-2 py-0.5 rounded text-sm break-all">{rule.keyword}</span>
                                        </CardTitle>
                                        <div className="flex gap-2 flex-wrap text-xs">
                                            <Badge variant="outline" className="text-muted-foreground font-normal shrink-0">{rule.matchType}</Badge>
                                            <Badge variant="secondary" className="font-normal shrink-0 text-[10px]">{rule.triggerType}</Badge>
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted" onClick={() => handleEdit(rule)}>
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
                                                    <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t("deleteConfirmDescriptionWithName", { keyword: rule.keyword })}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(rule.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                        {tCommon("delete")}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 flex-grow flex flex-col">
                                <div className="text-sm text-foreground bg-muted/30 p-3 rounded-md border whitespace-pre-wrap flex-grow">
                                    {rule.response}
                                </div>
                                {rule.isMedia && (
                                    <div className="mt-3 text-xs flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                                        <ImageIcon className="w-3 h-3" /> {t("includesMedia")}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit Auto-Reply Dialog Modal */}
            <Dialog open={isEditOpen} onOpenChange={(open) => {
                setIsEditOpen(open);
                if (!open) setEditId(null);
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{t("dialogEditTitle")}</DialogTitle>
                        <DialogDescription>{t("dialogEditDescription")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t("keyword")}</Label>
                                <Input 
                                    value={editKeyword} 
                                    onChange={(e) => setEditKeyword(e.target.value)} 
                                    placeholder={t("keywordPlaceholder")} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("matchType")}</Label>
                                <Select value={editMatchType} onValueChange={setEditMatchType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EXACT">{t("matchExact")}</SelectItem>
                                        <SelectItem value="CONTAINS">{t("matchContains")}</SelectItem>
                                        <SelectItem value="STARTS_WITH">{t("matchStartsWith")}</SelectItem>
                                        <SelectItem value="REGEX">{t("matchRegex")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{t("triggerType")}</Label>
                            <Select value={editTriggerType} onValueChange={setEditTriggerType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">{t("triggerAll")}</SelectItem>
                                    <SelectItem value="PRIVATE">{t("triggerPersonal")}</SelectItem>
                                    <SelectItem value="GROUP">{t("triggerGroups")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t("response")}</Label>
                            <Textarea 
                                value={editResponse} 
                                onChange={(e) => setEditResponse(e.target.value)} 
                                placeholder={t("responsePlaceholder")} 
                                className="min-h-[120px]"
                            />
                            <p className="text-xs text-muted-foreground">{t("formattingTip")}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t("mediaUrl")}</Label>
                                <Input 
                                    value={editMediaUrl} 
                                    onChange={(e) => setEditMediaUrl(e.target.value)} 
                                    placeholder="https://example.com/image.jpg" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("mediaType")}</Label>
                                <Select value={editMediaType} onValueChange={setEditMediaType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="image">{t("mediaImage")}</SelectItem>
                                        <SelectItem value="video">{t("mediaVideo")}</SelectItem>
                                        <SelectItem value="document">{t("mediaDocument")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>{tCommon("cancel")}</Button>
                        <Button onClick={handleUpdate} disabled={submitting || !editKeyword.trim() || (!editResponse.trim() && !editMediaUrl.trim())}>
                            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : tCommon("save")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        </SessionGuard>
    );
}
