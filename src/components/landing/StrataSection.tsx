"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

const strataCards = [
  {
    id: "01",
    icon: "history_edu",
    title: "Perpetual Archeology",
    desc: "Code is not just data; it is history. Our strata storage ensures that every iteration is preserved in a decentralized lattice, protecting logic from the erosion of time.",
    align: "left",
  },
  {
    id: "02",
    icon: "hub",
    title: "Collective Consciousness",
    desc: "Collaborate across dimensions. Annotation systems allow developers to leave cognitive imprints on their work, explaining the 'why' behind the 'how' for future civilizations.",
    align: "right",
  },
  {
    id: "03",
    icon: "architecture",
    title: "The Technical Atelier",
    desc: "A high-end sanctuary for the digital artisan. Minimalist, distraction-free, and optimized for deep work. This is where the future of logic is meticulously forged.",
    align: "center",
  },
];

export default function StrataSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Heading Fade Out (at the end, approx 90-100% scroll)
  const headingOpacity = useTransform(scrollYProgress, [0.9, 1], [1, 0]);

  return (
    <section ref={containerRef} className="relative bg-[#080b14]">
      {/* Sticky Header Container */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-start py-20 pointer-events-none z-10">
        <motion.div style={{ opacity: headingOpacity }}>
          <TypingHeading text="STRUCTURAL STRATA" />
        </motion.div>
      </div>

      {/* Cards Container - Very tall to allow scrolling */}
      <div className="relative -mt-[80vh] pb-40">
        {strataCards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            index={index}
            total={strataCards.length}
          />
        ))}
      </div>
    </section>
  );
}

function TypingHeading({ text }: { text: string }) {
  // This component will use whileInView to trigger a stagger animation
  // It's cleaner than binding exact scroll % to every letter
  const letters = text.split("");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    hidden: {
      opacity: 0,
      x: 20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.h2
      className="text-3xl md:text-4xl text-center tracking-[0.5em] text-[#94a3b8] uppercase font-bold overflow-hidden flex"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.h2>
  );
}

function Card({
  card,
  index,
  total,
}: {
  card: any;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Reveal when 40% into view (0.4)
  // Fade out when next card is arriving or we're leaving
  const opacity = useTransform(
    scrollYProgress,
    [0.1, 0.4, 0.6, 0.9],
    [0, 1, 1, 0], // Fade in, stay, then fade out
  );

  const y = useTransform(
    scrollYProgress,
    [0.1, 0.4, 0.6, 0.9],
    [100, 0, 0, -100], // Slide up, settle, then slide up and out
  );

  const scale = useTransform(scrollYProgress, [0.1, 0.4], [0.8, 1]);

  const isLeft = card.align === "left";
  const isRight = card.align === "right";

  return (
    <div
      ref={ref}
      className="min-h-screen flex items-center justify-center sticky top-0"
    >
      <motion.div
        style={{ opacity, y, scale }}
        className={`
          relative z-10 glass-bg border border-white/5 p-12 md:p-20 backdrop-blur-xl max-w-5xl shadow-2xl mx-6
          ${isLeft ? "mr-auto" : ""}
          ${isRight ? "ml-auto" : ""}
          ${card.align === "center" ? "mx-auto" : ""}
        `}
      >
        <div
          className={`flex flex-col ${isRight ? "md:flex-row-reverse text-right" : "md:flex-row"} gap-12 items-center`}
        >
          <div className="relative">
            <div className="absolute -inset-5 rounded-full blur-[15px] -z-10 bg-[#0d46f2]/20" />
            <span className="material-symbols-outlined text-6xl text-[#0d46f2] drop-shadow-[0_0_15px_rgba(13,70,242,0.8)]">
              {card.icon}
            </span>
          </div>
          <div className="flex-1">
            <span className="text-[#0d46f2] text-xs tracking-[0.5em] uppercase mb-4 block font-display">
              Eon {card.id}
            </span>
            <h3 className="text-4xl mb-6 tracking-tight font-display text-white">
              {card.title}
            </h3>
            <p className="text-lg text-[#94a3b8] leading-relaxed font-light">
              {card.desc}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
