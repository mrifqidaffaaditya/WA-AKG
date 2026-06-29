'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, ShieldAlert, Lock, Hourglass, HelpCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorConfig {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  colorTheme: 'amber' | 'rose' | 'destructive' | 'indigo' | 'primary';
}

const ERROR_CONFIGS: Record<string, ErrorConfig> = {
  '400': {
    icon: <AlertCircle className="size-12 animate-pulse" />,
    title: '400',
    subtitle: 'Permintaan Tidak Valid',
    description: 'Server tidak dapat memproses permintaan Anda karena format yang tidak valid.',
    colorTheme: 'amber',
  },
  '401': {
    icon: <Lock className="size-12 animate-pulse" />,
    title: '401',
    subtitle: 'Akses Ditolak',
    description: 'Anda harus masuk (login) terlebih dahulu untuk mengakses halaman ini.',
    colorTheme: 'rose',
  },
  '403': {
    icon: <ShieldAlert className="size-12 animate-pulse" />,
    title: '403',
    subtitle: 'Akses Terlarang',
    description: 'Anda tidak memiliki izin yang cukup untuk mengakses halaman atau sumber daya ini.',
    colorTheme: 'destructive',
  },
  '429': {
    icon: <Hourglass className="size-12 animate-pulse" />,
    title: '429',
    subtitle: 'Terlalu Banyak Permintaan',
    description: 'Batas permintaan terlampaui. Harap tunggu beberapa saat sebelum mencoba lagi.',
    colorTheme: 'indigo',
  },
  '500': {
    icon: <AlertCircle className="size-12 animate-pulse" />,
    title: '500',
    subtitle: 'Kesalahan Server',
    description: 'Terjadi kesalahan tak terduga pada server saat memproses permintaan Anda.',
    colorTheme: 'destructive',
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const code = searchParams.get('code') || '500';
  const customMessage = searchParams.get('message');

  useEffect(() => {
    setMounted(true);
  }, []);

  const config = ERROR_CONFIGS[code] || {
    icon: <HelpCircle className="size-12 animate-pulse" />,
    title: code,
    subtitle: 'Terjadi Kesalahan',
    description: customMessage || 'Terjadi kesalahan atau kendala tak terduga pada aplikasi.',
    colorTheme: 'primary',
  };

  // Maps to standard classes so Tailwind compiler statically detects them
  const colorMap = {
    amber: { text: 'text-amber-500', bg: 'bg-amber-500', bgSoft: 'bg-amber-500/10', border: 'border-amber-500/20', borderDark: 'border-amber-500', hoverBg: 'hover:bg-amber-500/10', hoverText: 'hover:text-amber-500', from: 'from-amber-500/10', ring: 'ring-amber-500/5', shadow: 'shadow-amber-500/5', btnShadow: 'shadow-amber-500/20' },
    rose: { text: 'text-rose-500', bg: 'bg-rose-500', bgSoft: 'bg-rose-500/10', border: 'border-rose-500/20', borderDark: 'border-rose-500', hoverBg: 'hover:bg-rose-500/10', hoverText: 'hover:text-rose-500', from: 'from-rose-500/10', ring: 'ring-rose-500/5', shadow: 'shadow-rose-500/5', btnShadow: 'shadow-rose-500/20' },
    destructive: { text: 'text-destructive', bg: 'bg-destructive', bgSoft: 'bg-destructive/10', border: 'border-destructive/20', borderDark: 'border-destructive', hoverBg: 'hover:bg-destructive/10', hoverText: 'hover:text-destructive', from: 'from-destructive/10', ring: 'ring-destructive/5', shadow: 'shadow-destructive/5', btnShadow: 'shadow-destructive/20' },
    indigo: { text: 'text-indigo-500', bg: 'bg-indigo-500', bgSoft: 'bg-indigo-500/10', border: 'border-indigo-500/20', borderDark: 'border-indigo-500', hoverBg: 'hover:bg-indigo-500/10', hoverText: 'hover:text-indigo-500', from: 'from-indigo-500/10', ring: 'ring-indigo-500/5', shadow: 'shadow-indigo-500/5', btnShadow: 'shadow-indigo-500/20' },
    primary: { text: 'text-primary', bg: 'bg-primary', bgSoft: 'bg-primary/10', border: 'border-primary/20', borderDark: 'border-primary', hoverBg: 'hover:bg-primary/10', hoverText: 'hover:text-primary', from: 'from-primary/10', ring: 'ring-primary/5', shadow: 'shadow-primary/5', btnShadow: 'shadow-primary/20' },
  }[config.colorTheme as keyof typeof colorMap] || colorMap['primary'];

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-[80vh]" suppressHydrationWarning>
        <div className={`w-10 h-10 rounded-full border-4 ${colorMap.border} border-t-transparent animate-spin`} suppressHydrationWarning />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 min-h-[80vh] w-full" suppressHydrationWarning>
      <div className={`w-full max-w-lg bg-background/50 dark:bg-background/20 backdrop-blur-3xl border ${colorMap.border} shadow-2xl ${colorMap.shadow} rounded-3xl p-8 sm:p-12 flex flex-col items-center relative overflow-hidden`} suppressHydrationWarning>
        {/* Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-b ${colorMap.from} to-transparent pointer-events-none`} suppressHydrationWarning />
        
        {/* Decorative Icon */}
        <div className={`relative w-24 h-24 ${colorMap.bgSoft} ${colorMap.text} rounded-full flex items-center justify-center mb-8 ring-8 ${colorMap.ring}`} suppressHydrationWarning>
          {config.icon}
        </div>

        {/* Text Content */}
        <div className="relative text-center mb-10 w-full" suppressHydrationWarning>
          <h1 className={`text-6xl font-black tracking-tight ${colorMap.text} font-mono mb-3 drop-shadow-sm`} suppressHydrationWarning>
            {config.title}
          </h1>
          <h2 className="text-xl font-bold text-foreground mb-4" suppressHydrationWarning>
            {config.subtitle}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto" suppressHydrationWarning>
            {customMessage || config.description}
          </p>
        </div>

        {/* Actions */}
        <div className="relative w-full flex flex-col sm:flex-row gap-4" suppressHydrationWarning>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className={`w-full flex-1 flex items-center justify-center gap-2 h-12 ${colorMap.border} ${colorMap.hoverBg} ${colorMap.text} ${colorMap.hoverText} rounded-xl transition-all shadow-sm`}
          >
            <ArrowLeft className="size-4" />
            <span>Kembali</span>
          </Button>
          <Button
            asChild
            className={`w-full flex-1 flex items-center justify-center gap-2 h-12 ${colorMap.bg} hover:opacity-90 text-white shadow-lg ${colorMap.btnShadow} rounded-xl transition-all`}
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

export default function GenericErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-4 min-h-[80vh]" suppressHydrationWarning>
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" suppressHydrationWarning />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
