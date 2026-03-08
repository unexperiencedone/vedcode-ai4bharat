"use client";

import { useRef, useState } from "react";
import { useScroll, useTransform, motion, useMotionValueEvent } from "framer-motion";

const strataCards = [
  {
    id: "01",
    icon: "bubble_chart",
    title: "Project Constellation",
    desc: "Visualize your entire repository as an interactive galaxy. Analyze AST dependencies, identify stressful coupling, and map out the true architecture of your codebase.",
    align: "left",
  },
  {
    id: "02",
    icon: "security",
    title: "Context Guard",
    desc: "Never break the build again. Simulates your exact code diffs and traces the ripple effect across the entire system using our intelligent impact analysis.",
    align: "right",
  },
  {
    id: "03",
    icon: "psychology",
    title: "JIT Learning & Mentor",
    desc: "Stuck on a concept? Our Mentor Engine detects your learning gaps and delivers Just-In-Time explanations, active recall challenges, and personalized roadmaps.",
    align: "center",
  },
];

export default function StrataSection({ handedOver = false }: { handedOver?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showHeading, setShowHeading] = useState(false);

  // Determinisitc scroll mapping for h-[500vh] section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Total Height = 500vh
    // Card 0 marker @ 100vh relative. Hits 80% height when scroll = 20vh. Progress = 20/500 = 0.04
    // Card 1 marker @ 200vh relative. Hits 80% height when scroll = 120vh. Progress = 120/500 = 0.24
    // Card 2 marker @ 300vh relative. Hits 80% height when scroll = 220vh. Progress = 220/500 = 0.44
    
    // Heading Entry @ 25% screen height. 
    // Section starts @ 0 progress. Heading hits 25% height immediately? 
    // No, section start is when section top hits viewport top. 
    // So heading is already at 25% relative to section top at start?
    // Actually the sticky/fixed layer is always at 25%.
    // We want it to "arrive" as we enter the section.
    
    if (latest > 0.001) {
      setShowHeading(true);
    } else {
      setShowHeading(false);
    }

    if (latest < 0.04) {
      setActiveIndex(-1);
    } else if (latest < 0.24) {
      setActiveIndex(0);
    } else if (latest < 0.44) {
      setActiveIndex(1);
    } else {
      setActiveIndex(2);
    }
  });

  return (
    <section ref={containerRef} className="relative bg-[#080b14] z-10">
      {/* Spacer for scroll length */}
      <div className="h-[500vh] pointer-events-none" />

      {/* Sticky Display Layer */}
      <div className="fixed top-0 left-0 h-screen w-full flex flex-col items-center justify-start pointer-events-none overflow-hidden pb-20 z-10">
        
        {/* Heading remains at 25% screen height */}
        <div className="mt-[25vh] z-20">
          <TypingHeading 
            text="CORE PLATFORM" 
            isExiting={handedOver} 
            isVisible={showHeading}
          />
        </div>

        {/* Cards settle in center */}
        <div className="flex-1 w-full relative flex items-center justify-center">
          <div className="relative w-full max-w-6xl mx-auto px-6 h-full flex items-center justify-center">
            {strataCards.map((card, i) => (
              <Card 
                key={card.id} 
                card={card} 
                isActive={activeIndex === i && !handedOver && showHeading} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TypingHeading({ text, isExiting, isVisible }: { text: string; isExiting: boolean; isVisible: boolean }) {
  const letters = text.split("");
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.04 * i },
    }),
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.03, staggerDirection: 1, when: "afterChildren" }
    }
  };

  const child = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring" as const, damping: 12, stiffness: 100 },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.h2
      className="text-3xl md:text-4xl text-center tracking-[0.5em] text-[#94a3b8] uppercase font-bold overflow-hidden flex"
      variants={container}
      initial="hidden"
      animate={isExiting ? "exit" : isVisible ? "visible" : "hidden"}
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.h2>
  );
}

function Card({ card, isActive }: { card: any; isActive: boolean }) {
  const isRight = card.align === "right";

  return (
    <motion.div
      initial={{ opacity: 0, x: -200 }}
      animate={isActive 
        ? { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } } 
        : { opacity: 0, x: -200, transition: { duration: 0 } } // Instant reset
      }
      className={`
        absolute w-full z-10 glass-bg border border-white/5 p-12 md:p-20 backdrop-blur-xl max-w-5xl shadow-2xl left-1/2 -translate-x-1/2
      `}
    >
      <div className={`flex flex-col ${isRight ? "md:flex-row-reverse text-right" : "md:flex-row"} gap-12 items-center`}>
        <div className="relative">
          <div className="absolute -inset-5 rounded-full blur-[15px] -z-10 bg-[#0d46f2]/20" />
          <span className="material-symbols-outlined text-6xl text-[#0d46f2] drop-shadow-[0_0_15px_rgba(13,70,242,0.8)]">
            {card.icon}
          </span>
        </div>
        <div className="flex-1">
          <span className="text-[#0d46f2] text-xs tracking-[0.5em] uppercase mb-4 block font-display font-semibold">
            Feature {card.id}
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
  );
}
