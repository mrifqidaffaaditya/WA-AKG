import Link from "next/link";
import { ArrowRight, Bot, Github, Zap, Shield, Globe, MessageSquare, Clock, Code } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "WA-AKG | Modern WhatsApp Gateway Management",
  description: "A powerful, self-hosted dashboard to manage your WhatsApp sessions, schedules, and auto-replies. Built for developers and businesses.",
  openGraph: {
    title: "WA-AKG | Modern WhatsApp Gateway Management",
    description: "Self-hosted WhatsApp Gateway with Multi-device support, Auto-replies, and API integration.",
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white overflow-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="p-1 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">WA-AKG</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">Features</Link>
            <Link href="/docs" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">API Docs</Link>
            <Link href="https://github.com/mrifqidaffaaditya/WA-AKG" className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">GitHub</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button size="sm" className="rounded-full px-6 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-50 via-white to-white opacity-70"></div>
          <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/3 w-[800px] h-[800px] rounded-full bg-green-100/50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -z-10 -translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] rounded-full bg-blue-100/50 blur-3xl"></div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
              <div className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-700 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <span className="flex h-2 w-2 rounded-full bg-green-600 mr-2"></span>
                v1.2.0 is now available
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-b from-slate-900 to-slate-700 bg-clip-text text-transparent pb-2">
                  WhatsApp Gateway <br className="hidden sm:block" />
                  <span className="text-green-600">Reimagined.</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl leading-relaxed">
                  The complete open-source solution for managing WhatsApp sessions, creating auto-replies, and broadcasting messages via API.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/dashboard">
                  <Button size="lg" className="h-14 px-8 rounded-full bg-green-600 hover:bg-green-700 text-lg shadow-xl shadow-green-600/20 transition-all hover:scale-105">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg border-2 hover:bg-slate-50 transition-all">
                    Read Documentation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-slate-50/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-slate-900">Everything you need</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Powerful features packaged in a clean, intuitive interface. Built for stability and performance.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Zap className="h-6 w-6 text-yellow-500" />}
                title="Instant API"
                description="Send messages, media, and location instantly via our robust REST API."
              />
              <FeatureCard
                icon={<MessageSquare className="h-6 w-6 text-blue-500" />}
                title="Auto Replies"
                description="Set up smart, keyword-based auto-replies to handle customer queries 24/7."
              />
              <FeatureCard
                icon={<Clock className="h-6 w-6 text-purple-500" />}
                title="Scheduler"
                description="Schedule messages for future delivery. Perfect for reminders and campaigns."
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6 text-green-500" />}
                title="Secure & Private"
                description="Self-hosted means your data stays with you. No third-party tracking."
              />
              <FeatureCard
                icon={<Code className="h-6 w-6 text-pink-500" />}
                title="Developer Ready"
                description="Webhooks implementation and full Swagger documentation included."
              />
              <FeatureCard
                icon={<Globe className="h-6 w-6 text-cyan-500" />}
                title="Multi-Session"
                description="Connect and manage multiple WhatsApp numbers from a single dashboard."
              />
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-20 border-t bg-white">
          <div className="container px-4 md:px-6 text-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">Powered by modern technologies</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Simplified logos using text for now, could be replaced with SVGs */}
              <span className="text-xl font-bold flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-black"></div>Next.js</span>
              <span className="text-xl font-bold flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-blue-600"></div>TypeScript</span>
              <span className="text-xl font-bold flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-green-500"></div>Baileys</span>
              <span className="text-xl font-bold flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-teal-600"></div>Prisma</span>
              <span className="text-xl font-bold flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-cyan-400"></div>Tailwind</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-slate-900 text-slate-300 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-green-500" />
              <span className="text-xl font-bold text-white">WA-AKG</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="https://github.com/mrifqidaffaaditya/WA-AKG" className="hover:text-white transition-colors">GitHub</Link>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} WA-AKG. MIT License.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group relative p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="mb-4 inline-flex p-3 rounded-xl bg-slate-50 group-hover:bg-slate-100 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-900">{title}</h3>
      <p className="text-gray-500 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
