"use client";

import React, { useState, useEffect } from "react";
import MarkdownContent from "@/components/vedacode/MarkdownContent";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Link2,
  Lightbulb,
  Hash,
  Globe,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageExplanation {
  sourceId: string;
  pageIndex: number;
  pageTitle: string;
  parentHeader: string;
  url: string;
  summary: string;
  deepInsight: string;
  keywords: Record<string, string>;
  intuitionTip: string;
}

interface BridgeExplanation {
  fromPage: number;
  toPage: number;
  fromHeader: string;
  toHeader: string;
  bridgeText: string;
}

interface SourceMeta {
  sourceId: string;
  name: string;
  url: string;
  status: string;
  chunkCount: number;
  ingestedAt: string;
  conceptGraph?: any[];
}

interface ReaderData {
  meta: SourceMeta;
  pages: PageExplanation[];
  bridges: BridgeExplanation[];
}

export default function DocumentReader() {
  const [sources, setSources] = useState<SourceMeta[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReaderData | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/vedacode/sources")
      .then(async r => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
        if (d.error)  throw new Error(d.error);
        setSources(d.sources || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setSourcesLoading(false));
  }, []);

  const openSource = async (sourceId: string) => {
    setLoading(true);
    setError("");
    setData(null);
    setPageIdx(0);
    try {
      const res = await fetch(
        `/api/vedacode/reader?sourceId=${encodeURIComponent(sourceId)}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const page = data?.pages[pageIdx];
  const bridge = data?.bridges.find((b) => b.fromPage === pageIdx);
  const total = data?.pages.length ?? 0;
  const goTo = (i: number) => setPageIdx(Math.max(0, Math.min(i, total - 1)));

  // ── Source Library ────────────────────────────────────────────────────────
  if (!data && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-600/20 rounded-xl">
            <BookOpen className="text-amber-400" size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Encyclopedia Reader
            </h2>
            <p className="text-sm text-slate-500">
              Select a source to browse its pre-digested pages
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {sourcesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-amber-400" />
          </div>
        ) : sources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full scale-[2]" />
              <BookOpen size={52} className="text-amber-500/30 relative" />
            </div>
            <p className="text-slate-400 font-semibold mb-1">
              No sources ingested yet
            </p>
            <p className="text-slate-600 text-sm">
              Go to Knowledge Ingestion and add a documentation URL first.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sources.map((src) => (
              <button
                key={src.sourceId}
                onClick={() => openSource(src.sourceId)}
                className="group text-left p-5 bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 hover:border-amber-500/30 rounded-2xl transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="font-semibold text-sm text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {src.name}
                  </p>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0",
                      src.status === "done"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400",
                    )}
                  >
                    {src.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 truncate mb-2">
                  {src.url}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{src.chunkCount} chunks</span>
                  {src.conceptGraph && (
                    <span>· {src.conceptGraph.length} concepts</span>
                  )}
                  <span>· {new Date(src.ingestedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 size={32} className="animate-spin text-amber-400" />
        <p className="text-slate-500 text-sm">Loading encyclopedia...</p>
      </div>
    );
  }

  // ── Reader ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Nav bar */}
      <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800/60 rounded-2xl px-5 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setData(null)}
            className="p-1.5 rounded-lg hover:bg-slate-700/60 transition-all text-slate-400 hover:text-white"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <p className="text-xs text-slate-500 font-mono">
              {data?.meta.name}
            </p>
            <p className="text-sm font-semibold text-white truncate max-w-xs">
              {page?.parentHeader}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono">
            {pageIdx + 1} / {total}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => goTo(pageIdx - 1)}
              disabled={pageIdx === 0}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={16} className="text-slate-300" />
            </button>
            <button
              onClick={() => goTo(pageIdx + 1)}
              disabled={pageIdx === total - 1}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-amber-500/8 border border-amber-500/20 rounded-xl">
        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">
          Summary
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          {page?.summary}
        </p>
      </div>

      {/* Deep Insight */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Sparkles size={12} className="text-violet-400" /> Deep Insight
        </p>
        <MarkdownContent content={page?.deepInsight || ""} keywords={page?.keywords} />
      </div>

      {/* Keywords legend strip */}
      {page && Object.keys(page.keywords).length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Hash size={12} /> Key Terms — hover any highlighted word in the text above
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {Object.entries(page.keywords).map(([term, def]) => (
              <span key={term} className="text-xs text-blue-300 underline decoration-dotted underline-offset-2 font-medium">
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Intuition Tip */}
      {page?.intuitionTip && (
        <div className="flex gap-3 p-4 bg-emerald-500/8 border border-emerald-500/20 rounded-xl">
          <Lightbulb
            size={18}
            className="text-emerald-400 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
              Intuition Tip
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {page.intuitionTip}
            </p>
          </div>
        </div>
      )}

      {/* Bridge */}
      {bridge && (
        <div>
          <div className="flex justify-center mb-2">
            <div className="w-px h-6 bg-gradient-to-b from-slate-700 to-blue-500/60" />
          </div>
          <div className="flex gap-3 p-5 bg-blue-500/8 border border-blue-500/20 rounded-2xl">
            <Link2
              size={18}
              className="text-blue-400 flex-shrink-0 mt-0.5 animate-pulse"
            />
            <div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1.5">
                Bridge → {bridge.toHeader}
              </p>
              <MarkdownContent
                content={bridge.bridgeText}
                className="text-sm"
              />
              <button
                onClick={() => goTo(pageIdx + 1)}
                className="mt-3 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                Continue to next page <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Source link */}
      <div className="flex justify-end">
        <a
          href={page?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-600 hover:text-slate-400 flex items-center gap-1.5 transition-colors"
        >
          <Globe size={11} /> View original source
        </a>
      </div>
    </div>
  );
}
