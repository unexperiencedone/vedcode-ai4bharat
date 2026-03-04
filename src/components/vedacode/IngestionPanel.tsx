"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Globe,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Network,
  Sparkles,
  ChevronRight,
  Database,
  Cpu,
  GitBranch,
  ArrowRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = "crawling" | "chunking" | "embedding" | "storing" | "graphing" | "done" | "error" | "idle";

interface SourceMeta {
  sourceId: string;
  name: string;
  url: string;
  status: Stage;
  chunkCount: number;
  ingestedAt: string;
  conceptGraph?: Array<{ concept: string; prerequisite?: string; unlocks?: string[]; related?: string[] }>;
  error?: string;
}

// ─── Stage config ─────────────────────────────────────────────────────────────

const STAGES: { key: Stage; label: string; icon: React.ReactNode }[] = [
  { key: "crawling",  label: "Crawling URL",       icon: <Globe size={14} /> },
  { key: "chunking",  label: "Semantic Chunking",  icon: <BookOpen size={14} /> },
  { key: "embedding", label: "Titan Embeddings",   icon: <Cpu size={14} /> },
  { key: "storing",   label: "DynamoDB Storage",   icon: <Database size={14} /> },
  { key: "graphing",  label: "Concept Graph",      icon: <Network size={14} /> },
  { key: "done",      label: "Complete",           icon: <CheckCircle2 size={14} /> },
];

const STAGE_ORDER = STAGES.map(s => s.key);

