'use client';

import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import '@/app/globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased flex items-center justify-center p-4 sm:p-6 md:p-8" suppressHydrationWarning>
        <div className="w-full max-w-lg bg-background/50 backdrop-blur-3xl border border-destructive/20 shadow-2xl shadow-destructive/5 rounded-3xl p-8 sm:p-12 flex flex-col items-center relative overflow-hidden" suppressHydrationWarning>
          {/* Glow Effect behind the card content */}
          <div className="absolute inset-0 bg-gradient-to-b from-destructive/10 to-transparent pointer-events-none" suppressHydrationWarning />
          
          {/* Decorative Icon */}
          <div className="relative w-24 h-24 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-8 ring-8 ring-destructive/5" suppressHydrationWarning>
            <AlertOctagon className="size-12 animate-pulse" />
          </div>

          {/* Text Content */}
          <div className="relative text-center mb-10 w-full" suppressHydrationWarning>
            <h1 className="text-5xl font-black tracking-tight text-destructive mb-3 drop-shadow-sm" suppressHydrationWarning>
              Fatal Error
            </h1>
            <h2 className="text-xl font-bold text-foreground mb-4" suppressHydrationWarning>
              Sistem Mengalami Kendala Kritis
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto" suppressHydrationWarning>
              Aplikasi mengalami kesalahan pada konfigurasi dasar. Silakan muat ulang sistem.
            </p>
          </div>

          {/* Action */}
          <div className="relative w-full flex flex-col sm:flex-row gap-4" suppressHydrationWarning>
            <button
              onClick={() => reset()}
              className="w-full flex-1 flex items-center justify-center gap-2 h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium rounded-xl transition-all shadow-lg shadow-destructive/20 active:scale-95 duration-150"
            >
              <RotateCcw className="size-4" />
              <span>Muat Ulang Aplikasi</span>
            </button>
          </div>

          {error.digest && (
            <div className="relative mt-8 text-[11px] text-muted-foreground font-mono bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-border/30 w-full text-center break-all" suppressHydrationWarning>
              Digest ID: {error.digest}
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
