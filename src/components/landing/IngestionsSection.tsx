"use client";

import { useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import Link from "next/link";

const ingestions = [
  {
    tag: "Universal Scraper",
    name: "Doc Ingestor",
    desc: "Automated extraction of prerequisites and mental models from any documentation.",
    hasIcon: false,
    color: "bg-green-500",
  },
  {
    tag: "Active Recall",
    name: "Mastery Engine",
    desc: "Spaced repetition using Ebbinghaus decay formulas to solidify your understanding.",
    icon: "model_training",
    hasIcon: true,
    color: "bg-yellow-500",
  },
  {
    tag: "Guided Path",
    name: "Roadmap Player",
    desc: "Dynamically generated step-by-step curricula tailored to your project needs.",
    hasIcon: false,
    color: "bg-blue-500",
  },
  {
    tag: "Skill Tree",
    name: "Knowledge Map",
    desc: "A React Flow interactive graph charting the relationships between all concepts.",
    icon: "hub",
    hasIcon: true,
    color: "bg-purple-500",
  },
];

export default function IngestionsSection({
  onHandover,
}: {
  onHandover?: (handedOver: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [headingArrived, setHeadingArrived] = useState(false);

  return (
    <section ref={containerRef} className="py-40 px-6 bg-[#080b14] relative">
      {/* Handover Marker - Triggers at 30.1% viewport height */}
      <motion.div
        className="absolute top-40 w-full h-[1px] pointer-events-none"
        onViewportEnter={() => onHandover?.(true)}
        onViewportLeave={(entry) => {
          // If we scroll back up past the 30.1% mark
          if (entry && entry.boundingClientRect.top > 0) {
            onHandover?.(false);
          }
        }}
        viewport={{ margin: "0px 0px -69.9% 0px" }} // 30.1% from top
      />

      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            viewport={{ once: false, margin: "0px 0px -70% 0px" }} // Exactly 30%
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={(definition) => {
              // Using named variants prevents ambiguity with initial/animate states
              if (definition === "visible") {
                setHeadingArrived(true);
              }
            }}
            onViewportLeave={() => setHeadingArrived(false)}
          >
            <span
              className="text-[#0d46f2] text-xs tracking-[0.5em] uppercase mb-4 block"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Intelligence
            </span>
            <h2
              className="text-5xl tracking-tighter text-white"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              KNOWLEDGE STUDIO
            </h2>
          </motion.div>
          <motion.div
            initial="hidden"
            animate={headingArrived ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            transition={{ duration: 0.8, delay: 0.4 }} // Delayed after cards start
          >
            <Link
              href="/login"
              className="text-[10px] tracking-[0.5em] text-[#94a3b8] hover:text-[#0d46f2] flex items-center gap-4 transition-all uppercase pb-2 border-b border-white/10"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Access Global Feed{" "}
              <span className="material-symbols-outlined text-sm">
                north_east
              </span>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ingestions.map((item, i) => (
            <IngestionCard
              key={item.name}
              item={item}
              index={i}
              startAnimation={headingArrived}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function IngestionCard({
  item,
  index,
  startAnimation,
}: {
  item: any;
  index: number;
  startAnimation: boolean;
}) {
  return (
    <motion.div
      initial="hidden"
      animate={startAnimation ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 }
      }}
      transition={{
        duration: 0.6,
        delay: index * 0.15, // Stagger effect after heading
        ease: "easeOut",
      }}
      className="group relative aspect-[4/5] overflow-hidden border border-white/5 bg-white/5"
    >
      {item.hasIcon ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-8xl text-white/5 group-hover:text-[#0d46f2]/20 transition-colors">
              {item.icon}
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-[#080b14] via-transparent to-transparent" />
        </>
      )}

      {/* Hover Reveal Content */}
      <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform">
        <span
          className="text-[10px] text-[#0d46f2] tracking-[0.3em] uppercase mb-2 block"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          {item.tag}
        </span>
        <h4
          className="text-xl mb-4 text-white"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          {item.name}
        </h4>
        <p className="text-sm text-[#94a3b8] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {item.desc}
        </p>
      </div>
    </motion.div>
  );
}
