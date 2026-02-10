import HeroSection from "@/components/landing/HeroSection";
import StrataSection from "@/components/landing/StrataSection";
import IngestionsSection from "@/components/landing/IngestionsSection";
import FooterCTA from "@/components/landing/FooterCTA";

export default function LandingPage() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Roboto+Flex:opsz,wght@8..144,300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen text-[#e2e8f0] selection:bg-[#0d46f2] selection:text-white overflow-x-hidden"
        style={{ fontFamily: "'Roboto Flex', sans-serif", background: "#080b14" }}
      >
        {/* Header - Custom for Landing Page */}
        <header className="fixed top-0 w-full z-[100] border-b border-white/5 backdrop-blur-md">
          <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 border border-[#0d46f2]/50 flex items-center justify-center rotate-45 group-hover:rotate-180 transition-transform duration-700">
                <span className="material-symbols-outlined -rotate-45 text-[#0d46f2] text-2xl">
                  all_inclusive
                </span>
              </div>
              <span
                className="text-xl tracking-[0.3em] font-bold uppercase"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Archive
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-12">
              <a
                href="/manifesto"
                className="text-[10px] uppercase tracking-[0.4em] font-medium text-[#94a3b8] hover:text-[#0d46f2] transition-all"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Manifesto
              </a>
              <a
                href="/changelog"
                className="text-[10px] uppercase tracking-[0.4em] font-medium text-[#94a3b8] hover:text-[#0d46f2] transition-all"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Changelog
              </a>
              <a
                href="/login"
                className="px-6 py-2 border border-[#0d46f2]/30 text-[10px] uppercase tracking-[0.4em] hover:bg-[#0d46f2]/10 transition-all"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Initiate Terminal
              </a>
            </nav>
          </div>
        </header>

        {/* Main Sections */}
        <main className="relative z-10 w-full">
            <HeroSection />
            <StrataSection />
            <IngestionsSection />
            <FooterCTA />
        </main>

        {/* Footer - Custom for Landing Page */}
        <footer className="border-t border-white/5 py-20 px-8 relative z-10 bg-[#080b14]">
          <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-6">
              <span
                className="text-[10px] tracking-[0.5em] uppercase text-[#94a3b8]"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                © 2025 Archive Protocol
              </span>
              <div className="w-2 h-2 rounded-full bg-[#0d46f2] animate-pulse" />
              <span
                className="text-[10px] tracking-[0.5em] uppercase text-[#0d46f2]"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                All Systems Nominal
              </span>
            </div>
            <div className="flex gap-12">
              <a
                href="#"
                className="text-[10px] tracking-[0.5em] uppercase text-[#94a3b8] hover:text-white transition-colors"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Discord
              </a>
              <a
                href="#"
                className="text-[10px] tracking-[0.5em] uppercase text-[#94a3b8] hover:text-white transition-colors"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Git
              </a>
              <a
                href="/manifesto"
                className="text-[10px] tracking-[0.5em] uppercase text-[#94a3b8] hover:text-white transition-colors"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Manifesto
              </a>
            </div>
            <div
              className="text-[10px] text-[#94a3b8]/40 uppercase tracking-[0.2em]"
              style={{ fontFamily: "monospace" }}
            >
              lat: 37.7749 • lon: -122.4194 • temporal_offset: 0ms
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
