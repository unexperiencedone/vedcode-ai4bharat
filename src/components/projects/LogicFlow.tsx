"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight, Database, Server, Smartphone, ExternalLink, Code2, Cpu, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export interface Module {
  id: string;
  label: string;
  type: "database" | "server" | "client" | "service";
  description: string;
  technologies: string[];
}

export interface Relationship {
  from: string;
  to: string;
  label: string;
}

export interface Narrative {
  architecture: string;
  human: string;
  proof: {
    label: string;
    url: string;
  }[];
}

interface LogicFlowProps {
  modules: Module[];
  relationships: Relationship[];
  narrative: Narrative;
}

const icons = {
  database: Database,
  server: Server,
  client: Smartphone,
  service: Code2,
};

export function LogicFlow({ modules, relationships, narrative }: LogicFlowProps) {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* Visualizer Area (SVG + DOM Overlay) */}
        <div className="lg:col-span-8 relative bg-white/[0.02] border-r border-white/10 p-8 flex items-center justify-center">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                    <marker
                    id="arrowhead-blue"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                    >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" opacity="0.8" />
                    </marker>
                </defs>
                
                {relationships.map((rel, i) => {
                    // Simple distinct positions for demo purposes
                    // In a real generic graph, use flex layout or d3-force
                    const getPos = (id: string) => {
                        if (id === "client") return { x: "20%", y: "50%" };
                        if (id === "events") return { x: "50%", y: "50%" };
                        if (id === "core") return { x: "80%", y: "50%" };
                        return { x: "50%", y: "50%" };
                    };
                    const start = getPos(rel.from);
                    const end = getPos(rel.to);

                    return (
                    <g key={i}>
                        <motion.line
                            x1={start.x} y1={start.y}
                            x2={end.x} y2={end.y}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeOpacity="0.3"
                            markerEnd="url(#arrowhead-blue)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 + (i * 0.3) }}
                        />
                        {/* Pulse Effect on Line */}
                         <motion.circle 
                            r="3" 
                            fill="#3b82f6"
                            initial={{ offsetDistance: "0%" }}
                            animate={{ 
                                cx: [start.x, end.x], // Simple linear interp for now as explicit coords
                                cy: [start.y, end.y]
                            }}
                            // Note: real path following requires <mpath> or complex interpolation, simplified for React DOM/SVG mix
                            // Using simple CSS keyframes or just static pulse for MVP stability
                         >
                         </motion.circle>
                         <text 
                            x="50%" 
                            y="45%" 
                            className="text-[10px] fill-muted-foreground uppercase tracking-widest text-center"
                            textAnchor="middle"
                         >
                            {rel.label}
                         </text>
                    </g>
                    );
                })}
            </svg>

            {/* Nodes Container */}
            <div className="relative z-10 w-full h-full flex justify-between items-center max-w-3xl px-12">
                 {/* Manually mapped for the specific 3-node layout as per requirement */}
                 {modules.map((mod, i) => {
                     const Icon = icons[mod.type] || Code2;
                     const isActive = activeNode === mod.id;
                     
                     return (
                        <motion.div
                            key={mod.id}
                            className={cn(
                                "relative w-32 h-32 flex flex-col items-center justify-center gap-3 rounded-2xl border bg-black/50 backdrop-blur-xl transition-all duration-500 cursor-pointer group",
                                isActive ? "border-primary shadow-[0_0_40px_-10px_var(--primary)] scale-110 z-20" : "border-white/10 hover:border-white/30 hover:bg-white/5"
                            )}
                            onMouseEnter={() => setActiveNode(mod.id)}
                            onMouseLeave={() => setActiveNode(null)}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.2 }}
                        >
                            <div className={cn(
                                "p-3 rounded-xl bg-white/5 text-muted-foreground transition-colors duration-300",
                                isActive && "bg-primary text-primary-foreground"
                            )}>
                                <Icon className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <h4 className={cn("font-bold text-sm", isActive ? "text-primary" : "text-foreground")}>{mod.label}</h4>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{mod.type}</span>
                            </div>

                             {/* Floating Details Card */}
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute top-full mt-4 w-64 bg-zinc-900/90 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-md z-30"
                                >
                                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                        {mod.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {mod.technologies.map(tech => (
                                            <span key={tech} className="text-[9px] px-2 py-1 rounded-md bg-white/10 text-zinc-300 border border-white/5">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900 border-t border-l border-white/10 rotate-45" />
                                </motion.div>
                            )}
                        </motion.div>
                     );
                 })}
            </div>
        </div>

        {/* Narrative Panel (Right Side) */}
        <div className="lg:col-span-4 p-8 flex flex-col bg-zinc-950/50">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-500">Logic Flow</h3>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-4">Architecture Narrative</h2>
                <div className="prose prose-invert prose-sm text-muted-foreground">
                    <p>{narrative.architecture}</p>
                </div>
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-white/10 mb-8">
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                    <Globe className="w-3 h-3" /> The Human Element
                </h4>
                <p className="text-sm text-zinc-300 italic">
                    "{narrative.human}"
                </p>
            </div>

            <div className="mt-auto">
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-4 flex items-center gap-2">
                    <Code2 className="w-3 h-3" /> The Proof (Vault)
                </h4>
                <div className="space-y-2">
                    {narrative.proof.map((item, i) => (
                        <Link 
                            key={i}
                            href={item.url}
                            className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/30 transition-all group"
                        >
                            <span className="text-sm font-medium text-zinc-400 group-hover:text-foreground">{item.label}</span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
