import Link from "next/link";
import { ArrowRight, Bot, Check, Globe, LayoutDashboard, MessageSquare, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Bot className="h-6 w-6 text-green-600" />
            <span>WA-AKG</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-green-600">Features</Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-green-600">Pricing</Link>
            <Link href="/docs/USER_GUIDE.md" className="text-sm font-medium hover:text-green-600">Docs</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="hover:text-green-600">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-green-600 hover:bg-green-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container px-4 py-24 md:py-32 md:px-6 lg:py-40">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                🚀 Version 1.0 is Live
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                The Ultimate <span className="text-green-600">WhatsApp Gateway</span> & Management Dashboard
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Self-hosted, multi-session WhatsApp management with Scheduler, Auto-Replies, Webhooks, and a powerful API.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 bg-green-600 hover:bg-green-700 text-lg">
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="https://github.com/mrifqidaffaaditya/WA-AKG">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                  View Source Code
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="container px-4 py-16 md:py-24 md:px-6 bg-white rounded-3xl shadow-sm my-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Everything you need</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Built for developers and businesses who need full control over their WhatsApp communications.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Globe,
                title: "Multi-Session",
                desc: "Connect unlimited WhatsApp accounts via QR Code and manage them from a single dashboard."
              },
              {
                icon: Zap,
                title: "Real-time API",
                desc: "Low latency message sending and receiving. Perfect for chatbots and notifications."
              },
              {
                icon: MessageSquare,
                title: "Auto Replies",
                desc: "Create smart keyword-based auto-replies to engage customers 24/7 automatically."
              },
              {
                icon: Bot,
                title: "Webhook Events",
                desc: "Forward incoming messages, status updates, and connection events to your own server."
              },
              {
                icon: LayoutDashboard,
                title: "Broadcast Scheduler",
                desc: "Schedule campaigns with anti-ban random delays and detailed status reporting."
              },
              {
                icon: Shield,
                title: "Role-Based Access",
                desc: "Secure your dashboard with granular permissions for Owners, Admins, and Users."
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-start p-6 rounded-xl border bg-slate-50 hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-100 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-green-700" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container px-4 py-24 md:px-6">
          <div className="relative rounded-3xl bg-green-900 px-6 py-16 md:px-16 md:py-20 text-center text-white overflow-hidden">
            {/* Abstract blobs */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-700 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-500 rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

            <h2 className="text-3xl font-bold mb-6 relative z-10">Ready to take control?</h2>
            <p className="text-green-100 max-w-2xl mx-auto mb-10 text-lg relative z-10">
              Deploy your own instance of WA-AKG today and start building powerful WhatsApp integrations.
            </p>
            <Link href="/auth/register" className="relative z-10">
              <Button size="lg" variant="secondary" className="h-12 px-8 font-bold text-green-900">
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white">
        <div className="container px-4 py-12 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-700">
            <Bot className="h-5 w-5 text-green-600" />
            <span>WA-AKG</span>
          </div>
          <p className="text-sm text-gray-500 text-center md:text-left">
            © 2024 WA-AKG. Open Source Project. Built by <a href="https://github.com/mrifqidaffaaditya" className="font-medium hover:text-green-600 underline underline-offset-4">Aditya</a>.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-gray-400 hover:text-gray-900">
              <span className="sr-only">GitHub</span>
              <Globe className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
