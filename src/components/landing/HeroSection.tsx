"use client";

import { useRef, useState } from "react";
import {
  useScroll,
  useTransform,
  motion,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const [showCTA, setShowCTA] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.008 && !showCTA) {
      setShowCTA(true);
    } else if (latest <= 0.008 && showCTA) {
      setShowCTA(false);
    }
  });

  // Hero text exit animation (Sync with Strata @ 30% viewport)
  // Instead of just fading, it shrinks and scrolls up
  const heroOpacity = useTransform(scrollYProgress, [0.8, 0.9], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0.8, 0.9], [1, 0.5]); // Shrink
  const heroY = useTransform(scrollYProgress, [0.8, 0.9], [0, -800]);    // Scroll UP
  
  // Background calming effect - stays visible longer now
  const bgOpacity = useTransform(scrollYProgress, [0.5, 0.9], [1, 0]);

  // "Descend" text/indicator
  // Visible immediately to guide user
  const descendOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]); // Fades out as you scroll
  const descendY = useTransform(scrollYProgress, [0, 0.1], [0, 20]); // Moves down slightly
  // We don't need descendExitOpacity separate logic if we just fade it out early


  // Debug log to ensure HMR is working
  console.log("HeroSection rendered with CTA state:", showCTA);

  return (
    <div ref={ref} className="relative h-[200vh] w-full"> {/* Spacer Div */}
      {/* Fixed Container for Hero Content - Stays put! */}
      <div className="fixed top-0 left-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden z-0">
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
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 text-center px-6 max-w-6xl mx-auto flex flex-col items-center justify-center h-full"
        >
          <div className="mb-20">
            {" "}
            {/* Wrapper to lift text up slightly */}
            <p
              className="text-[#0d46f2] tracking-[0.3em] text-xs mb-6 uppercase animate-pulse font-semibold"
            >
              Now Available in Early Access
            </p>
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 tracking-tight"
            >
              <span className="text-white">Understand code.</span>
              <br />
              <span
                className="italic text-[#0d46f2]"
              >
                Build faster.
              </span>
            </h1>
            <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
              A cosmic repository for digital architecture. From the first line
              of genesis to the complex lattices of tomorrow.
            </p>
          </div>

          {/* CTAs - Absolute Position at bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showCTA ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute bottom-[15%] left-1/2 -translate-x-1/2 flex flex-col sm:flex-row gap-6 justify-center items-center w-full z-20"
          >
            <Link
              href="/register"
              className="group relative px-10 py-4 bg-[#0d46f2] text-white text-sm font-bold tracking-widest uppercase overflow-hidden transition-all hover:pr-14 shadow-[0_0_20px_rgba(13,70,242,0.3)] hover:shadow-[0_0_30px_rgba(13,70,242,0.5)] rounded-lg"
            >
              <span className="relative z-10">Start learning free</span>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all material-symbols-outlined">
                arrow_forward
              </span>
            </Link>
            <Link
              href="/docs"
              className="px-10 py-4 border border-white/20 text-[#94a3b8] text-sm font-bold tracking-widest uppercase hover:border-[#0d46f2] hover:text-white transition-all backdrop-blur-sm rounded-lg"
            >
              View Documentation
            </Link>
          </motion.div>
        </motion.div>

        {/* Start Scrolling / Descend Indicator */}
        <motion.div
          style={{ opacity: descendOpacity }} // Fade out using the main opacity var
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-0"
        >
          <motion.div
            style={{ opacity: descendOpacity, y: descendY }}
            className="flex flex-col items-center gap-4"
          >
            <span className="text-[10px] uppercase tracking-widest font-semibold animate-pulse text-[#94a3b8]/60">
              Scroll down
            </span>
            <span className="material-symbols-outlined text-sm animate-bounce text-[#94a3b8]/60">
              arrow_downward
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
