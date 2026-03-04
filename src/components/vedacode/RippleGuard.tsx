"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Loader2,
  Zap,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ArrowDown,
  Shield,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity  = "breaking" | "warning" | "info";
type LayerType = "db-model" | "drizzle-action" | "server-action" | "component" | "hook" | "api" | "util";
type RiskLevel = "low" | "medium" | "high" | "critical";

interface AffectedFile {
  filePath: string;
  importedSymbols: string[];
  layerType: LayerType;
  severity: Severity;
}

interface ImpactChain {
  changedFile: string;
  exportedSymbols: string[];
  affectedFiles: AffectedFile[];
  riskLevel: RiskLevel;
}

interface RippleResult {
  chain: ImpactChain;
  narrative: { markdown: string; summary: string };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const LAYER_CONFIG: Record<LayerType, { label: string; color: string; bg: string; border: string }> = {
  "db-model":       { label: "DB Model",      color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  "drizzle-action": { label: "Drizzle",       color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  "server-action":  { label: "Server Action", color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20" },
  "api":            { label: "API Route",     color: "text-teal-400",   bg: "bg-teal-500/10",   border: "border-teal-500/20" },
  "hook":           { label: "Hook",          color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
  "component":      { label: "Component",     color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20" },
  "util":           { label: "Utility",       color: "text-slate-400",  bg: "bg-slate-500/10",  border: "border-slate-500/20" },
};

const SEVERITY_CONFIG: Record<Severity, { icon: React.ReactNode; color: string; label: string }> = {
  breaking: { icon: <AlertCircle size={14} />, color: "text-red-400",    label: "Breaking" },
  warning:  { icon: <AlertTriangle size={14} />, color: "text-amber-400", label: "Warning" },
  info:     { icon: <Info size={14} />,           color: "text-blue-400",  label: "Info" },
};

const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; label: string }> = {
  critical: { color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",    label: "CRITICAL" },
  high:     { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", label: "HIGH" },
  medium:   { color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/30",   label: "MEDIUM" },
  low:      { color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/30",label: "LOW" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RippleGuard() {
  const [filePath, setFilePath] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RippleResult | null>(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!filePath.trim() || !content.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/vedacode/ripple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: filePath.trim(), content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const risk = result ? RISK_CONFIG[result.chain.riskLevel] : null;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-red-600/20 rounded-xl">
          <Zap className="text-red-400" size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Ripple Guard</h2>
          <p className="text-sm text-slate-500">Paste a file to see what breaks across your codebase</p>
        </div>
      </div>

      {/* ── Input ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">File Path</label>
          <input
            value={filePath}
            onChange={e => setFilePath(e.target.value)}
            placeholder="src/db/schema.ts"
            className="w-full bg-[#0f172a]/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 placeholder:text-slate-600 transition-all"
          />
        </div>
        <div className="flex items-end">
          <Button
            onClick={handleCheck}
            disabled={!filePath.trim() || !content.trim() || loading}
            className="w-full h-[42px] bg-red-600/80 hover:bg-red-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-red-500/10"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
            ) : (
              <><Shield size={16} /> Run Ripple Check</>
            )}
          </Button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={`// Paste the modified file content here\nexport function useUser() { ... }`}
        rows={10}
        className="w-full bg-[#0f172a]/60 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/40 placeholder:text-slate-600 transition-all resize-none custom-scrollbar"
      />

      {/* ── Error ── */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Risk Badge */}
          <div className={cn("flex items-center justify-between p-5 rounded-2xl border", risk?.bg)}>
            <div>
              <p className={cn("text-xs font-bold tracking-widest uppercase", risk?.color)}>Risk Level</p>
              <p className={cn("text-3xl font-black mt-1", risk?.color)}>{risk?.label}</p>
              <p className="text-slate-500 text-sm mt-1">{result.narrative.summary}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-slate-500 text-xs">Affected Files</p>
              <p className={cn("text-4xl font-black", risk?.color)}>{result.chain.affectedFiles.length}</p>
              <p className="text-slate-600 text-xs">{result.chain.exportedSymbols.length} exported symbols</p>
            </div>
          </div>

          {/* Impact Chain visual */}
          {result.chain.affectedFiles.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <GitBranch size={12} /> Impact Chain
              </p>

              {/* Changed file */}
              <div className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl">
                <FileCode size={16} className="text-white flex-shrink-0" />
                <span className="text-sm font-mono text-white font-semibold">{result.chain.changedFile}</span>
                <span className="ml-auto text-xs text-slate-500">CHANGED</span>
              </div>

              {result.chain.affectedFiles.map((file, i) => {
                const layer = LAYER_CONFIG[file.layerType] || LAYER_CONFIG.util;
                const sev   = SEVERITY_CONFIG[file.severity];
                return (
                  <React.Fragment key={i}>
                    <div className="flex justify-center">
                      <ArrowDown size={14} className="text-slate-700" />
                    </div>
                    <div className={cn(
                      "flex items-start gap-3 p-3 border rounded-xl",
                      layer.bg, layer.border
                    )}>
                      <div className={cn("mt-0.5", sev.color)}>{sev.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-mono font-semibold truncate", layer.color)}>
                          {file.filePath}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", layer.bg, layer.color, "border", layer.border)}>
                            {layer.label}
                          </span>
                          <span className={cn("text-xs font-semibold", sev.color)}>{sev.label}</span>
                          {file.importedSymbols.length > 0 && (
                            <span className="text-xs text-slate-600 font-mono truncate">
                              imports: {file.importedSymbols.slice(0, 3).join(", ")}
                              {file.importedSymbols.length > 3 ? ` +${file.importedSymbols.length - 3}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* AI Narrative */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={12} /> Butterfly Effect Analysis
            </p>
            <article className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-headings:text-white prose-code:text-blue-400 prose-code:bg-blue-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.narrative.markdown}
              </ReactMarkdown>
            </article>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!result && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full scale-[2]" />
            <Shield size={56} className="text-red-500/30 relative" />
          </div>
          <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed">
            Paste a TypeScript file and its path to trace how changes ripple through your codebase.
          </p>
        </div>
      )}
    </div>
  );
}
