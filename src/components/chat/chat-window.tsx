"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Image as ImageIcon, FileText, Music, Sticker as StickerIcon, Video, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

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
}

export function ChatWindow({ sessionId, jid, name }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadType, setUploadType] = useState<string>("image");

    // Scroll to bottom helper
    const scrollToBottom = (smooth = true) => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
        }
    };

    // Auto-scroll on messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/chat/${sessionId}/${encodeURIComponent(jid)}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                // Force scroll buffer
                setTimeout(() => scrollToBottom(false), 100);
            }
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    }



    useEffect(() => {
        // Initial Fetch
        fetchMessages();

        // Socket Connection
        const newSocket = io({
            path: "/api/socket/io",
            addTrailingSlash: false,
        });

        newSocket.on("connect", () => {
            console.log("Connected to socket");
            newSocket.emit("join-session", sessionId);
        });

        newSocket.on("message.update", (newMessages: Message[]) => {
            setMessages((prev) => {
                // De-duplicate and sort
                const combined = [...prev, ...newMessages.filter(m => m.remoteJid === jid)];
                const unique = Array.from(new Map(combined.map(m => [m.keyId, m])).values());
                return unique.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            });
            // Scroll will happen via the [messages] dependency
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [sessionId, jid]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        try {
            await fetch(`/api/chat/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    jid,
                    message: { text: newMessage }
                })
            });
            setNewMessage("");
            fetchMessages(); // Refresh immediately
        } catch (e) {
            console.error(e);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", uploadType);
        // formData.append("caption", newMessage); // Optional: Send current text as caption

        try {
            toast.info("Sending...");
            const res = await fetch(`/api/messages/${sessionId}/${encodeURIComponent(jid)}/media`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Failed to send media");
            toast.success("Sent!");
            // Socket will handle update
        } catch (error) {
            console.error(error);
            toast.error("Failed to send media");
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const triggerUpload = (type: string) => {
        setUploadType(type);
        if (fileInputRef.current) {
            fileInputRef.current.accept = type === 'image' ? "image/*" : type === 'video' ? "video/*" : type === 'audio' ? "audio/*" : type === 'sticker' ? "image/*" : "*/*";
            // For sticker, we accept image to convert
            fileInputRef.current.click();
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="p-4 border-b bg-white flex items-center space-x-3 shadow-sm">
                <Avatar>
                    <AvatarFallback>{(name || jid).slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-semibold">{name || jid}</h3>
                    <span className="text-xs text-muted-foreground">{jid}</span>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 min-h-0 p-4">
                <div className="space-y-4 pb-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.keyId}
                            className={cn(
                                "flex w-fit max-w-[75%] flex-col gap-1 rounded-lg px-3 py-2 text-sm shadow-sm break-words whitespace-pre-wrap",
                                msg.fromMe
                                    ? "ml-auto bg-primary text-primary-foreground"
                                    : "bg-white border"
                            )}
                        >
                            {/* Sender Name (for received messages in groups) */}
                            {!msg.fromMe && msg.pushName && (
                                <span className="text-[10px] font-bold text-orange-600 mb-0.5">
                                    {msg.pushName}
                                </span>
                            )}

                            {msg.type === 'IMAGE' && msg.mediaUrl && (
                                <img src={msg.mediaUrl} alt="Image" className="rounded-md max-h-64 object-cover mb-1" />
                            )}
                            {msg.type === 'STICKER' && msg.mediaUrl && (
                                <img src={msg.mediaUrl} alt="Sticker" className="rounded-md max-h-32 object-contain mb-1" />
                            )}
                            {/* Simple fallback for other media */}
                            {msg.type !== 'TEXT' && msg.type !== 'IMAGE' && msg.type !== 'STICKER' && (
                                <div className="flex items-center gap-2 p-2 bg-black/10 rounded">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-xs italic">{msg.type} Message</span>
                                </div>
                            )}

                            {msg.content}
                            <span className={cn("text-[10px] self-end opacity-70", msg.fromMe ? "text-primary-foreground" : "text-muted-foreground")}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t flex items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                />
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Paperclip className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" side="top" align="start">
                        <div className="flex flex-col gap-1">
                            <Button variant="ghost" size="sm" className="justify-start gap-2" onClick={() => triggerUpload('image')}>
                                <ImageIcon className="h-4 w-4" /> Image
                            </Button>
                            <Button variant="ghost" size="sm" className="justify-start gap-2" onClick={() => triggerUpload('video')}>
                                <Video className="h-4 w-4" /> Video
                            </Button>
                            <Button variant="ghost" size="sm" className="justify-start gap-2" onClick={() => triggerUpload('audio')}>
                                <Music className="h-4 w-4" /> Audio
                            </Button>
                            <Button variant="ghost" size="sm" className="justify-start gap-2" onClick={() => triggerUpload('document')}>
                                <FileText className="h-4 w-4" /> Document
                            </Button>
                            <Button variant="ghost" size="sm" className="justify-start gap-2" onClick={() => triggerUpload('sticker')}>
                                <StickerIcon className="h-4 w-4" /> Sticker
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
                <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1"
                />
                <Button onClick={handleSend} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
