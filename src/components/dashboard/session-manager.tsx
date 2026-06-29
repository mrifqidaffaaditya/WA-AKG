'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import QRCode from 'qrcode';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { Label } from '@/components/ui/label';
import { Smartphone, Plus, Trash2, Settings, RefreshCw, Power, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type Session = {
    id: string;
    name: string;
    sessionId: string;
    status: string;
    qr?: string | null;
    user?: {
        name: string | null;
        email: string;
    } | null;
};

export function SessionManager({ user }: { user: any }) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [newSessionName, setNewSessionName] = useState("");
    const [newSessionId, setNewSessionId] = useState("");
    const [loading, setLoading] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchSessions();

        // Init Socket
        const socketInstance = io({
            path: "/api/socket/io",
            addTrailingSlash: false,
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected');
        });

        socketInstance.on('connection.update', (data: { sessionId: string, status: string, qr: string }) => {
            // Update specific session status if match
            setSessions(prev => prev.map(s => {
                if (s.sessionId === data.sessionId) {
                    return { ...s, status: data.status, qr: data.qr };
                }
                return s;
            }));

            if (data.status === 'CONNECTED') {
                fetchSessions(); // Refresh purely to get updated state from DB if needed
            }
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const fetchSessions = () => {
        fetch('/api/sessions').then(res => res.json()).then(responseData => {
            const data = responseData?.data || [];
            if (Array.isArray(data)) setSessions(data);
        });
    }

    const createSession = async () => {
        if (!newSessionName) {
            toast.error("Session name is required");
            return;
        }

        // If ID matches existing
        if (newSessionId && sessions.some(s => s.sessionId === newSessionId)) {
            toast.error("Session ID already exists");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    name: newSessionName,
                    sessionId: newSessionId || undefined // Optional, backend will generate if empty
                })
            });
            const responseData = await res.json();
            const session = responseData?.data;

            if (!res.ok || !session) throw new Error(responseData.error || responseData.message || "Failed to create");

            setSessions([...sessions, session]);
            setNewSessionName("");
            setNewSessionId("");
            toast.success("Session created successfully");

            // Optionally redirect immediately or let user choose
            // router.push(`/dashboard/sessions/${session.sessionId}`);
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "Failed to create session");
        } finally {
            setLoading(false);
        }
    };

    const handleManageSession = (sessionId: string) => {
        router.push(`/dashboard/sessions/${sessionId}`);
    }

    return (
        <div className="space-y-8">
            {/* Create New Session Card */}
            <Card className="bg-slate-50 border-dashed border-2">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Plus className="h-5 w-5" /> Create New Session
                    </CardTitle>
                    <CardDescription>
                        Add a new WhatsApp account to manage.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="session-name">Session Name</Label>
                            <Input
                                id="session-name"
                                value={newSessionName}
                                onChange={e => setNewSessionName(e.target.value)}
                                placeholder="My Business WA"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="session-id">Custom Session ID (Optional)</Label>
                            <Input
                                id="session-id"
                                value={newSessionId}
                                onChange={e => setNewSessionId(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                                placeholder="unique-id-123"
                            />
                            <p className="text-[10px] text-muted-foreground">Only letters, numbers, hyphens.</p>
                        </div>
                        <Button onClick={createSession} disabled={loading}>
                            {loading ? 'Creating...' : 'Create Session'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Sessions Table Card */}
            <div>
                {sessions.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-lg border border-border/50">
                        No sessions found. Create one above to get started.
                    </div>
                ) : (
                    <Card className="glass-panel border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 pt-5 px-5">
                            <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                Active Sessions ({sessions.length})
                            </CardTitle>
                            <CardDescription>
                                List of active WhatsApp sessions and their current connection status.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="px-5 text-xs uppercase tracking-wider font-semibold">Session / Device</TableHead>
                                        <TableHead className="text-xs uppercase tracking-wider font-semibold">Status</TableHead>
                                        <TableHead className="text-xs uppercase tracking-wider font-semibold">Owner</TableHead>
                                        <TableHead className="text-right px-5 text-xs uppercase tracking-wider font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sessions.map(session => (
                                        <TableRow key={session.id} className="hover:bg-muted/20 dark:hover:bg-muted/5 transition-colors">
                                            <TableCell className="px-5 py-3 font-medium">
                                                <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{session.name}</div>
                                                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{session.sessionId}</div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Badge 
                                                    variant={session.status === 'CONNECTED' ? 'default' : 'secondary'}
                                                    className={`text-[10px] font-semibold transition-all px-2 py-0.5 shrink-0 inline-flex items-center ${
                                                        session.status === 'CONNECTED' 
                                                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20' 
                                                            : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                                                        session.status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                                                    }`} />
                                                    {session.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                {session.user ? (
                                                    <div className="leading-tight">
                                                        <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs">{session.user.name || "No Name"}</div>
                                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{session.user.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/50">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-3 text-right px-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-8 px-2.5 text-xs rounded-lg hover:bg-primary/5 transition-colors border-border/50"
                                                        onClick={() => router.push(`/dashboard/sessions/access?session=${session.sessionId}`)}
                                                    >
                                                        <UserPlus className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" /> Share
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-8 px-2.5 text-xs rounded-lg hover:bg-primary/5 transition-colors border-border/50"
                                                        onClick={() => handleManageSession(session.sessionId)}
                                                    >
                                                        <Settings className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" /> Manage
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
