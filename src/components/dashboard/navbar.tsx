import { MobileNav } from "@/components/dashboard/mobile-nav";
import { UserNav } from "@/components/dashboard/user-nav";
import { SessionSelector } from "@/components/dashboard/session-selector";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

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
                <SessionSelector />
                <div className="h-6 w-px bg-gray-200 mx-2" />
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-500" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
                </Button>
            </div>
        </header>
    );
}
