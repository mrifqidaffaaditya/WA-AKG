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
            <div className="flex h-screen bg-background relative overflow-hidden">
                {/* Ambient Dashboard Background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]" />
                </div>

                {/* Sidebar */}
                <aside className="w-[280px] bg-background/60 backdrop-blur-xl border-r border-border/50 hidden md:flex flex-col h-full sticky left-0 top-0 z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                    {/* Logo / Brand */}
                    <div className="px-6 py-6 border-b border-border/50">
                        <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">{appName}</h1>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">WhatsApp Gateway</p>
                    </div>

                    {/* Navigation */}
                    <SidebarNav />

                    {/* User Footer */}
                    <div className="p-5 border-t border-border/50 bg-background/40">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-sm font-bold text-primary border border-primary/20 shadow-inner">
                                {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{session?.user?.name || "User"}</p>
                                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                            </div>
                        </div>
                        <form action={async () => {
                            'use server';
                            await signOut();
                        }}>
                            <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2 text-xs h-9 rounded-xl border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors">
                                <LogOut size={14} /> Sign Out
                            </Button>
                        </form>
                        <p className="text-[10px] text-muted-foreground/60 text-center mt-3 font-mono">v{pkg.version}</p>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative z-10">
                    <Navbar appName={appName} />
                    <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 styled-scrollbar">
                        {children}
                    </main>
                </div>
                <Toaster />
            </div>
        </SessionProvider>
    );
}