function stageIndex(s: Stage): number {
  return STAGE_ORDER.indexOf(s);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function IngestionPanel({ embedded = false }: { embedded?: boolean }) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<Stage>("idle");
  const [meta, setMeta] = useState<SourceMeta | null>(null);
  const [library, setLibrary] = useState<SourceMeta[]>([]);
  const [selectedSource, setSelectedSource] = useState<SourceMeta | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Poll for status ──────────────────────────────────────────────────────────

  const startPolling = (sourceId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/vedacode/ingest?sourceId=${sourceId}`);
        if (!res.ok) return;
        const data: SourceMeta = await res.json();
        setMeta(data);
        setCurrentStage(data.status as Stage);

        if (data.status === "done" || data.status === "error") {
          clearInterval(pollRef.current!);
          setLibrary(prev => {
            const without = prev.filter(s => s.sourceId !== data.sourceId);
            return [data, ...without];
          });
        }
      } catch { /* ignore */ }
    }, 2500);
  };

  // ── Submit ingestion ─────────────────────────────────────────────────────────

  const handleIngest = async () => {
    if (!url.trim()) return;

    setCurrentStage("crawling");
    setMeta(null);
    setSearchResults([]);

    try {
      const res = await fetch("/api/vedacode/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), name: name.trim() || undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActiveSourceId(data.sourceId);
      startPolling(data.sourceId);
    } catch (err: any) {
      setCurrentStage("error");
    }
  };

  // ── Semantic search ──────────────────────────────────────────────────────────

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedSource) return;
    setSearchLoading(true);
    try {
      const res = await fetch("/api/vedacode/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, sourceId: selectedSource.sourceId }),
      });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch { /* ignore */ }
    finally { setSearchLoading(false); }
  };

  // ── Cleanup ──────────────────────────────────────────────────────────────────

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const isIngesting = currentStage !== "idle" && currentStage !== "done" && currentStage !== "error";

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-8 selection:bg-blue-500/20">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* ── Header ── */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-600/20 rounded-xl">
              <Sparkles className="text-violet-400" size={22} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Knowledge Ingestion Engine
            </h1>
          </div>
          <p className="text-slate-500 text-sm ml-[52px]">
            Feed documentation URLs into the VedaCode vector store. Chunks are embedded with Titan 512d and stored in DynamoDB for semantic search.
          </p>
        </div>

        {/* ── Input Panel ── */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Ingest New Source</h2>

          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleIngest()}
                placeholder="https://nextjs.org/docs/app/getting-started/installation"
                className="w-full bg-[#0f172a]/60 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 placeholder:text-slate-600 transition-all"
              />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='Label (optional) — e.g. "Next.js App Router Docs"'
                className="w-full bg-[#0f172a]/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 placeholder:text-slate-600 transition-all"
              />
            </div>
            <Button
              onClick={handleIngest}
              disabled={!url.trim() || isIngesting}
              className="h-full px-6 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2"
            >
              {isIngesting ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {isIngesting ? "Ingesting..." : "Ingest"}
            </Button>
          </div>
        </div>

        {/* ── Pipeline Progress ── */}
        {currentStage !== "idle" && (
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-6 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Pipeline Status</h2>
              {meta && (
                <span className="text-xs text-slate-500 font-mono">
                  {meta.chunkCount} chunks
                </span>
              )}
            </div>

            {/* Stage Steps */}
            <div className="relative">
              {/* connector line */}
              <div className="absolute left-[17px] top-5 h-[calc(100%-2.5rem)] w-px bg-slate-800" />

              <div className="space-y-4">
                {STAGES.map((s, i) => {
                  const current = stageIndex(currentStage);
                  const done = i < current || currentStage === "done";
                  const active = s.key === currentStage;
                  const pending = i > current && currentStage !== "done";

                  return (
                    <div key={s.key} className="flex items-start gap-4 relative z-10">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                        done && "bg-emerald-500/20 text-emerald-400",
                        active && s.key === "error" && "bg-red-500/20 text-red-400",
                        active && s.key !== "error" && !done && "bg-violet-500/20 text-violet-300 ring-2 ring-violet-500/40",
                        pending && "bg-slate-800/60 text-slate-600",
                      )}>
                        {active && s.key !== "error" && !done ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : done ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          s.icon
                        )}
                      </div>
                      <div className="pt-1.5">
                        <p className={cn(
                          "text-sm font-semibold transition-colors",
                          done && "text-emerald-400",
                          active && s.key !== "error" && !done && "text-violet-300",
                          pending && "text-slate-600",
                        )}>
                          {s.label}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {currentStage === "error" && (
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/20 text-red-400">
                      <AlertCircle size={14} />
                    </div>
                    <div className="pt-1.5">
                      <p className="text-sm font-semibold text-red-400">Error</p>
                      <p className="text-xs text-red-400/70 mt-0.5">{meta?.error || "Unknown error"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Concept Graph Preview */}
            {meta?.conceptGraph && meta.conceptGraph.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Concept Graph</p>
                <div className="flex flex-wrap gap-2">
                  {meta.conceptGraph.slice(0, 12).map((node, i) => (
                    <div
                      key={i}
                      className="group relative px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs text-violet-300 font-medium cursor-default hover:bg-violet-500/20 transition-all"
                    >
                      {node.concept}
                      {node.unlocks && node.unlocks.length > 0 && (
                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-xs hidden group-hover:block z-50 shadow-2xl">
                          <p className="text-slate-400 font-semibold mb-1">Unlocks</p>
                          {node.unlocks.map((u, j) => (
                            <p key={j} className="text-violet-300 flex items-center gap-1">
                              <ChevronRight size={10} /> {u}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Library + Search ── */}
        {library.length > 0 && (
          <div className="grid grid-cols-2 gap-6">
            {/* Source Library */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-3 backdrop-blur-xl">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Source Library</h2>
              <div className="space-y-2">
                {library.map(src => (
                  <button
                    key={src.sourceId}
                    onClick={() => setSelectedSource(src)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all",
                      selectedSource?.sourceId === src.sourceId
                        ? "bg-violet-500/10 border-violet-500/30 text-violet-200"
                        : "bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/60 text-slate-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{src.name}</p>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        src.status === "done" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      )}>
                        {src.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-1">{src.url}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {src.chunkCount} chunks · {src.conceptGraph?.length || 0} concepts
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Semantic Search */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                Semantic Search {selectedSource && <span className="text-violet-400">— {selectedSource.name}</span>}
              </h2>

              {!selectedSource ? (
                <p className="text-sm text-slate-600">Select a source from the library to search</p>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSearch()}
                      placeholder="What is the App Router?"
                      className="flex-1 bg-[#0f172a]/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 placeholder:text-slate-600 transition-all"
                    />
                    <Button
                      onClick={handleSearch}
                      disabled={searchLoading}
                      className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4"
                    >
                      {searchLoading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                    {searchResults.map((r, i) => (
                      <div
                        key={i}
                        className="p-4 bg-slate-800/40 border border-slate-700/30 rounded-xl space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-violet-400 font-semibold">{r.parentHeader}</p>
                            <p className="text-xs text-slate-600">{r.pageTitle}</p>
                          </div>
                          <span className="text-xs font-mono text-emerald-400 flex-shrink-0">
                            {(r.score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">{r.text}</p>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                          <Globe size={10} /> {r.url.slice(0, 60)}...
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
