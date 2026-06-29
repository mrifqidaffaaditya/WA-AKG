import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { TopLoader } from "@/components/ui/top-loader";
import { prisma } from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_DESCRIPTION = "Self-hosted WhatsApp Gateway with Multi-device support, Auto-replies, API integration, and session management dashboard.";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://wa-akg.app";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  let appName = "WA-AKG";
  try {
    // @ts-ignore
    const config = await prisma.systemConfig.findUnique({ where: { id: "default" } });
    if (config?.appName) appName = config.appName;
  } catch (e) {
    console.error("Failed to fetch system config for metadata:", e);
  }

  const appDefaultTitle = `${appName} | Premium WhatsApp Gateway`;

  return {
    metadataBase: new URL(APP_URL),
    title: {
      default: appDefaultTitle,
      template: `%s | ${appName}`,
    },
    description: APP_DESCRIPTION,
    applicationName: appName,
    generator: "Next.js",
    keywords: [
      "whatsapp gateway", "whatsapp api", "whatsapp bot", "whatsapp management",
      "self-hosted", "wa gateway", "whatsapp multi-device", "auto-reply",
      "whatsapp dashboard", "whatsapp web api"
    ],
    referrer: "origin-when-cross-origin",
    authors: [{ name: appName }],
    creator: appName,
    publisher: appName,
    formatDetection: { telephone: false },
    robots: {
      index: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
      follow: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
      googleBot: {
        index: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
        follow: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: appName,
      title: appDefaultTitle,
      description: APP_DESCRIPTION,
      url: APP_URL,
    },
    twitter: {
      card: "summary_large_image",
      title: appDefaultTitle,
      description: APP_DESCRIPTION,
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "apple-mobile-web-app-title": appName,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* Conditional robots meta (noindex for staging/dev) */}
        {!allowIndexing && <meta name="robots" content="noindex, nofollow" />}
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href={APP_URL} />
        <link rel="preconnect" href={APP_URL} crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-foreground bg-background selection:bg-primary/30 selection:text-primary-foreground min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        {/* Global ambient background glow for premium feel */}
        <div className="fixed inset-0 -z-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background dark:from-primary/10 dark:via-background dark:to-background pointer-events-none" suppressHydrationWarning={true} />
        <Providers>
          <TopLoader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
