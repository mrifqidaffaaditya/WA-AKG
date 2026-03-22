"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "./session-provider";

export function SessionSelector() {
    const { sessions, sessionId, setSessionId, loading, refreshSessions } = useSession();

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground hidden md:inline">Session:</span>
            <div className="w-[130px] sm:w-[180px]">
                <Select value={sessionId} onValueChange={setSessionId} disabled={loading || sessions.length === 0}>
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder={loading ? "Loading..." : "Select Session"} />
                    </SelectTrigger>
                    <SelectContent>
                        {sessions.map((s) => (
                            <SelectItem key={s.sessionId} value={s.sessionId}>
                                {s.name}
                            </SelectItem>
                        ))}
                        {sessions.length === 0 && !loading && (
                            <div className="p-2 text-sm text-muted-foreground text-center">No connected sessions</div>
                        )}
                    </SelectContent>
                </Select>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={refreshSessions} title="Refresh Sessions">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
        </div>
    );
}
