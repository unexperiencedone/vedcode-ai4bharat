"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function FooterCTA() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parent container for stagger sequence
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.1,
      },
    },
  };

  // Split Heading Variants
  const leftHeadingVariants = {
    hidden: { opacity: 0, x: -200 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const rightHeadingVariants = {
    hidden: { opacity: 0, x: 200 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  // Blue Line Variants
  const lineVariants = {
    hidden: { opacity: 1, height: "100%" },
    visible: {
      opacity: 0,
      height: "0%",
      transition: { duration: 1, ease: "easeInOut" as const, delay: 0.2 },
    },
  };

  // Subtext Fade Variants
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const },
    },
  };

  // CTA Morph Variants
  const ctaContainerVariants = {
    hidden: { opacity: 0, width: "50px", borderRadius: "50%" },
    visible: {
      opacity: 1,
      width: "280px",
      borderRadius: "2px",
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const ctaTextVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: 0.4, duration: 0.4 },
    },
  };

  return (
    <section
      ref={containerRef}
      className="py-60 px-6 border-t border-white/5 relative overflow-hidden bg-[#080b14]"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -20% 0px" }} // Triggers at 80% from top (lots of time to settle by 30%)
        variants={containerVariants}
        className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center"
      >
        {/* Blue Dividing Line */}
        <motion.div
          variants={lineVariants}
          className="absolute -top-60 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-[#0d46f2]/50 to-transparent z-0"
        />

        {/* Split Heading */}
        <div className="flex justify-center gap-4 md:gap-8 mb-12 overflow-hidden relative z-10">
          <motion.h2
            variants={leftHeadingVariants}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            className="text-5xl md:text-7xl tracking-tight text-white"
          >
            BECOME
          </motion.h2>
          <motion.h2
            variants={rightHeadingVariants}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            className="text-5xl md:text-7xl tracking-tight text-white"
          >
            ETERNAL.
          </motion.h2>
        </div>

        <motion.p
          variants={textVariants}
          className="text-xl text-[#94a3b8] mb-16 leading-relaxed font-light"
        >
          Join the ranks of architects who build for the long-term. Your code
          deserves a legacy that transcends the ephemeral.
        </motion.p>

        {/* Morphing CTA */}
        <motion.div
          variants={ctaContainerVariants}
          className="h-16 bg-[#e2e8f0] overflow-hidden flex items-center justify-center relative hover:bg-[#0d46f2] hover:text-white transition-colors cursor-pointer"
        >
          <Link
            href="/register"
            className="absolute inset-0 flex items-center justify-center w-full h-full"
          >
            <motion.span
              variants={ctaTextVariants}
              style={{
                fontFamily: "'Orbitron', sans-serif",
              }}
              className="text-[#080b14] text-[10px] md:text-xs tracking-[0.5em] uppercase whitespace-nowrap"
            >
              Initialize Connection
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
