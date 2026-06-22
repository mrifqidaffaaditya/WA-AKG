"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, ArrowLeft, FileText, Image as ImageIcon, Music, Sticker as StickerIcon, Video, Download, ArrowDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getChatMessages, sendChatMessage, sendMediaMessage } from "@/app/dashboard/chat/actions";
import { useSocket } from "./socket-context";

interface Message {
    keyId: string;
    content: string;
    fromMe: boolean;
    timestamp: string;
    type: string;
    status: string;
    pushName?: string;
    mediaUrl?: string;
    remoteJid?: string;
}

interface ChatWindowProps {
    sessionId: string;
    jid: string;
    name?: string;
    onBack?: () => void;
}

const PAGE_LIMIT = 50;

// ─── Lazy media ─────────────────────────────────────────
function LazyMedia({ src, alt }: { src: string; alt: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { rootMargin: "200px" }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref} className="mb-1.5 overflow-hidden rounded-xl">
            {visible ? (
                <img
                    src={src}
                    alt={alt}
                    className={`max-w-full max-h-60 object-cover rounded-xl transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setLoaded(true)}
                    loading="lazy"
                />
            ) : (
                <div className="h-40 bg-muted/30 rounded-xl animate-pulse" />
            )}
        </div>
    );
}

function LazyVideo({ src }: { src: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { rootMargin: "200px" }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref} className="mb-1.5 overflow-hidden rounded-xl">
            {visible ? (
                <video src={src} controls className="max-w-full max-h-60 rounded-xl" preload="none" />
            ) : (
                <div className="h-32 bg-muted/30 rounded-xl animate-pulse flex items-center justify-center">
                    <Video className="h-6 w-6 text-muted-foreground/50" />
                </div>
            )}
        </div>
    );
}

// ─── Date label ─────────────────────────────────────────
function useDateLabel() {
    const cache = useRef(new Map<string, string>());
    return (timestamp: string): string => {
        const cached = cache.current.get(timestamp);
        if (cached) return cached;
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        let label: string;
        if (diffDays === 0) label = "Today";
        else if (diffDays === 1) label = "Yesterday";
        else label = date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
        cache.current.set(timestamp, label);
        return label;
    };
}

function handleDownload(url: string, fileName: string) {
    toast.info("Downloading file...");
    fetch(url)
        .then(res => { if (!res.ok) throw new Error("File not found"); return res.blob(); })
        .then(blob => {
            const dlUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = dlUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(dlUrl);
        })
        .catch(e => { console.error("Download failed", e); toast.error("Download failed!"); });
}

export function ChatWindow({ sessionId, jid, name, onBack }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadType, setUploadType] = useState<string>("image");
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [oldestTimestamp, setOldestTimestamp] = useState<string | null>(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [newMsgBadge, setNewMsgBadge] = useState(false);

    const { getSocket, joinSession } = useSocket();
    const getDateLabel = useDateLabel();

    const scrollToBottom = useCallback((smooth = true) => {
        bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
    }, []);

    const fetchMessages = useCallback(async (before?: string) => {
        try {
            if (!before) setLoading(true);
            else setLoadingMore(true);

            const data: any = await getChatMessages(sessionId, jid, PAGE_LIMIT, before);

            if (!before) {
                setMessages(data.messages || []);
                setAutoScroll(true);
            } else if (data.messages?.length > 0) {
                setMessages(prev => [...(data.messages || []), ...prev]);
            }

            setHasMore(data.hasMore);
            if (data.messages?.length > 0) {
                setOldestTimestamp(data.messages[0].timestamp);
            }
        } catch (error) {
            console.error("Failed to load messages", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [sessionId, jid]);

    // Initial load
    useEffect(() => {
        setMessages([]);
        setOldestTimestamp(null);
        setHasMore(false);
        fetchMessages();
    }, [fetchMessages]);

    // Socket real-time
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const onConnect = () => joinSession(sessionId);
        if (socket.connected) joinSession(sessionId);
        socket.on("connect", onConnect);

        const normalizedJid = jid.endsWith("@c.us") ? jid.replace("@c.us", "@s.whatsapp.net") : jid;

        const handler = (newMessages: Message[]) => {
            setMessages(prev => {
                const relevant = newMessages.filter(m =>
                    m.remoteJid === normalizedJid || prev.some(p => p.remoteJid === m.remoteJid)
                );
                if (relevant.length === 0) return prev;
                const combined = [...prev, ...relevant];
                const unique = Array.from(new Map(combined.map(m => [m.keyId, m])).values());
                return unique.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            });
        };

        socket.on("message.update", handler);
        return () => { socket.off("connect", onConnect); socket.off("message.update", handler); };
    }, [sessionId, jid, getSocket, joinSession]);

    // Auto-scroll
    useEffect(() => {
        if (autoScroll) scrollToBottom(false);
    }, [messages, autoScroll, scrollToBottom]);

    // Scroll handler
    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        setAutoScroll(atBottom);
        if (atBottom) setNewMsgBadge(false);

        // Load older on scroll to top
        if (el.scrollTop < 100 && hasMore && !loadingMore && oldestTimestamp) {
            const prevHeight = el.scrollHeight;
            fetchMessages(oldestTimestamp).then(() => {
                requestAnimationFrame(() => {
                    if (scrollRef.current)
                        scrollRef.current.scrollTop = scrollRef.current.scrollHeight - prevHeight;
                });
            });
        }
    }, [hasMore, loadingMore, oldestTimestamp, fetchMessages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        try {
            await sendChatMessage(sessionId, jid, input);
            setInput("");
            setTimeout(() => fetchMessages(), 800);
        } catch (e: any) {
            toast.error(e.message || "Failed to send message");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const processFileUpload = async (file: File, explicitType?: string) => {
        const formData = new FormData();
        formData.append("file", file);
        let type = explicitType;
        if (!type || type === '*') {
            if (file.type.startsWith('image/')) type = 'image';
            else if (file.type.startsWith('video/')) type = 'video';
            else if (file.type.startsWith('audio/')) type = 'audio';
            else type = 'document';
        }
        formData.append("type", type);
        formData.append("sessionId", sessionId);
        formData.append("jid", jid);
        try {
            toast.info(`Sending ${file.name}...`);
            await sendMediaMessage(formData);
            toast.success("Sent!");
            setTimeout(() => fetchMessages(), 800);
        } catch (error: any) {
            toast.error(error.message || "Failed to send media");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await processFileUpload(file, uploadType);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const triggerUpload = (type: string) => {
        setUploadType(type);
        if (fileInputRef.current) {
            fileInputRef.current.accept = type === 'image' ? "image/*" : type === 'video' ? "video/*" : type === 'audio' ? "audio/*" : type === 'sticker' ? "image/*" : "*/*";
            fileInputRef.current.click();
        }
    };

    const displayName = name || jid.split('@')[0];

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-muted/20 min-w-0 min-h-0">
                <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-muted/20 min-w-0 min-h-0 relative">
            {/* Loading older indicator */}
            {loadingMore && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border text-xs flex items-center gap-2">
                    <div className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Loading older...
                </div>
            )}

            {/* Drag overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary flex items-center justify-center flex-col gap-3 rounded-lg m-2">
                    <Paperclip className="h-8 w-8 text-primary" />
                    <p className="text-lg font-semibold text-primary">Drop files to send here</p>
                </div>
            )}

            {/* Header */}
            <div className="shrink-0 px-3 py-2.5 border-b bg-background/80 backdrop-blur-sm flex items-center gap-3 z-10">
                {onBack && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden shrink-0 text-muted-foreground hover:text-foreground" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary">
                        {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{displayName}</h3>
                    <p className="text-[10px] text-muted-foreground truncate">{jid}</p>
                </div>
            </div>

            {/* Scrollable messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 styled-scrollbar min-h-0"
                onScroll={handleScroll}
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.04) 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }}
            >
                <div className="flex flex-col gap-3 max-w-3xl mx-auto">
                    {/* "Awal percakapan" marker */}
                    {!hasMore && messages.length > 0 && (
                        <div className="text-center py-4">
                            <span className="text-[10px] font-medium text-muted-foreground bg-background/80 px-3 py-1 rounded-full border border-border/30">
                                Beginning of conversation
                            </span>
                        </div>
                    )}

                    {messages.length === 0 && !loading && (
                        <div className="flex-1 flex items-center justify-center py-16">
                            <p className="text-sm text-muted-foreground">No messages yet</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => {
                        const showDate = idx === 0 || getDateLabel(msg.timestamp) !== getDateLabel(messages[idx - 1].timestamp);
                        return (
                            <div key={msg.keyId}>
                                {showDate && (
                                    <div className="flex justify-center my-3">
                                        <span className="text-[10px] font-medium text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-border/30">
                                            {getDateLabel(msg.timestamp)}
                                        </span>
                                    </div>
                                )}
                                <div className={cn("flex gap-2 group", msg.fromMe ? "justify-end" : "justify-start")}>
                                    {/* Message bubble */}
                                    <div className={cn(
                                        "flex flex-col max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 shadow-sm overflow-hidden",
                                        msg.fromMe
                                            ? "bg-primary text-primary-foreground rounded-br-sm"
                                            : "bg-background border border-border/40 rounded-bl-sm"
                                    )}>
                                        {/* Sender name for groups */}
                                        {!msg.fromMe && jid.endsWith("@g.us") && msg.pushName && (
                                            <span className="text-[10px] font-semibold text-primary block mb-0.5">
                                                {msg.pushName}
                                            </span>
                                        )}

                                        {/* IMAGE */}
                                        {msg.type === 'IMAGE' && msg.mediaUrl && (
                                            <div className="relative group/media">
                                                <LazyMedia src={msg.mediaUrl} alt="Image" />
                                                <Button size="icon" variant="secondary"
                                                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                                                    onClick={() => handleDownload(msg.mediaUrl!, `IMAGE-${msg.keyId}.jpg`)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* VIDEO */}
                                        {msg.type === 'VIDEO' && msg.mediaUrl && (
                                            <div className="relative group/media">
                                                <LazyVideo src={msg.mediaUrl} />
                                                <Button size="icon" variant="secondary"
                                                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm z-10"
                                                    onClick={() => handleDownload(msg.mediaUrl!, `VIDEO-${msg.keyId}.mp4`)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* AUDIO */}
                                        {msg.type === 'AUDIO' && msg.mediaUrl && (
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <audio src={msg.mediaUrl} controls className="h-8 max-w-[200px]" preload="none" />
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full"
                                                    onClick={() => handleDownload(msg.mediaUrl!, `AUDIO-${msg.keyId}.mp3`)}
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* STICKER */}
                                        {msg.type === 'STICKER' && msg.mediaUrl && (
                                            <div className="relative group/media mb-1">
                                                <img src={msg.mediaUrl} alt="Sticker" className="max-h-32 object-contain rounded-lg" loading="lazy" />
                                                <Button size="icon" variant="secondary"
                                                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                                                    onClick={() => handleDownload(msg.mediaUrl!, `STICKER-${msg.keyId}.webp`)}
                                                >
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* DOCUMENT / OTHER */}
                                        {msg.type !== 'TEXT' && msg.type !== 'IMAGE' && msg.type !== 'STICKER' && msg.type !== 'VIDEO' && msg.type !== 'AUDIO' && (
                                            <div className={cn(
                                                "flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg mb-1",
                                                msg.fromMe ? "bg-white/15" : "bg-muted/50"
                                            )}>
                                                <div className="flex items-center gap-2 truncate min-w-0">
                                                    <FileText className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="text-xs font-medium truncate">{msg.type} Message</span>
                                                </div>
                                                {msg.mediaUrl && (
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full shrink-0"
                                                        onClick={() => handleDownload(msg.mediaUrl!, `${msg.type}-${msg.keyId}`)}
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        {/* Text content + time */}
                                        <div className="flex items-end gap-2">
                                            <span className="flex-1 text-sm break-all whitespace-pre-wrap">{msg.content}</span>
                                            <span className={cn(
                                                "text-[9px] shrink-0 leading-none",
                                                msg.fromMe ? "text-primary-foreground/60" : "text-muted-foreground"
                                            )}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* New message badge */}
            {newMsgBadge && (
                <button
                    onClick={() => { scrollToBottom(true); setNewMsgBadge(false); }}
                    className="absolute bottom-[90px] right-6 z-20 flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all animate-bounce"
                >
                    <ArrowDown className="h-4 w-4" />
                    New messages
                </button>
            )}

            {/* Input */}
            <div className="shrink-0 px-3 py-2.5 bg-background/80 backdrop-blur-sm border-t">
                <div className="flex items-center gap-2 max-w-3xl mx-auto">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full shrink-0 text-muted-foreground hover:text-foreground">
                                <Paperclip className="h-4.5 w-4.5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-44 p-1.5" side="top" align="start">
                            <div className="flex flex-col gap-0.5">
                                <Button variant="ghost" size="sm" className="justify-start gap-2 h-8 text-xs" onClick={() => triggerUpload('image')}>
                                    <ImageIcon className="h-3.5 w-3.5 text-blue-500" /> Image
                                </Button>
                                <Button variant="ghost" size="sm" className="justify-start gap-2 h-8 text-xs" onClick={() => triggerUpload('video')}>
                                    <Video className="h-3.5 w-3.5 text-purple-500" /> Video
                                </Button>
                                <Button variant="ghost" size="sm" className="justify-start gap-2 h-8 text-xs" onClick={() => triggerUpload('audio')}>
                                    <Music className="h-3.5 w-3.5 text-orange-500" /> Audio
                                </Button>
                                <Button variant="ghost" size="sm" className="justify-start gap-2 h-8 text-xs" onClick={() => triggerUpload('document')}>
                                    <FileText className="h-3.5 w-3.5 text-emerald-500" /> Document
                                </Button>
                                <Button variant="ghost" size="sm" className="justify-start gap-2 h-8 text-xs" onClick={() => triggerUpload('sticker')}>
                                    <StickerIcon className="h-3.5 w-3.5 text-pink-500" /> Sticker
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="flex-1 flex items-end gap-2 p-1 rounded-2xl border border-border/30 bg-background">
                        <textarea
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                // Auto-grow
                                const el = e.target;
                                el.style.height = "auto";
                                el.style.height = Math.min(el.scrollHeight, 120) + "px";
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            rows={1}
                            style={{ minHeight: "36px", maxHeight: "120px" }}
                            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none leading-normal"
                        />
                    </div>

                    <Button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        size="icon"
                        className="h-9 w-9 rounded-full shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
