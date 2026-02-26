"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Loader2,
  ArrowLeft,
  Activity,
  ShieldCheck,
  History,
  Zap,
  BarChart3,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";

interface PulseData {
  profile: {
    name: string;
    handle: string;
  };
  metrics: {
    totalLogs: number;
    peakActivity: number;
    consistency: string;
    activeDays: number;
  };
  logs: {
    id: string;
    action: string;
    details: string;
    timestamp: string;
    cluster: number;
  }[];
  contributions: {
    date: string;
    count: number;
  }[];
}

export default function ActivityPulsePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = use(params);
  const [data, setData] = useState<PulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/atelier/${handle}/logs`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [handle]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const filteredLogs = data.logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0f18] text-slate-300 font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0a0f18]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={`/atelier/${handle}`}
              className="p-2 hover:bg-white/5 rounded-full transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-white font-bold flex items-center gap-2">
                Activity Pulse <span className="text-primary/50 text-xs font-mono">v4.0.0</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Transparency Protocol: {data.profile.handle}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Status</span>
              <span className="text-xs text-green-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live Sync Enabled
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Operations", value: data.metrics.totalLogs, icon: History, detail: "Logs analyzed" },
            { label: "Peak Density", value: data.metrics.peakActivity, icon: Zap, detail: "Units/day max" },
            { label: "Pulse Consistency", value: data.metrics.consistency, icon: Activity, detail: "Active index" },
            { label: "Verification", value: "Level 4", icon: ShieldCheck, detail: "PGP Signed Data" },
          ].map((m, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl group hover:border-primary/20 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors text-primary">
                  <m.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-mono font-bold text-white mb-1">{m.value}</div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{m.label}</div>
              <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-slate-500 italic">
                {m.detail}
              </div>
            </div>
          ))}
        </section>

        {/* Large Chart */}
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 mb-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <BarChart3 className="w-64 h-64 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Detailed Contribution Density</h2>
                <p className="text-xs text-slate-500">100-day rolling aggregate analysis of system interactions.</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono uppercase font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-white/5" /> No Activity
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-primary/40" /> Low
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-primary" /> High Output
                </span>
              </div>
            </div>

            <div className="flex gap-1.5 h-48 items-end">
              {data.contributions.map((c, i) => {
                const max = data.metrics.peakActivity || 1;
                const h = Math.max((c.count / max) * 100, 2);
                return (
                  <div 
                    key={i} 
                    className="flex-1 group/bar relative"
                    style={{ height: `${h}%` }}
                  >
                    <div className={cn(
                      "w-full h-full rounded-[2px] transition-all",
                      c.count === 0 ? "bg-white/5" : "bg-primary/50 group-hover/bar:bg-primary"
                    )} />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-white text-black text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/bar:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-all transform translate-y-1 group-hover/bar:translate-y-0">
                      <div className="text-slate-500 mb-0.5">{new Date(c.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div className="text-primary">{c.count} System Operations</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-6 text-[10px] font-mono text-slate-500 border-t border-white/5 pt-4">
              <span>{new Date(data.contributions[0].date).toLocaleDateString()}</span>
              <span>Rolling 100-Day Analysis</span>
              <span>{new Date(data.contributions[data.contributions.length - 1].date).toLocaleDateString()}</span>
            </div>
          </div>
        </section>

        {/* Audit Trail */}
        <section className="bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1 italic serif">System Audit Trail</h2>
              <p className="text-xs text-slate-500">Immutable record of all database-linked operations.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-slate-500 uppercase font-bold bg-white/[0.02]">
                <tr>
                  <th className="px-8 py-4">Action Token</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Payload Details</th>
                  <th className="px-8 py-4">Cluster</th>
                  <th className="px-8 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <code className="text-primary font-bold group-hover:text-white transition-colors">
                        HEX_{log.id.slice(0, 8).toUpperCase()}
                      </code>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-slate-400 max-w-md truncate">
                      {log.details || "No payload attached"}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-1 h-3 rounded-full",
                              i < log.cluster ? "bg-primary" : "bg-white/10"
                            )} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredLogs.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-slate-500 text-sm">No operations matching your search were found.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
          End of Audit Report // 2026 Archive Zero
        </div>
        <div className="flex gap-8">
          <button className="text-[10px] text-slate-500 hover:text-white uppercase font-bold transition-colors">Legal Disclosure</button>
          <button className="text-[10px] text-slate-500 hover:text-white uppercase font-bold transition-colors">Privacy Policy</button>
          <button className="text-[10px] text-slate-500 hover:text-white uppercase font-bold transition-colors">Export .JSON</button>
        </div>
      </footer>
    </div>
  );
}
