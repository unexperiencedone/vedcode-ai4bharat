"use client";

import React, { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Plus,
  Bell,
  Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QuickMetrics } from "./QuickMetrics";
import { LearnerIntelligencePanel } from "./LearnerIntelligencePanel";
import { ProjectCard } from "./ProjectCard";
import { NotificationDialog } from "./NotificationDialog";
import { cn } from "@/lib/utils";

export interface DashboardViewProps {
  data: any;
  handle: string;
}

export function DashboardView({ data, handle }: DashboardViewProps) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);

  const projects = data?.projects || [];
  const recentLogs = data?.recentLogs || [];

  const notifications = [
    ...recentLogs.map((log: any) => ({
      id: log.id,
      type: "system" as const,
      title: log.action || "System Event",
      message: log.message || "A system event was recorded",
      timestamp: new Date(log.timestamp),
      read: true,
      details: {
        cluster: log.cluster,
        author: log.author,
        target: log.target
      }
    })),
    // Placeholder mentor insight if none in DB (for demo)
    {
      id: "mentor-1",
      type: "mentor" as const,
      title: "Growth Pattern Detected",
      message: "I notice you're spending more time on async patterns. You've mastered 'Promises' 15% faster than average.",
      timestamp: new Date(),
      read: false,
      details: "Pattern: ASYNC_MASTERY_PATHway. Recommendation: Try the 'Edge Runtime' module next."
    }
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const stats = data?.stats || {};

  const filteredProjects = projects.filter((p: any) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || p.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = [
    "All",
    "AI & ML",
    "Infrastructure",
    "Web Applications",
    "Rust",
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-slate-50 relative selection:bg-indigo-500/30">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center justify-between gap-4 px-8 py-4 border-b border-white/5 bg-slate-950/40 backdrop-blur-xl shrink-0 sticky top-0 z-50"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="text-sm font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent truncate">
              {handle ? `@${handle}` : "My Workspace"}
            </span>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Live
          </span>
        </div>

        {/* Command Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search projects, files, concepts..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2 pl-10 pr-12 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-500 shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-slate-500 font-medium bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 pointer-events-none">
              <Command className="w-3 h-3" /> K
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setIsNotifyOpen(true)}
            className="flex items-center justify-center w-9 h-9 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all relative group"
          >
            <Bell className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </button>
        </div>
      </motion.div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative z-10">
        {/* Massive Hero Section */}
        <div className="px-8 pt-12 pb-8 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Engineer.
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mb-10">
              Your system is live. Below is VedCode's live intelligence profile — every metric that shapes how the platform learns alongside you.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <QuickMetrics stats={stats} learnerMetrics={data?.learnerMetrics} />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <LearnerIntelligencePanel learnerMetrics={data?.learnerMetrics} />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16"
          >
            {/* Filter + view toggles */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-20">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-all duration-300",
                      filter === cat
                        ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]"
                        : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-900/50 border border-slate-800 rounded-lg hover:text-white hover:bg-slate-800 transition-all">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                <div className="h-6 w-px bg-slate-800" />
                <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      viewMode === "grid"
                        ? "bg-slate-800 text-white shadow"
                        : "text-slate-500 hover:text-white",
                    )}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      viewMode === "list"
                        ? "bg-slate-800 text-white shadow"
                        : "text-slate-500 hover:text-white",
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Project grid */}
            <motion.div
              layout
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1",
              )}
            >
              <AnimatePresence>
                {filteredProjects.map((project: any, index: number) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    key={project.id}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredProjects.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-24 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20"
                >
                  <p className="text-slate-400 text-lg">
                    No projects match the current filter.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      <NotificationDialog 
        open={isNotifyOpen} 
        onOpenChange={setIsNotifyOpen} 
        notifications={notifications} 
      />
    </div>
  );
}
