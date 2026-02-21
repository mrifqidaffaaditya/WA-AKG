import { Button } from "@/components/ui/button";
import { auth, signOut } from "@/lib/auth";
import { Navbar } from "@/components/dashboard/navbar";
import { SessionProvider } from "@/components/dashboard/session-provider";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { LogOut } from "lucide-react";
import { UpdateChecker } from "@/components/dashboard/update-checker";
import { prisma } from "@/lib/prisma";
import { Toaster } from "sonner";
import pkg from "../../../package.json";


export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    // @ts-ignore
    const systemConfig = await prisma.systemConfig.findUnique({ where: { id: "default" } });
    const appName = systemConfig?.appName || "WA-AKG";

    return (
        <SessionProvider>
            <UpdateChecker />
            <div className="flex h-screen bg-slate-50">
                {/* Sidebar */}
                <aside className="w-[260px] bg-white border-r border-slate-200 hidden md:flex flex-col h-full sticky left-0 top-0 z-20">
                    {/* Logo / Brand */}
                    <div className="px-5 py-5 border-b border-slate-100">
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{appName}</h1>
                        <p className="text-[11px] text-slate-400 mt-0.5">WhatsApp Gateway</p>
                    </div>

                    {/* Navigation */}
                    <SidebarNav />

                    {/* User Footer */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                                {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{session?.user?.name || "User"}</p>
                                <p className="text-[11px] text-slate-400 truncate">{session?.user?.email}</p>
                            </div>
                        </div>
                        <form action={async () => {
                            'use server';
                            await signOut();
                        }}>
                            <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2 text-xs h-8">
                                <LogOut size={14} /> Sign Out
                            </Button>
                        </form>
                        <p className="text-[10px] text-slate-300 text-center mt-2 font-mono">v{pkg.version}</p>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    <Navbar appName={appName} />
                    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
                <Toaster />
            </div>
        </SessionProvider>
    );
}
