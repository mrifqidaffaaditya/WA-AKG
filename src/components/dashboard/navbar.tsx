import { MobileNav } from "@/components/dashboard/mobile-nav";
import { SessionSelector } from "@/components/dashboard/session-selector";
import { Button } from "@/components/ui/button";
import { RealtimeClock } from "@/components/dashboard/realtime-clock";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Inbox } from "lucide-react";

interface NavbarProps {
    appName?: string;
}

export function Navbar({ appName }: NavbarProps) {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10 w-full">
            <div className="flex items-center gap-4">
                <MobileNav appName={appName} />
            </div>



            <div className="flex items-center gap-4">
                <RealtimeClock />
                <SessionSelector />
                <div className="h-6 w-px bg-gray-200 mx-2" />

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5 text-gray-500" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                        <div className="p-4 border-b">
                            <h4 className="font-semibold leading-none">Notifications</h4>
                            <p className="text-sm text-muted-foreground mt-1">You have unread updates.</p>
                        </div>
                        <div className="min-h-[150px] flex flex-col items-center justify-center text-center p-4">
                            <div className="bg-slate-100 p-3 rounded-full mb-3">
                                <Inbox className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-sm font-medium">No new notifications</p>
                            <p className="text-xs text-muted-foreground max-w-[180px]">We'll notify you when something important arrives.</p>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </header>
    );
}
