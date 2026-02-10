"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import Link from "next/link";

const ingestions = [
  {
    tag: "AI Synthesis",
    name: "Neural Net Core",
    desc: "Optimization algorithms for low-latency inference.",
    hasIcon: false,
    color: "bg-green-500",
  },
  {
    tag: "System Logic",
    name: "Rust-Lattice",
    desc: "Distributed key-value store implementation.",
    icon: "dns",
    hasIcon: true,
    color: "bg-yellow-500",
  },
  {
    tag: "Visual Form",
    name: "Void UI Kit",
    desc: "Brutalist component library for the web.",
    hasIcon: false,
    color: "bg-blue-500",
  },
  {
    tag: "Security",
    name: "Cipher-Stream",
    desc: "End-to-end encrypted stream processing.",
    icon: "lock",
    hasIcon: true,
    color: "bg-purple-500",
  },
];

export default function IngestionsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={containerRef} className="py-40 px-6 bg-[#080b14]">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <span
              className="text-[#0d46f2] text-xs tracking-[0.5em] uppercase mb-4 block"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Registry
            </span>
            <h2
              className="text-5xl tracking-tighter text-white"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              RECENT INGESTIONS
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 1 }} // Fades in AFTER cards
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
            <IngestionCard key={item.name} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function IngestionCard({ item, index }: { item: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }} // Slide in from Left
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.15, // Stagger effect
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
