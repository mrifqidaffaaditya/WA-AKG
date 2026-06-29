'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error('Application runtime error boundary caught:', error);
  }, [error]);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-[80vh]" suppressHydrationWarning>
        <div className="w-10 h-10 rounded-full border-4 border-destructive/20 border-t-destructive animate-spin" suppressHydrationWarning />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 min-h-[80vh] w-full" suppressHydrationWarning>
      <div className="w-full max-w-lg bg-background/50 dark:bg-background/20 backdrop-blur-3xl border border-destructive/20 shadow-2xl shadow-destructive/5 rounded-3xl p-8 sm:p-12 flex flex-col items-center relative overflow-hidden" suppressHydrationWarning>
        {/* Glow Effect behind the card content */}
        <div className="absolute inset-0 bg-gradient-to-b from-destructive/10 to-transparent pointer-events-none" suppressHydrationWarning />
        
        {/* Decorative Icon */}
        <div className="relative w-24 h-24 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-8 ring-8 ring-destructive/5" suppressHydrationWarning>
          <AlertTriangle className="size-12 animate-pulse" />
        </div>

        {/* Text Content */}
        <div className="relative text-center mb-10 w-full" suppressHydrationWarning>
          <h1 className="text-6xl font-black tracking-tight text-destructive font-mono mb-3 drop-shadow-sm" suppressHydrationWarning>
            Error 500
          </h1>
          <h2 className="text-xl font-bold text-foreground mb-4" suppressHydrationWarning>
            Sistem Mengalami Kendala
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto" suppressHydrationWarning>
            Maaf, terjadi kesalahan tak terduga pada aplikasi. Tim kami telah diberitahu mengenai masalah ini.
          </p>
        </div>

        {/* Actions */}
        <div className="relative w-full flex flex-col sm:flex-row gap-4 mb-6" suppressHydrationWarning>
          <Button
            onClick={() => reset()}
            variant="outline"
            className="w-full flex-1 flex items-center justify-center gap-2 h-12 border-destructive/20 hover:bg-destructive/10 text-destructive hover:text-destructive rounded-xl transition-all shadow-sm"
          >
            <RotateCcw className="size-4" />
            <span>Coba Lagi</span>
          </Button>
          <Button
            asChild
            variant="default"
            className="w-full flex-1 flex items-center justify-center gap-2 h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20 rounded-xl transition-all"
          >
            <Link href="/dashboard">
              <Home className="size-4" />
              <span>Dashboard</span>
            </Link>
          </Button>
        </div>
        
        {/* Error Details */}
        <div className="relative w-full border-t border-border/40 pt-6" suppressHydrationWarning>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mx-auto w-full py-2"
          >
            {showDetails ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            <span>{showDetails ? 'Sembunyikan detail teknis' : 'Lihat detail teknis'}</span>
          </button>

          {showDetails && (
            <div className="mt-4 p-5 bg-black/5 dark:bg-white/5 rounded-xl border border-border/30 text-left space-y-3 max-h-56 overflow-y-auto font-mono text-[11px] leading-relaxed break-all text-muted-foreground custom-scrollbar" suppressHydrationWarning>
              <div suppressHydrationWarning>
                <span className="font-semibold text-foreground">Message:</span> {error.message || 'Unknown runtime error'}
              </div>
              {error.digest && (
                <div suppressHydrationWarning>
                  <span className="font-semibold text-foreground">Digest ID:</span> {error.digest}
                </div>
              )}
              {error.stack && (
                <div className="whitespace-pre-wrap mt-2 pt-3 border-t border-border/20 text-[10px] opacity-80" suppressHydrationWarning>
                  {error.stack}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
