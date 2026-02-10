"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CommandHeader } from "@/components/layout/CommandHeader";
import { ClusterRail } from "@/components/layout/ClusterRail";
import { SystemFooter } from "@/components/layout/SystemFooter";
import { FeaturedWorks } from "@/components/home/FeaturedWorks";
import { LiveFeed } from "@/components/home/LiveFeed";

export default function Dashboard() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground font-sans">
      <CommandHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <ClusterRail />
        
        <main className="flex-1 flex flex-col overflow-hidden relative">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#3c83f6_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />

          {/* Breadcrumb */}
          <div className="px-8 py-3 flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase text-muted-foreground/40 border-b border-white/10 z-10 bg-background/50 backdrop-blur-sm">
            <Link href="#" className="hover:text-foreground transition-colors">Terminal</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">Home</span>
          </div>

          {/* Content Grid */}
          <div className="flex-1 flex overflow-hidden z-10">
            <FeaturedWorks />
            <LiveFeed />
          </div>
        </main>
      </div>

      <SystemFooter />
    </div>
  );
}
