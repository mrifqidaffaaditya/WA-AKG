"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    keyId: string;
    content: string;
    fromMe: boolean;
    timestamp: string;
    type: string;
    status: string;
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

    const fetchMessages = async () => {
        try {
            // We need to implement this API endpoint specifically later, 
            // for now assume /api/chat/:sessionId/:jid or query param
            const res = await fetch(`/api/chat/${sessionId}/${encodeURIComponent(jid)}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                // Scroll to bottom
            }
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    }

    useEffect(() => {
        fetchMessages();
        // Setup socket listener for new messages here? 
        // Or refetch interval for simplicity first.
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
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
                <div className="space-y-4" ref={scrollRef}>
                    {messages.map((msg) => (
                        <div
                            key={msg.keyId}
                            className={cn(
                                "flex w-fit max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm shadow-sm break-words whitespace-pre-wrap",
                                msg.fromMe
                                    ? "ml-auto bg-primary text-primary-foreground"
                                    : "bg-white border"
                            )}
                        >
                            {msg.content}
                            <span className={cn("text-[10px] self-end opacity-70", msg.fromMe ? "text-primary-foreground" : "text-muted-foreground")}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t flex items-center gap-2">
                <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                </Button>
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
