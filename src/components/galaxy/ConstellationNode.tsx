"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

interface ConstellationNodeData {
  label: string;
  filePath: string;
  luminosity: number;
  gravity: number;
  nodeType: "component" | "api" | "lib" | "schema" | "other";
  lineCount: number;
  importCount: number;
  exportCount: number;
  complexity: number;
  solarSystem: string;
  color: string;
  size: number;
  glowRadius: number;
  redAlert?: boolean;
  explanation?: string;
  stressScore?: number | null;
  coupling?: number | null;
  density?: number | null;
  volatility?: number | null;
  [key: string]: unknown;
}

const NODE_TYPE_LABELS: Record<string, string> = {
  component: "Component",
  api: "API Route",
  lib: "Library",
  schema: "Schema / DB",
  other: "Other",
};

function ConstellationNodeInner({ data }: NodeProps) {
  const d = data as ConstellationNodeData;
  const color = d.redAlert ? "#ef4444" : d.color;
  const glow = d.redAlert
    ? `0 0 ${d.glowRadius * 2}px #ef4444, 0 0 ${d.glowRadius * 3}px #ef444488`
    : `0 0 ${d.glowRadius}px ${color}88, 0 0 ${d.glowRadius / 2}px ${color}44`;

  const size = Math.max(d.size, 8);

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

      {/* Star dot */}
      <div
        title={d.filePath}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: glow,
          cursor: "pointer",
          position: "relative",
          transition: "box-shadow 0.2s ease",
        }}
      />

      {/* Tooltip card (visible on hover via CSS group) */}
      <div
        className="constellation-tooltip"
        style={{
          position: "absolute",
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%) translateY(-6px)",
          background: "rgba(10,10,20,0.92)",
          border: `1px solid ${color}66`,
          borderRadius: 8,
          padding: "8px 12px",
          minWidth: 200,
          fontSize: 11,
          lineHeight: 1.5,
          color: "#e2e8f0",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 999,
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ fontWeight: 700, color, marginBottom: 4, fontSize: 12 }}>
          {d.label} {d.redAlert ? "🔥" : ""}
        </div>
        {d.explanation && (
          <div
            style={{
              color: "#cbd5e1",
              marginBottom: 8,
              whiteSpace: "normal",
              maxWidth: 260,
              backgroundColor: "rgba(255,255,255,0.05)",
              padding: "6px 8px",
              borderRadius: 6,
              borderLeft: `2px solid ${color}`,
            }}
          >
            {d.explanation}
          </div>
        )}

        {d.stressScore != null && d.stressScore > 0 && (
          <div
            style={{
              backgroundColor: d.redAlert
                ? "rgba(239, 68, 68, 0.15)"
                : "rgba(245, 158, 11, 0.1)",
              border: `1px solid ${d.redAlert ? "rgba(239, 68, 68, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
              borderRadius: 4,
              padding: "6px",
              marginBottom: 8,
              color: d.redAlert ? "#fca5a5" : "#fcd34d",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              Architectural Stress: {(Number(d.stressScore) * 100).toFixed(0)}%
            </div>
            <div style={{ fontSize: 10, opacity: 0.9 }}>
              Coupling: {(Number(d.coupling) * 100).toFixed(0)}% | Density:{" "}
              {(Number(d.density) * 100).toFixed(0)}% | Changes:{" "}
              {(Number(d.volatility) * 100).toFixed(0)}%
            </div>
          </div>
        )}

        <div style={{ color: "#94a3b8", marginBottom: 6 }}>{d.filePath}</div>
        <div style={{ display: "flex", gap: 16, color: "#cbd5e1" }}>
          <span>⚡ Complexity: {d.complexity}</span>
          <span>⬆ Imps: {d.importCount}</span>
          <span>⬇ Inbound: {d.gravity}</span>
        </div>
        <div style={{ marginTop: 4, color: "#94a3b8" }}>
          <span>
            {d.lineCount} lines · {NODE_TYPE_LABELS[d.nodeType]}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
}

export const ConstellationNode = memo(ConstellationNodeInner);
