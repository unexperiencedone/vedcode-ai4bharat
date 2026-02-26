"use client";

import React, { useState } from "react";
import { Search, Filter, Grid, List, Plus, Bell, Upload } from "lucide-react";
import { QuickMetrics } from "./QuickMetrics";
import { ProjectCard } from "./ProjectCard";
import { StatusBar } from "./StatusBar";

export interface DashboardViewProps {
  data: any;
  handle: string;
}

export function DashboardView({ data, handle }: DashboardViewProps) {
  const [filter, setFilter] = useState("All Projects");
  const [search, setSearch] = useState("");

  const projects = data?.projects || [];
  const stats = data?.stats || {};

  const filteredProjects = projects.filter((p: any) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.archiveId.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All Projects" || p.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ["All Projects", "AI & ML", "Infrastructure", "Web Applications", "Rust"];

  return (
    <div className="flex h-full overflow-hidden bg-background-dark text-bone font-display">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header (Persistent Command Center) */}
        <header className="h-16 glass-panel flex items-center justify-between px-8 border-t-0 border-x-0 border-b border-white/5">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm mono-text text-bone/60">
              <span>THE_ARCHIVE</span>
              <span className="text-bone/20">/</span>
              <span className="text-bone uppercase">{handle}</span>
            </div>
            <div className="h-4 w-px bg-bone/20" />
            <div className="flex items-center gap-4 text-xs font-medium text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              SYSTEM_NORMAL_01
            </div>
          </div>

          <div className="flex-1 max-w-xl px-12">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-bone/40 group-focus-within:text-primary transition-colors w-5 h-5" />
              <input
                type="text"
                placeholder="CMD+K to search all archives..."
                className="w-full bg-slate-800/50 border border-bone/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-bone/30"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-bone/10 rounded-lg text-xs hover:bg-white/5 transition-colors">
              <Bell className="w-4 h-4" />
              <span>LOGS</span>
            </button>
            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              CREATE NEW PROJECT
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Quick Metrics Grid */}
          <QuickMetrics stats={stats} />

          {/* Utilities: Filters & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-bone/10 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2 md:pb-0 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    filter === cat
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "hover:bg-white/5 border-bone/10 text-bone/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-xs text-bone/60 hover:text-bone transition-colors">
                <Filter className="w-4 h-4" />
                Advanced Filters
              </button>
              <div className="h-4 w-px bg-bone/10" />
              <div className="flex items-center bg-slate-800 border border-bone/10 p-1 rounded-lg">
                <button className="p-1.5 bg-white/10 rounded text-bone">
                  <Grid className="w-4.5 h-4.5" />
                </button>
                <button className="p-1.5 text-bone/40 hover:text-bone transition-colors">
                  <List className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            
            {filteredProjects.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-bone/30 text-lg mono-text italic">No matching archives found in the joint ledger.</p>
              </div>
            )}
          </div>

          {/* Integration & Upload Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="glass-panel p-8 rounded-xl border-dashed border-2 border-bone/10 hover:border-primary/50 transition-all flex flex-col items-center justify-center text-center cursor-pointer group">
              <div className="size-16 rounded-full bg-bone/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-bone/20 group-hover:text-primary" />
              </div>
              <h5 className="text-lg font-semibold mb-2">Drop Project Assets</h5>
              <p className="text-sm text-bone/40 max-w-xs">Drag and drop raw data, design specs, or documentation to archive instantly.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-xl flex flex-col justify-between border-l-4 border-l-primary">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <svg className="size-6 text-bone" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  <h5 className="text-lg font-semibold">GitHub Integration</h5>
                </div>
                <p className="text-sm text-bone/40 mb-6">Seamlessly sync repositories and commit history directly to the archive's distributed ledger.</p>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-white/5 hover:bg-white/10 border border-bone/10 py-2 rounded-lg text-sm transition-colors">Configure Webhooks</button>
                <button className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold transition-all">Sync All Repos</button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Status Bar */}
        <StatusBar projects={projects} stats={stats} />
      </main>
    </div>
  );
}

