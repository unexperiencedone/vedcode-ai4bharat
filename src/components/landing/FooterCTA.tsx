"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import Link from "next/link";

export default function FooterCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  // Split Text Animation
  // 0 -> 0.7: Move from sides to center
  // 0.7: Settle
  const leftX = useTransform(scrollYProgress, [0.2, 0.7], [-200, 0]);
  const rightX = useTransform(scrollYProgress, [0.2, 0.7], [200, 0]);

  // Blue Line Animation
  // Fades out and shrinks as we approach 0.7
  const lineOpacity = useTransform(scrollYProgress, [0.6, 0.7], [1, 0]);
  const lineHeight = useTransform(scrollYProgress, [0.2, 0.7], ["100%", "0%"]);

  // Subtext Fade In (After 0.7)
  const textOpacity = useTransform(scrollYProgress, [0.7, 0.8], [0, 1]);

  // CTA Reveal (After 0.8)
  const ctaOpacity = useTransform(scrollYProgress, [0.8, 0.9], [0, 1]);
  const ctaWidth = useTransform(scrollYProgress, [0.85, 1], ["50px", "280px"]); // Moon -> Rect
  const ctaRadius = useTransform(scrollYProgress, [0.85, 1], ["50%", "2px"]); // Circle -> Rect
  const ctaTextOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1]); // Text appears last

  return (
    <section
      ref={containerRef}
      className="py-60 px-6 border-t border-white/5 relative overflow-hidden bg-[#080b14]"
    >
      {/* Blue Dividing Line */}
      <motion.div
        style={{ opacity: lineOpacity, height: lineHeight }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-[#0d46f2]/50 to-transparent"
      />

      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Split Heading */}
        <div className="flex justify-center gap-4 md:gap-8 mb-12 overflow-hidden">
          <motion.h2
            style={{ x: leftX, fontFamily: "'Orbitron', sans-serif" }}
            className="text-5xl md:text-7xl tracking-tight text-white"
          >
            BECOME
          </motion.h2>
          <motion.h2
            style={{ x: rightX, fontFamily: "'Orbitron', sans-serif" }}
            className="text-5xl md:text-7xl tracking-tight text-white"
          >
            ETERNAL.
          </motion.h2>
        </div>

        <motion.p
          style={{ opacity: textOpacity }}
          className="text-xl text-[#94a3b8] mb-16 leading-relaxed font-light"
        >
          Join the ranks of architects who build for the long-term. Your code
          deserves a legacy that transcends the ephemeral.
        </motion.p>

        {/* Morphing CTA */}
        <motion.div
          style={{
            opacity: ctaOpacity,
            width: ctaWidth,
            borderRadius: ctaRadius,
          }}
          className="h-16 bg-[#e2e8f0] overflow-hidden flex items-center justify-center relative hover:bg-[#0d46f2] hover:text-white transition-colors cursor-pointer"
        >
          <Link
            href="/register"
            className="absolute inset-0 flex items-center justify-center w-full h-full"
          >
            <motion.span
              style={{
                opacity: ctaTextOpacity,
                fontFamily: "'Orbitron', sans-serif",
              }}
              className="text-[#080b14] text-xs tracking-[0.5em] uppercase whitespace-nowrap"
            >
              Initialize Connection
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
