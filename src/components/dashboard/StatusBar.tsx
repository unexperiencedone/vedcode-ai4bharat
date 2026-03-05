import React from "react";
import { cn } from "@/lib/utils";

export function StatusBar({ projects, stats }: { projects: any[]; stats?: any }) {
  const liveCount = projects.filter((p) => p.status === "LIVE").length;
  const pausedCount = projects.filter((p) => p.status === "PAUSED").length;

  return (
    <footer className="h-7 border-t border-border flex items-center justify-between px-5 bg-card/40 shrink-0">
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground/60">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          {liveCount} live
        </span>
        {pausedCount > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            {pausedCount} paused
          </span>
        )}
      </div>
      <span className="text-[11px] text-muted-foreground/40 font-medium">
        {stats?.version || "v0.1.0"}
      </span>
    </footer>
  );
}
