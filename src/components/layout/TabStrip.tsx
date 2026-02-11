"use client";

import { useTabs } from "@/components/providers/TabProvider";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function TabStrip() {
  const { tabs, activeTabId, removeTab, setActiveTab } = useTabs();

  return (
    <div className="flex items-center h-10 bg-[#0a0a0c] border-b border-white/5 overflow-x-auto no-scrollbar">
      <div className="flex h-full">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "group flex items-center h-full px-4 gap-3 border-r border-white/5 cursor-pointer min-w-[140px] max-w-[200px] transition-all relative overflow-hidden",
              tab.active 
                ? "bg-background text-foreground" 
                : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-white/[0.02]"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {/* Active Indicator Top */}
            {tab.active && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            )}

            <span className="text-[11px] font-bold tracking-wider truncate uppercase">
              {tab.title}
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTab(tab.id);
              }}
              className={cn(
                "p-0.5 rounded-sm hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100",
                tab.active && "opacity-100"
              )}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      
      <button className="px-4 h-full flex items-center border-r border-white/5 text-muted-foreground/20 hover:text-primary transition-colors hover:bg-white/[0.02]">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
