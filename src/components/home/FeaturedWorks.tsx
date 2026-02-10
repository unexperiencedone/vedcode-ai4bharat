"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, Wallet, Share2, Cpu } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "Active" | "Paused" | "Live";
  icon: React.ElementType;
  color: string;
  updated: string;
  contributors: number;
}

const projects: Project[] = [
  {
    id: "joint-ledger",
    title: "Joint Ledger",
    description: "Unified financial tracking system for autonomous nodes within the archive network.",
    status: "Active",
    icon: Wallet,
    color: "text-primary",
    updated: "14m ago",
    contributors: 3,
  },
  {
    id: "nexus-protocol",
    title: "Nexus Protocol",
    description: "Low-latency communication layer between the Vault and the Atelier synthesis engine.",
    status: "Paused",
    icon: Share2,
    color: "text-indigo-400",
    updated: "3h ago",
    contributors: 2,
  },
  {
    id: "alpha-core",
    title: "Alpha Core",
    description: "Sub-atomic processing core for Lab simulations and generative tools.",
    status: "Live",
    icon: Cpu,
    color: "text-emerald-400",
    updated: "2m ago",
    contributors: 4,
  },
];

export function FeaturedWorks() {
  return (
    <div className="flex-[1.5] overflow-y-auto p-8 border-r border-white/10 no-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">Featured Joint Works</h2>
          <p className="text-sm text-muted-foreground mt-1">Recently active collaborative projects across the cluster.</p>
        </div>
        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all text-muted-foreground hover:text-foreground">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/project/${project.id}`}
            className="group border border-white/10 bg-white/[0.02] rounded-xl overflow-hidden hover:border-primary/50 transition-all block"
          >
            <div className={`h-32 relative p-6 bg-gradient-to-br from-${project.color.replace('text-', '')}/20 to-transparent`}>
                {/* Fallback gradient if dynamic class fails */}
                <div className={cn("absolute inset-0 opacity-20 bg-gradient-to-br", 
                    project.status === "Active" && "from-primary",
                    project.status === "Paused" && "from-indigo-500",
                    project.status === "Live" && "from-emerald-500",
                    "to-transparent"
                )} />
                
              <div className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-background/50 backdrop-blur border border-white/10">
                <span className={cn(
                    project.status === "Active" && "text-primary",
                    project.status === "Paused" && "text-muted-foreground",
                    project.status === "Live" && "text-emerald-500"
                )}>{project.status}</span>
              </div>
              <project.icon className={cn("w-10 h-10 opacity-50 relative z-10", project.color)} />
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{project.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{project.description}</p>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {Array.from({ length: project.contributors }).map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border border-background bg-muted flex items-center justify-center text-[8px] text-muted-foreground">
                        <span className="opacity-0">U</span>
                    </div>
                  ))}
                    {/* Placeholder avatars - in real app use Next/Image */}
                </div>
                <span className="text-[10px] text-muted-foreground/50 uppercase font-bold tracking-widest">Update: {project.updated}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
