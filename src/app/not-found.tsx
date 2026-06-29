'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-[80vh]" suppressHydrationWarning>
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" suppressHydrationWarning />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 min-h-[80vh] w-full" suppressHydrationWarning>
      <div className="w-full max-w-lg bg-background/50 dark:bg-background/20 backdrop-blur-3xl border border-primary/20 shadow-2xl shadow-primary/5 rounded-3xl p-8 sm:p-12 flex flex-col items-center relative overflow-hidden" suppressHydrationWarning>
        {/* Glow Effect behind the card content */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" suppressHydrationWarning />
        
        {/* Decorative Icon */}
        <div className="relative w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8 ring-8 ring-primary/5" suppressHydrationWarning>
          <FileQuestion className="size-12 animate-pulse" />
        </div>

        {/* Text Content */}
        <div className="relative text-center mb-10 w-full" suppressHydrationWarning>
          <h1 className="text-7xl font-black tracking-tight text-primary font-mono mb-3 drop-shadow-sm" suppressHydrationWarning>
            404
          </h1>
          <h2 className="text-xl font-bold text-foreground mb-4" suppressHydrationWarning>
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto" suppressHydrationWarning>
            Maaf, halaman yang Anda cari mungkin telah dihapus, dipindahkan, atau memang tidak pernah ada.
          </p>
        </div>

        {/* Actions */}
        <div className="relative w-full flex flex-col sm:flex-row gap-4" suppressHydrationWarning>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full flex-1 flex items-center justify-center gap-2 h-12 border-primary/20 hover:bg-primary/10 text-primary hover:text-primary rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft className="size-4" />
            <span>Kembali</span>
          </Button>
          <Button
            asChild
            variant="default"
            className="w-full flex-1 flex items-center justify-center gap-2 h-12 shadow-lg shadow-primary/20 rounded-xl transition-all"
          >
            <Link href="/dashboard">
              <Home className="size-4" />
              <span>Beranda</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
