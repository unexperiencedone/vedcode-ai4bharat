"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Loader2,
  Star,
  AlertCircle,
  RefreshCw,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MarkdownContent from "@/components/vedcode/MarkdownContent";
import { KeywordTooltip } from "@/components/documentExplainer/KeywordTooltip";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConceptNode {
  concept: string;
  prerequisite?: string;
  unlocks?: string[];
  related?: string[];
}

interface GalaxyEdge {
  from: string;
  to: string;
  type: "unlocks" | "prerequisite" | "related";
}

interface PageExplanation {
  pageIndex: number;
  parentHeader: string;
  summary: string;
  deepInsight: string;
  keywords: Record<string, string>;
  intuitionTip: string;
  url: string;
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

interface NodePos {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const EDGE_STYLE: Record<
  GalaxyEdge["type"],
  { stroke: string; dash: string; label: string }
> = {
  unlocks: { stroke: "#3b82f6", dash: "none", label: "Unlocks" },
  prerequisite: { stroke: "#f59e0b", dash: "6 3", label: "Prerequisite" },
  related: { stroke: "#475569", dash: "2 4", label: "Related" },
};

// ─── Force-directed layout ────────────────────────────────────────────────────

function computeLayout(
  nodes: ConceptNode[],
  edges: GalaxyEdge[],
  W: number,
  H: number,
  iterations = 120,
): Map<string, NodePos> {
  const pos = new Map<string, NodePos>();
  const n = nodes.length;
  const k = Math.sqrt((W * H) / Math.max(n, 1));

  nodes.forEach((nd, i) => {
    const angle = (2 * Math.PI * i) / n;
    const r = Math.min(W, H) * 0.35;
    pos.set(nd.concept, {
      x: W / 2 + r * Math.cos(angle),
      y: H / 2 + r * Math.sin(angle),
      vx: 0,
      vy: 0,
    });
  });

  for (let iter = 0; iter < iterations; iter++) {
    const t = k * (1 - iter / iterations) * 0.8;
    nodes.forEach((u) => {
      const pu = pos.get(u.concept)!;
      pu.vx = 0;
      pu.vy = 0;
      nodes.forEach((v) => {
        if (u.concept === v.concept) return;
        const pv = pos.get(v.concept)!;
        const dx = pu.x - pv.x,
          dy = pu.y - pv.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01);
        pu.vx += (dx / dist) * ((k * k) / dist);
        pu.vy += (dy / dist) * ((k * k) / dist);
      });
    });
    edges.forEach((e) => {
      const pu = pos.get(e.from),
        pv = pos.get(e.to);
      if (!pu || !pv) return;
      const dx = pv.x - pu.x,
        dy = pv.y - pu.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01);
      const a = (dist * dist) / k;
      pu.vx += (dx / dist) * a;
      pu.vy += (dy / dist) * a;
      pv.vx -= (dx / dist) * a;
      pv.vy -= (dy / dist) * a;
    });
    nodes.forEach((nd) => {
      const p = pos.get(nd.concept)!;
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > t) {
        p.vx = (p.vx / speed) * t;
        p.vy = (p.vy / speed) * t;
      }
      p.x = Math.max(60, Math.min(W - 60, p.x + p.vx));
      p.y = Math.max(40, Math.min(H - 40, p.y + p.vy));
    });
  }
  return pos;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ConceptGalaxy() {
  const [sources, setSources] = useState<SourceMeta[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [nodes, setNodes] = useState<ConceptNode[]>([]);
  const [edges, setEdges] = useState<GalaxyEdge[]>([]);
  const [layout, setLayout] = useState<Map<string, NodePos>>(new Map());
  const [activeMeta, setActiveMeta] = useState<SourceMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  // Detail panel state
  const [selected, setSelected] = useState<ConceptNode | null>(null);
  const [pageDetail, setPageDetail] = useState<PageExplanation | null>(null);
  const [pageLoading, setPageLoading] = useState(false);

  const W = 900,
    H = 540;

  useEffect(() => {
    fetch("/api/vedcode/sources")
      .then(async r => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
        if (d.error) throw new Error(d.error);
        setSources(d.sources || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setSourcesLoading(false));
  }, []);

  const loadGalaxy = async (sourceId: string) => {
    setLoading(true);
    setError("");
    setNodes([]);
    setEdges([]);
    try {
      const res = await fetch(
        `/api/vedcode/galaxy?sourceId=${encodeURIComponent(sourceId)}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const nl: ConceptNode[] = json.nodes;
      const el: GalaxyEdge[] = json.edges;
      setNodes(nl);
      setEdges(el);
      setLayout(computeLayout(nl, el, W, H));
      setActiveMeta(json.meta);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = async (nd: ConceptNode) => {
    if (!activeMeta) return;
    setSelected(nd);
    setPageDetail(null);
    setPageLoading(true);
    try {
      const res = await fetch(
        `/api/vedcode/reader?sourceId=${encodeURIComponent(activeMeta.sourceId)}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      // Find the page whose parentHeader best matches the concept
      const pages: PageExplanation[] = json.pages || [];
      const concept = nd.concept.toLowerCase();
      const match =
        pages.find((p) => p.parentHeader.toLowerCase().includes(concept)) ||
        pages.find((p) => p.summary?.toLowerCase().includes(concept)) ||
        pages[0];
      setPageDetail(match || null);
    } catch {
      setPageDetail(null);
    } finally {
      setPageLoading(false);
    }
  };

  const connectivity = useCallback(
    (concept: string) =>
      edges.filter((e) => e.from === concept || e.to === concept).length,
    [edges],
  );

  const radius = (concept: string) =>
    Math.max(8, Math.min(18, 8 + connectivity(concept) * 1.5));

  const reset = () => {
    setActiveMeta(null);
    setNodes([]);
    setEdges([]);
    setSelected(null);
    setPageDetail(null);
  };

  // ── Source selector ───────────────────────────────────────────────────────
  if (!activeMeta && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-600/20 rounded-xl">
            <Star className="text-violet-400" size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Galaxy Map
            </h2>
            <p className="text-sm text-slate-500">
              Select a source to explore its concept constellation
            </p>
          </div>
        </div>
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {sourcesLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-violet-400" />
          </div>
        ) : sources.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Star size={48} className="text-violet-500/20 mb-4" />
            <p className="text-slate-500">No sources ingested yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sources
              .filter((s) => s.conceptGraph && s.conceptGraph.length > 0)
              .map((src) => (
                <button
                  key={src.sourceId}
                  onClick={() => loadGalaxy(src.sourceId)}
                  className="group text-left p-5 bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 hover:border-violet-500/30 rounded-2xl transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="font-semibold text-sm text-white group-hover:text-violet-300 transition-colors leading-snug">
                      {src.name}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-violet-500/20 text-violet-400 flex-shrink-0">
                      {src.conceptGraph!.length} concepts
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate">{src.url}</p>
                </button>
              ))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/10 blur-3xl rounded-full scale-[3]" />
          <Loader2
            size={36}
            className="animate-spin text-violet-400 relative"
          />
        </div>
        <p className="text-slate-500 text-sm">Computing galaxy layout...</p>
      </div>
    );
  }

  // ── Galaxy view ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 font-mono">{activeMeta?.name}</p>
          <h2 className="text-lg font-bold text-white">
            Concept Galaxy{" "}
            {selected && (
              <span className="text-violet-400">→ {selected.concept}</span>
            )}
          </h2>
        </div>
        <button
          onClick={reset}
          className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw size={12} /> Change source
        </button>
      </div>

      {/* Galaxy + Detail panel wrapper */}
      <div className="relative flex gap-4">
        {/* SVG Galaxy */}
        <div
          className={cn(
            "relative bg-background border border-slate-800/60 rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-500",
            selected ? "w-[55%]" : "w-full",
          )}
          style={{ height: H }}
        >
          {/* Starfield */}
          <svg
            className="absolute inset-0 opacity-20"
            width="100%"
            height="100%"
          >
            {Array.from({ length: 80 }).map((_, i) => (
              <circle
                key={i}
                cx={`${(i * 137.5) % 100}%`}
                cy={`${(i * 79.3) % 100}%`}
                r={i % 5 === 0 ? 1.5 : 0.8}
                fill="#94a3b8"
                opacity={0.3 + (i % 3) * 0.2}
              />
            ))}
          </svg>

          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${W} ${H}`}
            className="relative z-10"
          >
            <defs>
              <filter id="glow-star">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="star-grad-default" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </radialGradient>
              <radialGradient id="star-grad-hover" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#a78bfa" />
              </radialGradient>
              <radialGradient id="star-grad-selected" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#7c3aed" />
              </radialGradient>
            </defs>

            {/* Edges */}
            {edges.map((e, i) => {
              const from = layout.get(e.from),
                to = layout.get(e.to);
              if (!from || !to) return null;
              const style = EDGE_STYLE[e.type];
              const isHighlighted =
                hovered === e.from ||
                hovered === e.to ||
                selected?.concept === e.from ||
                selected?.concept === e.to;
              return (
                <line
                  key={i}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={style.stroke}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeDasharray={style.dash}
                  opacity={
                    isHighlighted ? 0.9 : hovered || selected ? 0.08 : 0.35
                  }
                  strokeLinecap="round"
                  style={{ transition: "opacity 0.2s, stroke-width 0.2s" }}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((nd) => {
              const p = layout.get(nd.concept);
              if (!p) return null;
              const r = radius(nd.concept);
              const isSelected = selected?.concept === nd.concept;
              const isHovered = hovered === nd.concept;
              const isConnected =
                hovered || selected?.concept
                  ? edges.some((e) => {
                      const ref = hovered || selected?.concept;
                      return (
                        (e.from === ref && e.to === nd.concept) ||
                        (e.to === ref && e.from === nd.concept)
                      );
                    })
                  : false;
              const dimmed =
                (hovered || selected) &&
                !isHovered &&
                !isSelected &&
                !isConnected;

              return (
                <g
                  key={nd.concept}
                  style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                  opacity={dimmed ? 0.12 : 1}
                  onMouseEnter={() => setHovered(nd.concept)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleNodeClick(nd)}
                >
                  {/* Selected ring */}
                  {isSelected && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={r + 10}
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth={2}
                      opacity={0.7}
                      filter="url(#glow-star)"
                    />
                  )}
                  {/* Hover ring */}
                  {isHovered && !isSelected && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={r + 7}
                      fill="none"
                      stroke="#a78bfa"
                      strokeWidth={1.5}
                      opacity={0.5}
                      className="animate-pulse"
                    />
                  )}
                  {/* Star body */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={r}
                    fill={
                      isSelected
                        ? "url(#star-grad-selected)"
                        : isHovered
                          ? "url(#star-grad-hover)"
                          : "url(#star-grad-default)"
                    }
                    filter={
                      isHovered || isSelected ? "url(#glow-star)" : undefined
                    }
                  />
                  {/* Hub ring */}
                  {connectivity(nd.concept) >= 3 &&
                    !isHovered &&
                    !isSelected && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={r + 3}
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth={1}
                        opacity={0.3}
                      />
                    )}
                  {/* Label */}
                  {(isHovered ||
                    isSelected ||
                    connectivity(nd.concept) >= 3) && (
                    <text
                      x={p.x}
                      y={p.y - r - 6}
                      textAnchor="middle"
                      fontSize={isSelected ? 13 : isHovered ? 12 : 10}
                      fontWeight={isSelected || isHovered ? 700 : 500}
                      fill={
                        isSelected
                          ? "#c4b5fd"
                          : isHovered
                            ? "#e2e8f0"
                            : "#94a3b8"
                      }
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {nd.concept}
                    </text>
                  )}
                  {/* Click hint on hover */}
                  {isHovered && !isSelected && (
                    <text
                      x={p.x}
                      y={p.y + r + 14}
                      textAnchor="middle"
                      fontSize={9}
                      fill="#7c3aed"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      click to explore
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail Panel — slides in when a node is selected */}
        {selected && (
          <div
            className="flex-1 min-w-0 bg-slate-900/50 border border-slate-800/60 rounded-2xl animate-in slide-in-from-right-4 duration-400 overflow-auto"
            style={{ height: H }}
          >
            <div className="p-5 h-full flex flex-col">
              {/* Panel header */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <p className="text-xs text-violet-400 font-bold uppercase tracking-widest mb-0.5">
                    Concept
                  </p>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {selected.concept}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setSelected(null);
                    setPageDetail(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-700/60 text-slate-500 hover:text-white transition-all flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Relationship pills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selected.prerequisite && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                    ← {selected.prerequisite}
                  </span>
                )}
                {selected.unlocks?.map((u) => (
                  <span
                    key={u}
                    className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  >
                    → {u}
                  </span>
                ))}
                {selected.related?.slice(0, 2).map((r) => (
                  <span
                    key={r}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-400 border border-slate-700"
                  >
                    ≈ {r}
                  </span>
                ))}
              </div>

              <div className="border-t border-slate-800/60 pt-4 flex-1 overflow-auto">
                {pageLoading ? (
                  <div className="flex items-center gap-2 text-slate-500 py-6">
                    <Loader2
                      size={16}
                      className="animate-spin text-violet-400"
                    />
                    <span className="text-sm">Loading page insight...</span>
                  </div>
                ) : pageDetail ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">
                        From
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {pageDetail.parentHeader}
                      </p>
                    </div>
                    <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
                      <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">
                        Summary
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {pageDetail.summary}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Sparkles size={10} className="text-violet-400" /> Deep
                        Insight
                      </p>
                      <div className="text-xs">
                        <MarkdownContent
                          content={pageDetail.deepInsight}
                          keywords={pageDetail.keywords}
                        />
                      </div>
                    </div>
                    {pageDetail.intuitionTip && (
                      <div className="p-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl">
                        <p className="text-xs text-slate-300 italic">
                          {pageDetail.intuitionTip}
                        </p>
                      </div>
                    )}
                    {Object.keys(pageDetail.keywords).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Object.entries(pageDetail.keywords)
                          .slice(0, 8)
                          .map(([term, def]) => (
                            <KeywordTooltip
                              key={term}
                              term={term}
                              definition={def}
                            />
                          ))}
                      </div>
                    )}
                    <a
                      href={pageDetail.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-slate-600 hover:text-slate-400 flex items-center gap-1 transition-colors pt-2"
                    >
                      <ArrowRight size={10} /> View original source
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 py-4">
                    No matching Encyclopedia page found for this concept.
                    Re-ingest to generate page insights.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend + stats */}
      <div className="flex items-center gap-6 px-2 flex-wrap">
        {Object.entries(EDGE_STYLE).map(([type, style]) => (
          <div key={type} className="flex items-center gap-2">
            <svg width={28} height={10}>
              <line
                x1={0}
                y1={5}
                x2={28}
                y2={5}
                stroke={style.stroke}
                strokeWidth={1.5}
                strokeDasharray={style.dash}
              />
            </svg>
            <span className="text-xs text-slate-500">{style.label}</span>
          </div>
        ))}
        <span className="text-xs text-slate-700 ml-auto">
          Click any star to explore its page insight
        </span>
      </div>
      <div className="flex gap-6 text-xs text-slate-700 px-2">
        <span>{nodes.length} concepts</span>
        <span>
          {edges.filter((e) => e.type === "unlocks").length} unlock paths
        </span>
        <span>
          {edges.filter((e) => e.type === "prerequisite").length} prerequisites
        </span>
        <span>
          {edges.filter((e) => e.type === "related").length} related links
        </span>
      </div>
    </div>
  );
}
