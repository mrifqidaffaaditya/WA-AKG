"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquarePlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";
import { io } from "socket.io-client";

interface ChatContact {
    jid: string;
    name: string | null;
    notify: string | null;
    profilePic: string | null;
    lastMessage?: {
        content: string | null;
        timestamp: string;
        type: string;
    }
}

interface ChatListProps {
    sessionId: string;
    onSelectChat: (jid: string, name?: string) => void;
    selectedJid?: string;
}

export function ChatList({ sessionId, onSelectChat, selectedJid }: ChatListProps) {
    const [chats, setChats] = useState<ChatContact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await fetch(`/api/chat/${sessionId}`);
                if (res.ok) {
                    const data = await res.json();
                    setChats(data);
                }
            } catch (error) {
                console.error("Failed to load chats", error);
            } finally {
                setLoading(false);
            }
        };

        if (sessionId) {
            fetchChats();

            const socket = io({
                path: "/api/socket/io",
                addTrailingSlash: false,
            });

            socket.on("connect", () => {
                socket.emit("join-session", sessionId);
            });

            socket.on("message.update", (newMessages: any[]) => {
                // We could optimise this by only updating the specific chat
                // But simplified: Update last message for existing chat OR Refetch if new chat

                setChats((prevChats) => {
                    let updatedChats = [...prevChats];
                    let needsReorder = false;

                    newMessages.forEach(msg => {
                        const chatIndex = updatedChats.findIndex(c => c.jid === msg.remoteJid);
                        if (chatIndex !== -1) {
                            // Update existing
                            updatedChats[chatIndex] = {
                                ...updatedChats[chatIndex],
                                lastMessage: {
                                    content: msg.content,
                                    timestamp: msg.timestamp,
                                    type: msg.type
                                }
                            };
                            needsReorder = true;
                        } else {
                            // New chat - fetch all again to get profile pic etc? 
                            // Or just optimistic add? 
                            // Let's refetch to be safe for now, or just ignore until user refresh 
                            fetchChats();
                        }
                    });

                    if (needsReorder) {
                        updatedChats.sort((a, b) => {
                            const tA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
                            const tB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
                            return tB - tA;
                        });
                    }

                    return updatedChats;
                });
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [sessionId]);

    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [newChatNumber, setNewChatNumber] = useState("");

    if (loading) {
        return <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>;
    }

    const handleStartNewChat = () => {
        if (!newChatNumber) return;
        // Basic cleaning
        let clean = newChatNumber.replace(/\D/g, '');
        if (clean.startsWith('0')) clean = '62' + clean.substring(1); // ID Auto-fix
        const jid = `${clean}@s.whatsapp.net`;
        onSelectChat(jid); // No name for new chats
        setIsNewChatOpen(false);
        setNewChatNumber("");
    };

    // Helper to get display name from contact
    const getContactDisplayName = (chat: ChatContact): string => {
        return chat.name || chat.notify || chat.jid.split('@')[0];
    };

    return (
        <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="font-semibold text-lg">Chats</h3>
                <Button variant="outline" size="sm" onClick={() => setIsNewChatOpen(!isNewChatOpen)}>
                    <MessageSquarePlus className="h-4 w-4 mr-1" /> New
                </Button>
            </div>

            {isNewChatOpen && (
                <div className="p-3 bg-white border rounded-md shadow-sm mb-2 space-y-2">
                    <Label className="text-xs">Phone Number (e.g. 628...)</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="628123456789"
                            value={newChatNumber}
                            onChange={(e) => setNewChatNumber(e.target.value)}
                            className="h-8"
                        />
                        <Button size="sm" onClick={handleStartNewChat}>Go</Button>
                    </div>
                </div>
            )}

            <div className="overflow-y-auto h-[calc(100vh-200px)] space-y-2">
                {chats.map((chat) => {
                    const displayName = getContactDisplayName(chat);
                    return (
                        <Card
                            key={chat.jid}
                            className={cn(
                                "p-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-3",
                                selectedJid === chat.jid && "bg-slate-100 border-primary"
                            )}
                            onClick={() => onSelectChat(chat.jid, displayName)}
                        >
                            <Avatar>
                                <AvatarImage src={chat.profilePic || ""} />
                                <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-semibold text-sm truncate">{displayName}</h4>
                                    {chat.lastMessage && (
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground block w-full truncate">
                                    {chat.lastMessage?.content
                                        ? chat.lastMessage.content.length > 15
                                            ? chat.lastMessage.content.slice(0, 15) + "..."
                                            : chat.lastMessage.content
                                        : "No messages"}

                                </p>
                            </div>
                        </Card>
                    );
                })}
            </div>
            {chats.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    No chats found.
                </div>
            )}
        </div>
    );
}
