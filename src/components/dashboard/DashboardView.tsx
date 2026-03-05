"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, Grid, List, Plus, Bell } from "lucide-react";
import { QuickMetrics } from "./QuickMetrics";
import { ProjectCard } from "./ProjectCard";
import { cn } from "@/lib/utils";

export interface DashboardViewProps {
  data: any;
  handle: string;
}

export function DashboardView({ data, handle }: DashboardViewProps) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const projects = data?.projects || [];
  const stats = data?.stats || {};

  const filteredProjects = projects.filter((p: any) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || p.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ["All", "AI & ML", "Infrastructure", "Web Applications", "Rust"];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-foreground">
      {/* Page toolbar */}
      <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-border bg-card/40 shrink-0">
        {/* Left: user context + status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">
              {handle ? `@${handle}` : "My Dashboard"}
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-500 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Active
            </span>
          </div>
        </div>

        {/* Center: search */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects…"
              className="w-full bg-background border border-border rounded-md py-1.5 pl-8 pr-3 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <Bell className="w-3.5 h-3.5" />
            Activity
          </button>
          <button className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Metrics */}
        <QuickMetrics stats={stats} />

        {/* Filter + view toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all",
                  filter === cat
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center bg-muted border border-border p-0.5 rounded-md">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-1 rounded transition-colors", viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn("p-1 rounded transition-colors", viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Project grid */}
        <div className={cn(
          "grid gap-4",
          viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredProjects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <p className="text-muted-foreground text-sm">No projects match your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
