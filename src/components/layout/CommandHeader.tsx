"use client";

import { Search, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function CommandHeader() {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            <FolderOpen className="text-white w-[14px] h-[14px]" />
          </div>
          <h1 className="font-bold text-sm tracking-tight text-foreground uppercase">The Archive</h1>
        </div>
        
        <div className="relative group hidden md:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-muted-foreground/40" />
          </div>
          <input 
            type="text" 
            className="bg-white/5 border border-white/10 rounded-lg py-1.5 pl-10 pr-12 text-sm w-72 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground/30 text-foreground"
            placeholder="Search components..."
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-muted-foreground/50 border border-white/10">⌘K</kbd>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </div>
          <span className="text-[10px] font-bold tracking-[0.1em] text-primary uppercase">System Operational</span>
        </div>
        
        <div className="h-4 w-px bg-white/10"></div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground/60 font-medium hidden sm:inline-block">Core v4.0.2</span>
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 overflow-hidden">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0qqxeH933BYEdAegQ8nX8NvPQGneM8M8ejreOLVt_6RSnGqFNx2V7xwkpIqKsRBO1tEguTpZATDlFCfx_PfjV16aHrVy6O9YOfV27qdgY3R8FXij4-sw90Q04Px_gVL4546KUCEKRhE79G6PcaiPrnz93fkzNfyMnyMFGBMrmGQjo-UnUKpiQU8u5Bf24GfHXxeI6aNBekwn6XpFiLjcin65sQyvsup11dgj2HMPzgl41o6n99CjlTwdd8g7xj58JExget2EkuDVC" 
              alt="User Profile" 
              className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
