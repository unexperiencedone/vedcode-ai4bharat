"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Hero text fade out (0-50% scroll)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  
  // Background calming effect (0-50% scroll) - reducing chaos
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // "Descend" text typing effect (starts at 2% scroll)
  // We'll mimic typing by revealing width or using simple opacity/translate for now
  // For a true typing effect based on scroll, we can map string length, but standard reveal is smoother.
  // Let's go with a reveal from bottom + opacity.
  const descendOpacity = useTransform(scrollYProgress, [0.02, 0.1], [0, 1]);
  const descendY = useTransform(scrollYProgress, [0.02, 0.1], [20, 0]);
  // Hide descend text as we scroll further down (40-50%)
  const descendExitOpacity = useTransform(scrollYProgress, [0.4, 0.5], [1, 0]);

  // CTA Fade In (starts at 2% scroll)
  const ctaOpacity = useTransform(scrollYProgress, [0.02, 0.1], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.02, 0.1], [20, 0]);

  return (
    <section ref={ref} className="relative h-[200vh] w-full">
      {/* Sticky Container for Hero Content */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Animated Background - Controlled by scroll */}
        <motion.div 
          style={{ opacity: bgOpacity }}
          className="absolute inset-0 pointer-events-none z-0"
        >
          <div className="absolute top-1/2 left-1/2 w-[200vw] h-[200vw] rounded-full bg-[radial-gradient(circle_at_center,transparent_0%,#080b14_70%),repeating-conic-gradient(from_0deg,#0d46f2_0deg_10deg,transparent_10deg_20deg)] opacity-[0.07] blur-[2px] animate-[vortex-spin_120s_linear_infinite] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#0d46f2]/20 rounded-full animate-[pulse-glow_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#0d46f2]/10 rounded-full animate-[pulse-glow_12s_ease-in-out_infinite_reverse]" />
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 text-center px-6 max-w-6xl mx-auto"
        >
          <p
            className="text-[#0d46f2] tracking-[0.6em] text-sm mb-8 uppercase animate-pulse"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Temporal Node Active
          </p>
          <h1
            className="text-6xl md:text-8xl lg:text-[10rem] font-black leading-none mb-8 tracking-tighter"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              background: "linear-gradient(to bottom, #e2e8f0 30%, #475569 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ECHOES OF LOGIC,
            <br />
            <span
              className="italic"
              style={{
                background: "none",
                WebkitBackgroundClip: "unset",
                WebkitTextFillColor: "#0d46f2",
              }}
            >
              FORGED
            </span>{" "}
            IN TIME.
          </h1>
          <p className="text-xl md:text-2xl text-[#94a3b8] max-w-3xl mx-auto font-light leading-relaxed tracking-wide">
            A cosmic repository for digital architecture. From the first
            line of genesis to the complex lattices of tomorrow.
          </p>

          {/* CTAs - Reveal on scroll */}
          <motion.div 
            style={{ opacity: ctaOpacity, y: ctaY }}
            className="mt-16 flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link
              href="/register"
              className="group relative px-12 py-5 bg-[#0d46f2] text-white text-xs tracking-[0.4em] uppercase overflow-hidden transition-all hover:pr-16"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              <span className="relative z-10">Step Into The Void</span>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all material-symbols-outlined">
                trending_flat
              </span>
            </Link>
            <Link
              href="/changelog"
              className="px-12 py-5 border border-white/20 text-[#94a3b8] text-xs tracking-[0.4em] uppercase hover:border-[#0d46f2] hover:text-white transition-all"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              View Chronology
            </Link>
          </motion.div>
        </motion.div>

        {/* Start Scrolling / Descend Indicator */}
        <motion.div 
          style={{ opacity: descendExitOpacity }} // Fade out as we go deep
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          {/* Default initial state (visible at top) */}
          <motion.div 
             initial={{ opacity: 1 }}
             style={{ opacity: useTransform(scrollYProgress, [0, 0.02], [1, 0]) }}
             className="flex flex-col items-center gap-2 text-[#94a3b8]/40"
          >
             <span className="text-[10px] uppercase tracking-[0.2em] animate-pulse">Initialize Scroll</span>
             <span className="material-symbols-outlined text-sm animate-bounce">arrow_downward</span>
          </motion.div>

          {/* "Descend" Text - Replaces invalid scroll hint */}
          <motion.div 
             style={{ opacity: descendOpacity, y: descendY }}
             className="flex flex-col items-center gap-4"
          >
            <span className="text-[12px] text-[#0d46f2] uppercase tracking-[0.5em] rotate-90 origin-left ml-4 font-bold border-l-2 border-[#0d46f2] pl-3">
              Descend
            </span>
            <div className="w-px h-24 bg-gradient-to-b from-[#0d46f2] to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
