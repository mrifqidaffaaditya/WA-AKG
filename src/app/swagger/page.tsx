"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { ArrowLeft, BookOpen, ShieldCheck } from "lucide-react";

export default function ApiDocsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // Suppress Swagger UI legacy lifecycle warnings (ModelCollapse)
        const originalWarn = console.warn;
        console.warn = (...args) => {
            if (typeof args[0] === 'string' &&
                args[0].includes('UNSAFE_componentWillReceiveProps') &&
                args[0].includes('ModelCollapse')) {
                return;
            }
            originalWarn(...args);
        };

        return () => {
            console.warn = originalWarn;
        };
    }, []);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <div className="text-gray-600 text-sm font-medium">Loading API Documentation...</div>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated" || !session?.user) {
        if (typeof window !== "undefined") {
            router.push("/auth/login?callbackUrl=/swagger");
        }
        return null;
    }

    return (
        <div className="min-h-screen bg-white">
            <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-xs font-semibold tracking-wide backdrop-blur-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Dashboard
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-200" />
                                WA-AKG API Documentation
                            </h1>
                            <p className="text-blue-100 text-xs mt-0.5">
                                Interactive API specifications & testing playground
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-xs text-blue-100 border border-white/20">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                            {session.user.email} ({session.user.role || "USER"})
                        </span>
                        <Link
                            href="/dashboard/api-docs"
                            className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-xs font-medium"
                        >
                            Overview
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto py-6 px-4">
                <SwaggerUI url="/api/docs" />
            </main>
        </div>
    );
}

