"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { Node, Edge } from "@xyflow/react";
import { computeLayers, type FileNode, type FileNodeType, type GraphEdge } from "@/lib/graph-layout";
import { useZoomPan } from "@/lib/hooks/useZoomPan";

// ── Type classifier ───────────────────────────────────────────────────────────

function classifyType(filePath: string, rfType: string): FileNodeType {
  const p = filePath.toLowerCase();
  const base = p.split("/").pop() ?? "";

  // Framework-specific refinements — checked first so a file that would also match a
  // broader structural bucket below still gets the more precise label.
  if (/\/db\/schema|schema\.(ts|js)x?$|\/migrations?\//.test(p)) return "data";
  if (/\/(actions?|server-actions?)\/|\.action\.(ts|js)$/.test(p)) return "action";
  if (/\.(config|eslintrc)\.|drizzle\.config|tailwind\.config|postcss\.config|next\.config|webpack\.config|vite\.config|jest\.config|babel\.config/.test(base)) return "config";
  if (/^use[a-z]/.test(base) || /\/hooks?\//.test(p)) return "hook";
  if (/\/(app|pages)\/.*\/(page|layout)\.(tsx?|jsx?)$/.test(p)) return "page";

  // Broad structural buckets — mirrors astParser's server-side classifyNode() and
  // extends it to non-Next.js layouts (Go's /pkg//internal/, MVC's /controllers//models/,
  // etc.) so polyglot repos don't collapse into "other" just for lacking Next.js folders.
  if (/\/(components?|ui|views?|widgets?)\//.test(p) || /\.(vue|svelte)$/.test(base)) return "component";
  if (/\/(api|routes?|controllers?|handlers?)\//.test(p) || /route\.(ts|js)$|_pb\.go$/.test(base)) return "api";
  if (/\/(lib|libs|utils?|helpers?|services?|pkg|internal)\//.test(p)) return "lib";
  if (/\/(db|models?|entities|schemas?)\//.test(p) || base.includes("schema")) return "schema";

  // Fall back to whatever the server already decided instead of re-deriving from scratch.
  const fallback: Record<string, FileNodeType> = { component: "component", api: "api", lib: "lib", schema: "schema" };
  return fallback[rfType] ?? "other";
}

// ── Visual tokens ─────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<FileNodeType, string> = {
  page:      "#60a5fa",
  component: "#3b82f6",
  hook:      "#ec4899",
  api:       "#f59e0b",
  action:    "#1d9e75",
  lib:       "#10b981",
  data:      "#a855f7",
  schema:    "#8b5cf6",
  config:    "#64748b",
  other:     "#2d3748",
};

const TYPE_LABEL: Record<FileNodeType, string> = {
  page:      "Page",
  component: "Component",
  hook:      "Hook",
  api:       "API Route",
  action:    "Server Action",
  lib:       "Library",
  data:      "Data / DB",
  schema:    "Schema",
  config:    "Config",
  other:     "Other",
};

// ── Data adapters ─────────────────────────────────────────────────────────────

function adaptNodes(rfNodes: Node[]): FileNode[] {
  return rfNodes
    .filter((n) => !n.hidden)
    .map((n) => {
      const d = n.data as Record<string, unknown>;
      const fp = (d.filePath as string) ?? n.id;
      return {
        id: n.id,
        name: (d.label as string) ?? fp.split("/").pop() ?? n.id,
        path: fp,
        complexity: (d.complexity as number) ?? 1,
        type: classifyType(fp, (d.nodeType as string) ?? "other"),
      };
    });
}

function adaptEdges(rfEdges: Edge[]): GraphEdge[] {
  return rfEdges.map((e) => ({ from: e.source, to: e.target }));
}

// ── BlastRadius panel ─────────────────────────────────────────────────────────

interface BlastData {
  node: FileNode;
  rfData: Record<string, unknown>;
  upstream: string[];   // IDs this node imports
  downstream: string[]; // IDs that import this node
  allNodes: Map<string, FileNode>;
}

function BlastPanel({
  data, onClose, onMouseEnter, onMouseLeave,
}: {
  data: BlastData;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const { node, rfData, upstream, downstream, allNodes } = data;
  const color = TYPE_COLOR[node.type];
  const isAlert = rfData.redAlert === true;

  const nameOf = (id: string) => allNodes.get(id)?.name ?? id.split("/").pop() ?? id;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute",
        bottom: 14,
        left: "50%",
        transform: "translateX(-50%)",
        width: 270,
        zIndex: 300,
        background: "rgba(7,9,20,0.98)",
        border: `1px solid ${isAlert ? "#ef444450" : color + "40"}`,
        borderRadius: 14,
        padding: "14px 16px",
        backdropFilter: "blur(20px)",
        boxShadow: `0 12px 48px rgba(0,0,0,0.7), 0 0 0 1px ${color}18`,
        color: "#e2e8f0",
        fontSize: 12,
        lineHeight: 1.55,
        pointerEvents: "auto",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
        <div
          style={{
            width: 9, height: 9, borderRadius: "50%", flexShrink: 0, marginTop: 3,
            background: isAlert ? "#ef4444" : color,
            boxShadow: `0 0 8px ${isAlert ? "#ef4444" : color}aa`,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: isAlert ? "#ef4444" : color, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {isAlert ? "🔥 " : ""}{node.name}
          </div>
          <div style={{ color: "#475569", fontSize: 10, marginTop: 1 }}>{TYPE_LABEL[node.type]}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>
      </div>

      {/* File path */}
      <div style={{ color: "#1e293b", fontSize: 10, marginBottom: 10, wordBreak: "break-all", borderLeft: `2px solid ${color}40`, paddingLeft: 7 }}>
        {node.path}
      </div>

      {/* Metrics strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 10 }}>
        {[
          { label: "Complexity", val: node.complexity },
          // Same numbers as the Blast Radius section below (upstream/downstream
          // resolved edges), not the raw import-statement count — that also includes
          // third-party packages and was showing a different, contradictory number
          // right next to this one under the same "imports" label.
          { label: "Imports ↑", val: upstream.length },
          { label: "Inbound ↓", val: downstream.length },
        ].map(({ label, val }) => (
          <div key={label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "6px 0", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>{val}</div>
            <div style={{ fontSize: 8, color: "#334155", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Blast radius */}
      <div style={{ display: "flex", gap: 6, marginBottom: upstream.length + downstream.length > 0 ? 10 : 0 }}>
        <div style={{ flex: 1, background: "rgba(59,130,246,0.07)", borderRadius: 8, padding: "7px 9px", borderLeft: "2px solid #3b82f6" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6", marginBottom: 3 }}>↑ {upstream.length} imports</div>
          {upstream.slice(0, 4).map((id) => (
            <div key={id} style={{ fontSize: 10, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nameOf(id)}</div>
          ))}
          {upstream.length > 4 && <div style={{ fontSize: 9, color: "#1e293b" }}>+{upstream.length - 4} more</div>}
          {upstream.length === 0 && <div style={{ fontSize: 10, color: "#1e293b" }}>no dependencies</div>}
        </div>
        <div style={{ flex: 1, background: "rgba(239,68,68,0.07)", borderRadius: 8, padding: "7px 9px", borderLeft: "2px solid #ef4444" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", marginBottom: 3 }}>↓ {downstream.length} used by</div>
          {downstream.slice(0, 4).map((id) => (
            <div key={id} style={{ fontSize: 10, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nameOf(id)}</div>
          ))}
          {downstream.length > 4 && <div style={{ fontSize: 9, color: "#1e293b" }}>+{downstream.length - 4} more</div>}
          {downstream.length === 0 && <div style={{ fontSize: 10, color: "#1e293b" }}>safe to change alone</div>}
        </div>
      </div>

      {/* Stress */}
      {(rfData.stressScore as number) > 0 && (
        <div style={{ background: isAlert ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.07)", border: `1px solid ${isAlert ? "#ef444430" : "#f59e0b25"}`, borderRadius: 8, padding: "7px 10px", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, color: isAlert ? "#fca5a5" : "#fcd34d", fontSize: 11 }}>
            Stress score: {((rfData.stressScore as number) * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
            Coupling {((rfData.coupling as number ?? 0) * 100).toFixed(0)}% · Density {((rfData.density as number ?? 0) * 100).toFixed(0)}% · Churn {((rfData.volatility as number ?? 0) * 100).toFixed(0)}%
          </div>
        </div>
      )}

      {/* Explanation */}
      {typeof rfData.explanation === "string" && rfData.explanation && (
        <div style={{ color: "#64748b", fontSize: 11, borderLeft: `2px solid ${color}40`, paddingLeft: 7, fontStyle: "italic" }}>
          {rfData.explanation}
        </div>
      )}
    </div>
  );
}

// ── Zoom controls ─────────────────────────────────────────────────────────────

function ZoomControls({ scale, onIn, onOut, onFit }: { scale: number; onIn: () => void; onOut: () => void; onFit: () => void }) {
  const s: React.CSSProperties = {
    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 8, color: "#94a3b8", cursor: "pointer", fontSize: 17, fontWeight: 700,
    transition: "background 0.15s", userSelect: "none",
  };
  return (
    <div style={{ position: "absolute", bottom: 14, right: 14, zIndex: 200, display: "flex", flexDirection: "column", gap: 4, background: "rgba(7,9,20,0.92)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 8, backdropFilter: "blur(12px)" }}>
      <button style={s} onClick={onIn}>+</button>
      <div style={{ fontSize: 9, color: "#334155", textAlign: "center", fontFamily: "monospace" }}>{(scale * 100).toFixed(0)}%</div>
      <button style={s} onClick={onOut}>−</button>
      <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "2px 0" }} />
      <button style={{ ...s, fontSize: 13 }} onClick={onFit} title="Fit all">⊡</button>
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────

const LEGEND: FileNodeType[] = ["page", "component", "hook", "api", "action", "lib", "data", "schema", "config", "other"];

function Legend() {
  return (
    <div style={{ position: "absolute", bottom: 14, left: 14, zIndex: 200, background: "rgba(7,9,20,0.92)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 14px", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6366f1", fontWeight: 700, marginBottom: 2 }}>DAG · Hierarchical</div>
      {LEGEND.map((t) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: TYPE_COLOR[t], boxShadow: `0 0 4px ${TYPE_COLOR[t]}99`, flexShrink: 0 }} />
          <span style={{ fontSize: 9, color: "#475569" }}>{TYPE_LABEL[t]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (filePath: string, language: string) => void;
}

export default function ConstellationGraph({ nodes: rfNodes, edges: rfEdges, onNodeClick }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [viewportH, setViewportH] = useState(600);
  const {
    t, setT, isDragging,
    onMouseDown, onMouseMove, onMouseUp,
    fitToView: fitZoomPan, zoomIn, zoomOut,
  } = useZoomPan();

  // Measure viewport height once on mount
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const { height } = el.getBoundingClientRect();
    if (height > 0) setViewportH(height);
  }, []);

  // Adapt ReactFlow data
  const fileNodes = useMemo(() => adaptNodes(rfNodes), [rfNodes]);
  const graphEdges = useMemo(() => adaptEdges(rfEdges), [rfEdges]);
  const visibleIds = useMemo(() => new Set(fileNodes.map((n) => n.id)), [fileNodes]);
  const visibleEdges = useMemo(() => graphEdges.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to)), [graphEdges, visibleIds]);

  // Compute layout with adaptive wrapping
  const { positions, graphWidth, graphHeight } = useMemo(
    () => computeLayers(fileNodes, visibleEdges, viewportH),
    [fileNodes, visibleEdges, viewportH]
  );

  // Fit to view
  const fitToView = useCallback(() => {
    const el = viewportRef.current;
    if (!el || graphWidth === 0 || graphHeight === 0) return;
    const { width, height } = el.getBoundingClientRect();
    fitZoomPan(graphWidth, graphHeight, width, height);
  }, [graphWidth, graphHeight, fitZoomPan]);

  // Auto-fit when nodes change
  useEffect(() => { fitToView(); }, [fileNodes.length, fitToView]);

  // ── Native wheel listener — scoped to canvas only, { passive: false } ──────
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      setT((prev) => {
        const factor = e.deltaY < 0 ? 1.08 : 0.93;
        const scale = Math.min(3, Math.max(0.1, prev.scale * factor));
        const x = cx - (cx - prev.x) * (scale / prev.scale);
        const y = cy - (cy - prev.y) * (scale / prev.scale);
        return { x, y, scale };
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [setT]);

  // ── Hover (blast radius preview) ──────────────────────────────────────────
  const upstream = useMemo(
    () => (hovered ? visibleEdges.filter((e) => e.from === hovered).map((e) => e.to) : []),
    [hovered, visibleEdges]
  );
  const downstream = useMemo(
    () => (hovered ? visibleEdges.filter((e) => e.to === hovered).map((e) => e.from) : []),
    [hovered, visibleEdges]
  );

  const rfById = useMemo(() => { const m = new Map<string, Node>(); rfNodes.forEach((n) => m.set(n.id, n)); return m; }, [rfNodes]);
  const nodeById = useMemo(() => { const m = new Map<string, FileNode>(); fileNodes.forEach((n) => m.set(n.id, n)); return m; }, [fileNodes]);

  // The blast panel sits away from the node (top-right), so the cursor has to cross
  // open canvas to reach it — a plain onMouseLeave would hide the panel mid-transit.
  // A short grace-period timeout, cancelled by re-entering either the node or the
  // panel itself, keeps it up long enough to actually get there.
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearHoverTimeout = useCallback(() => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
  }, []);
  useEffect(() => clearHoverTimeout, [clearHoverTimeout]);

  const handleNodeEnter = useCallback((nodeId: string) => {
    clearHoverTimeout();
    setHovered(nodeId);
  }, [clearHoverTimeout]);

  const scheduleHoverClear = useCallback(() => {
    clearHoverTimeout();
    hoverTimeout.current = setTimeout(() => setHovered(null), 150);
  }, [clearHoverTimeout]);

  const handleClick = useCallback((nodeId: string) => {
    if (!onNodeClick) return;
    const d = rfById.get(nodeId)?.data as Record<string, unknown> | undefined;
    onNodeClick((d?.filePath as string) ?? nodeId, (d?.language as string) ?? "");
  }, [onNodeClick, rfById]);

  const blastData = useMemo((): BlastData | null => {
    if (!hovered) return null;
    const node = nodeById.get(hovered);
    if (!node) return null;
    const rfData = (rfById.get(hovered)?.data ?? {}) as Record<string, unknown>;
    return { node, rfData, upstream, downstream, allNodes: nodeById };
  }, [hovered, nodeById, rfById, upstream, downstream]);

  if (fileNodes.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#334155", fontSize: 13 }}>
        No visible nodes
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{
        position: "relative", width: "100%", height: "100%", overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab", userSelect: "none",
        // Contains the Legend/ZoomControls/BlastPanel's internal z-index (200-300) to
        // this element's own stacking context. Without this, those values compete
        // directly against sibling overlays elsewhere on the page (e.g. FileExplainSheet's
        // fixed inset-0 at z-50) in the page's global stacking order and win, bleeding
        // through on top of an overlay that's supposed to cover the whole graph.
        isolation: "isolate",
      }}
    >
      {/* Transform layer — zoom + pan */}
      <div style={{ position: "absolute", top: 0, left: 0, transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`, transformOrigin: "0 0", width: graphWidth, height: graphHeight }}>

        {/* SVG edges */}
        <svg width={graphWidth} height={graphHeight} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", overflow: "visible" }}>
          <defs>
            <marker id="ag-n" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#1e293b" /></marker>
            <marker id="ag-u" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#3b82f6" /></marker>
            <marker id="ag-d" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#ef4444" /></marker>
          </defs>
          {visibleEdges.map((e, i) => {
            const a = positions.get(e.from);
            const b = positions.get(e.to);
            if (!a || !b) return null;
            const isUp   = hovered === e.from;
            const isDown = hovered === e.to;
            const hi = isUp || isDown;
            const stroke  = !hovered ? "#1e293b" : isUp ? "#3b82f6" : isDown ? "#ef4444" : "#0f172a";
            const opacity = !hovered ? 0.55 : hi ? 1 : 0.04;
            const x1 = a.x + 160, y1 = a.y + 28;
            const x2 = b.x,       y2 = b.y + 28;
            const cx = (x1 + x2) / 2;
            const d = `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
            const fromName = nodeById.get(e.from)?.name ?? e.from.split("/").pop() ?? e.from;
            const toName = nodeById.get(e.to)?.name ?? e.to.split("/").pop() ?? e.to;
            return (
              <g key={i}>
                {/* Wide invisible hit-area — the visible stroke below is too thin (1-2px)
                    to hover reliably; this carries the tooltip instead. */}
                <path d={d} fill="none" stroke="transparent" strokeWidth={12} pointerEvents="stroke">
                  <title>{`${fromName} imports ${toName}`}</title>
                </path>
                <path d={d}
                  fill="none" stroke={stroke} strokeWidth={hi ? 2 : 1} opacity={opacity}
                  markerEnd={hi ? `url(#ag-${isUp ? "u" : "d"})` : "url(#ag-n)"} />
              </g>
            );
          })}
        </svg>

        {/* Node cards */}
        {fileNodes.map((n) => {
          const pos = positions.get(n.id);
          if (!pos) return null;
          const isHovered = hovered === n.id;
          const isUp   = upstream.includes(n.id);
          const isDown = downstream.includes(n.id);
          const isDim  = !!hovered && !isHovered && !isUp && !isDown;
          const color  = TYPE_COLOR[n.type];
          const isAlert = (rfById.get(n.id)?.data as Record<string, unknown>)?.redAlert === true;

          return (
            <div
              key={n.id}
              onClick={(e) => { e.stopPropagation(); handleClick(n.id); }}
              onMouseEnter={() => handleNodeEnter(n.id)}
              onMouseLeave={scheduleHoverClear}
              style={{
                position: "absolute", left: pos.x, top: pos.y, width: 160, padding: "8px 11px",
                border: `1.5px solid ${isHovered ? "#fff" : isUp ? "#3b82f6" : isDown ? "#ef4444" : isAlert ? "#ef444450" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 10, background: isHovered ? "rgba(255,255,255,0.06)" : "rgba(7,9,20,0.88)",
                cursor: "pointer", opacity: isDim ? 0.12 : 1,
                transition: "opacity 0.12s, border-color 0.12s, box-shadow 0.12s",
                boxShadow: isHovered || isUp || isDown ? `0 0 0 1px ${color}28, 0 4px 20px ${color}14` : "none",
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: isAlert ? "#ef4444" : color, marginBottom: 5, boxShadow: `0 0 5px ${isAlert ? "#ef4444" : color}99` }} />
              <div style={{ fontSize: 11, fontFamily: "monospace", color: isDim ? "#1e293b" : isHovered ? "#f8fafc" : "#94a3b8", fontWeight: isHovered ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {isAlert ? "🔥 " : ""}{n.name}
              </div>
              <div style={{ fontSize: 9, color: isDim ? "#1e293b" : color + "80", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {TYPE_LABEL[n.type]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overlays — outside transform so they don't zoom */}

      {/* Blast radius panel — shown on hover; stays up while the cursor is over it too */}
      {blastData && (
        <BlastPanel
          data={blastData}
          onClose={() => { clearHoverTimeout(); setHovered(null); }}
          onMouseEnter={clearHoverTimeout}
          onMouseLeave={scheduleHoverClear}
        />
      )}

      {/* Zoom controls */}
      <ZoomControls
        scale={t.scale}
        onIn={zoomIn}
        onOut={zoomOut}
        onFit={fitToView}
      />

      {/* Legend */}
      <Legend />
    </div>
  );
}
