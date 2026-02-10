"use client";

import { useRouter } from "next/navigation";
import { type SkillStat } from "@/lib/mastery";
import { cn } from "@/lib/utils";

interface SkillTreeProps {
  stats: SkillStat[];
  groupIQ: number;
}

export default function SkillTree({ stats, groupIQ }: SkillTreeProps) {
  const router = useRouter();

  // Simple layout logic for demo: arrange in a circle or spiral
  const baseRadius = 150;
  const centerX = 300;
  const centerY = 300;

  return (
    <div className="relative w-full h-[600px] bg-background-dark/50 grid-bg overflow-hidden rounded-xl border border-white/10 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 600">
        <defs>
          <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style={{ stopColor: "rgba(59, 130, 246, 0.4)", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "rgba(59, 130, 246, 0.1)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/* Central Hub Connection Lines */}
        {stats.map((skill, i) => {
          const angle = (i / stats.length) * 2 * Math.PI;
          const x = centerX + Math.cos(angle) * baseRadius;
          const y = centerY + Math.sin(angle) * baseRadius;
          
          return (
            <line 
                key={`conn-${skill.language}`}
                x1={centerX} y1={centerY} 
                x2={x} y2={y} 
                stroke="rgba(255, 255, 255, 0.1)" 
                strokeWidth="1" 
                strokeDasharray="4 4"
            />
          );
        })}
        
        <circle cx={centerX} cy={centerY} r="10" fill="rgba(255,255,255,0.1)" />
      </svg>
      
      {/* Interactive Nodes Layer (HTML for better tooltips/interactions) */}
      <div className="absolute inset-0 pointer-events-auto">
        {stats.map((skill, i) => {
          const angle = (i / stats.length) * 2 * Math.PI;
          // Map coordinates to percentage for responsive positioning relative to container (assuming square aspect ratio in parent or fixed size)
          // Simplified: using absolute px for the demo viewBox
          const x = centerX + Math.cos(angle) * baseRadius;
          const y = centerY + Math.sin(angle) * baseRadius;
          
          // Size based on mastery score
          const nodeSize = 40 + (skill.masteryScore * 5); 

          return (
            <div 
                key={skill.language}
                className="absolute group cursor-pointer transition-transform hover:scale-110"
                style={{ 
                    left: x, 
                    top: y, 
                    width: nodeSize, 
                    height: nodeSize,
                    transform: 'translate(-50%, -50%)' 
                }}
                onClick={() => router.push(`/vault?q=${skill.language.toLowerCase()}`)}
            >
                <div className={cn(
                    "w-full h-full rounded-full border-2 flex items-center justify-center backdrop-blur-sm transition-all duration-500",
                    skill.masteryScore > 5 ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(59,130,246,0.4)]" : "bg-white/5 border-white/10 group-hover:border-primary/50"
                )}>
                    <div className="text-[10px] font-bold font-mono text-center leading-none">
                        <div className="text-foreground group-hover:text-primary transition-colors">{skill.language.slice(0, 3).toUpperCase()}</div>
                    </div>
                </div>
                
                {/* Score Badge */}
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-background border border-white/20 flex items-center justify-center text-[9px] font-bold font-mono text-muted-foreground">
                    {skill.masteryScore}
                </div>

                {/* Tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded text-xs whitespace-nowrap z-20">
                    <span className="font-bold text-primary">{skill.language}</span>
                    <span className="text-muted-foreground ml-2">{skill.count} Snippets</span>
                </div>
            </div>
          );
        })}
        
        {/* Center Label */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold mb-1">Nexus</div>
            <div className="w-2 h-2 bg-primary rounded-full mx-auto" />
        </div>
      </div>

      {/* Floating Group IQ Badge */}
      <div className="absolute top-6 right-6 p-4 bg-background/40 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl">
        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            CumulativeIQ
        </p>
        <p className="text-4xl font-black text-foreground tabular-nums tracking-tighter">
            {groupIQ.toString().padStart(3, '0')}
        </p>
      </div>
    </div>
  );
}
