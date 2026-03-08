"use client";

import { ChevronRight, GitCommit } from "lucide-react";

export default function ChangelogPage() {
  const changes = [
    {
      version: "v4.0.2",
      date: "2026-02-10",
      title: "Phase 2 Expansion",
      desc: "Implemented comprehensive 12-index cluster system. Added Joint Ledger, Vault Index, Guild Hall, and Skill Tree.",
      type: "Major",
    },
    {
      version: "v4.0.1",
      date: "2026-02-09",
      title: "Core Stability",
      desc: "Refactored initial Vault layout and fixed linting errors. Established global theme tokens.",
      type: "Patch",
    },
    {
      version: "v4.0.0",
      date: "2026-02-01",
      title: "Genesis",
      desc: "Initial commit. Setup Next.js 15, Tailwind v4, and Shadcn UI. Basic routing structure.",
      type: "Major",
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground font-sans">
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="px-8 py-4 flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase text-muted-foreground/40 border-b border-white/10 z-10 bg-background/50 backdrop-blur-sm">
          <span>Cluster 5</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Infrastructure</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">Changelog</span>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-12 z-10 max-w-3xl">
          <h1 className="text-3xl font-bold mb-8 tracking-tight">
            System Changelog
          </h1>

          <div className="relative border-l border-white/10 ml-3 space-y-12">
            {changes.map((change, i) => (
              <div key={i} className="relative pl-8">
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-background border border-primary/50"></div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {change.version}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {change.date}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/50 border border-white/10 px-1.5 rounded">
                    {change.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {change.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {change.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
