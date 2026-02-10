import Link from "next/link";
import { ArrowRight, Save, GitBranch, Palette, ChevronDown, Lock } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col text-foreground font-sans selection:bg-primary selection:text-white relative">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-lg group-hover:opacity-80 transition-opacity">
              A
            </div>
            <span className="text-xl font-bold tracking-tight">The Archive</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/manifesto" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Manifesto</Link>
            <Link href="/changelog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Changelog</Link>
            <div className="h-4 w-px bg-white/10" />
            <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Sign In</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col z-10 pt-20">
        <section className="relative min-h-[80vh] flex flex-col justify-center items-center text-center px-4 py-20">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              System Operational v2.4
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight">
              Construct.<br />
              <span className="text-muted-foreground">Collaborate.</span>{" "}
              <span className="text-primary">Persist.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              A collaborative atelier for the digital artisan. Permanent storage for ephemeral code. Join the network where logic meets legacy.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link
                href="/register"
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(59,130,246,0.3)] w-full sm:w-auto text-base text-center"
              >
                Join the Archive
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-transparent border border-foreground/20 hover:border-foreground/50 text-foreground font-medium rounded-lg transition-all w-full sm:w-auto text-base flex items-center justify-center gap-2"
              >
                <span>Access Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Scroll CTA */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40">
            <span className="text-xs uppercase tracking-[0.2em]">Scroll to Initialize</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-panel p-8 rounded-xl hover:bg-white/[0.05] transition-all duration-300 group border border-white/5 hover:border-primary/30">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                  <Save className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-foreground">Code Persistence</h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Immutable repositories designed for longevity. Your life&apos;s work is hashed, verified, and stored in a decentralized lattice, immune to platform decay.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-xl hover:bg-white/[0.05] transition-all duration-300 group border border-white/5 hover:border-primary/30">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                  <GitBranch className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-foreground">Collaborative Narrative</h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Build stories alongside your stack. Annotate commits with context, linking technical decisions to the human intent behind them.
                </p>
              </div>

              <div className="glass-panel p-8 rounded-xl hover:bg-white/[0.05] transition-all duration-300 group border border-white/5 hover:border-primary/30">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                  <Palette className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-foreground">Technical Atelier</h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Tools refined for the high-end developer. A distraction-free environment with intelligent syntax highlighting and minimalist version control.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Breaker */}
        <section className="py-20 px-6 border-y border-white/5 bg-black/20">
          <div className="max-w-4xl mx-auto text-center">
            <blockquote className="text-2xl md:text-4xl font-light leading-tight">
              &ldquo;The code we write today is the architecture of tomorrow&apos;s reality. Preserve it with intention.&rdquo;
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-primary" />
              <span className="text-sm text-muted-foreground uppercase tracking-widest">The Archive Manifesto</span>
              <div className="h-px w-12 bg-primary" />
            </div>
          </div>
        </section>

        {/* Recent Ingestions */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">Recent Ingestions</h2>
              <Link href="/login" className="text-primary hover:text-foreground transition-colors text-sm font-medium flex items-center gap-1">
                View Global Feed <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Neural Net Core", tag: "AI", desc: "Optimization algorithms for low-latency inference on edge devices.", status: "Active", statusColor: "bg-green-500", time: "2h ago" },
                { name: "Rust-Lattice", tag: "Sys", desc: "Distributed key-value store implementation with emphasis on atomic consistency.", status: "Beta", statusColor: "bg-yellow-500", time: "5h ago" },
                { name: "Void UI Kit", tag: "Design", desc: "A minimal component library for brutalist web interfaces.", status: "Stable", statusColor: "bg-blue-500", time: "1d ago" },
                { name: "Cipher-Stream", tag: "Sec", desc: "End-to-end encrypted stream processing for real-time applications.", status: "Audit", statusColor: "bg-purple-500", time: "2d ago" },
              ].map((item) => (
                <div key={item.name} className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="h-32 bg-gradient-to-br from-card to-background relative">
                    <div className="absolute inset-0 bg-grid-pattern opacity-30" />
                    {item.tag === "Sec" && (
                      <div className="absolute right-2 bottom-2">
                        <Lock className="w-10 h-10 text-primary/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold truncate">{item.name}</h4>
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{item.tag}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{item.desc}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                      <span className={`w-2 h-2 rounded-full ${item.statusColor}`} />
                      <span>{item.status}</span>
                      <span className="mx-1">•</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-background py-12 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-primary text-xs font-bold">A</div>
              <span className="text-sm text-muted-foreground">© 2025 The Archive Protocol.</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Status</Link>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              ALL SYSTEMS NOMINAL
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
