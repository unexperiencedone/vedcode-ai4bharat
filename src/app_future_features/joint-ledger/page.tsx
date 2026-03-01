"use client";

import Link from "next/link";
import { ChevronRight, Filter, SortAsc, ArrowRight } from "lucide-react";
import {
  ledgerActivity,
  ledgerProjects,
  ledgerStats,
} from "@/lib/data/joint-ledger";
import { cn } from "@/lib/utils";

export default function JointLedgerPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground font-sans">
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-background/50 relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Breadcrumbs & Stats (Tier 3) */}
        <div className="border-b border-white/10 bg-background/40 backdrop-blur-sm z-10">
          <div className="flex flex-col md:flex-row md:items-stretch h-auto md:h-24">
            <div className="flex-1 border-r border-white/10 p-6 flex flex-col justify-center">
              <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <span>Cluster 1</span>
                <ChevronRight className="w-3 h-3" />
                <span>Ledgers</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-foreground">Joint_Ledger_v1</span>
              </nav>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Consolidated Ledger Overview
              </h1>
            </div>

            {/* Stats Overview */}
            <div className="flex shrink-0 overflow-x-auto">
              {ledgerStats.map((stat, i) => (
                <div
                  key={i}
                  className="w-40 p-5 border-r border-white/10 flex flex-col justify-center min-w-[140px]"
                >
                  <span className="text-[10px] uppercase tracking-tighter text-muted-foreground font-semibold mb-1">
                    {stat.label}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-foreground">
                      {stat.value}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stat.unit}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400">
                    {stat.trend}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Gallery Area */}
        <section className="flex-1 overflow-y-auto scroll-smooth z-10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
                  Active Collaborative Strips
                </h2>
                <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] text-primary font-bold">
                  LIVE SYNC
                </span>
              </div>
              <div className="flex gap-2">
                <button className="p-1 border border-white/10 rounded hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-1 border border-white/10 rounded hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
                  <SortAsc className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar snap-x snap-mandatory">
              {ledgerProjects.map((project, i) => (
                <div
                  key={project.id}
                  className="min-w-[340px] border border-white/10 bg-white/[0.02] p-5 rounded-lg hover:bg-white/[0.04] hover:border-white/20 transition-all group snap-start"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground block mb-1">
                        ID: {project.id}
                      </span>
                      <h3 className="text-foreground font-bold text-lg leading-tight">
                        {project.title}
                      </h3>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 border px-2 py-1 rounded-full",
                        project.status === "Live"
                          ? "bg-primary/10 border-primary/40"
                          : "bg-white/5 border-white/10",
                      )}
                    >
                      {project.status === "Live" && (
                        <span className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--primary)]"></span>
                      )}
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase",
                          project.status === "Live"
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      >
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded bg-secondary/50 border border-white/10 text-[10px] font-mono text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <div className="flex -space-x-2">
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full border border-background bg-muted flex items-center justify-center text-[8px] text-muted-foreground"
                        ></div>
                      ))}
                      {project.contributors > 3 && (
                        <div className="w-6 h-6 rounded-full border border-background bg-secondary flex items-center justify-center text-[8px] text-muted-foreground">
                          +{project.contributors - 3}
                        </div>
                      )}
                    </div>
                    <button className="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      {project.status === "Live" ? "Initialize" : "View Logic"}{" "}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Trigger */}
              <div className="min-w-[200px] border border-dashed border-white/10 flex flex-col items-center justify-center rounded-lg hover:bg-white/[0.02] cursor-pointer transition-colors group snap-start">
                <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-2 group-hover:border-primary/50 group-hover:text-primary transition-colors">
                  <span className="text-2xl">+</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground">
                  New Project
                </span>
              </div>
            </div>

            {/* RECENT ACTIVITY LOG (The "Ledger" Table) */}
            <div className="mt-8 pb-12">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
                  Global Sync Log
                </h2>
                <span className="text-xs text-muted-foreground font-mono">
                  v1.0.42_STABLE
                </span>
              </div>
              <div className="border border-white/10 rounded-lg overflow-hidden bg-background/40">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                    <tr>
                      <th className="px-4 py-3 border-b border-white/10">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 border-b border-white/10">
                        Origin
                      </th>
                      <th className="px-4 py-3 border-b border-white/10">
                        Operation
                      </th>
                      <th className="px-4 py-3 border-b border-white/10">
                        Value Shift
                      </th>
                      <th className="px-4 py-3 border-b border-white/10">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-mono text-muted-foreground/80 divide-y divide-white/5">
                    {ledgerActivity.map((log, i) => (
                      <tr
                        key={i}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3 text-muted-foreground/50">
                          {log.timestamp}
                        </td>
                        <td className="px-4 py-3 text-primary">{log.origin}</td>
                        <td className="px-4 py-3">{log.operation}</td>
                        <td
                          className={cn(
                            "px-4 py-3",
                            log.value.startsWith("+")
                              ? "text-emerald-400"
                              : log.value.startsWith("-")
                                ? "text-rose-400"
                                : "text-muted-foreground",
                          )}
                        >
                          {log.value}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px]",
                              log.status === "VERIFIED"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-amber-500/10 text-amber-400",
                            )}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
