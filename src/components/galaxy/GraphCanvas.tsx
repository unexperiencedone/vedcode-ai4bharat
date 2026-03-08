"use client";

import { useMemo, useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ConstellationNode } from "./ConstellationNode";
import type { ConstellationStats } from "@/lib/constellation/cache";

const nodeTypes: NodeTypes = {
  constellation: ConstellationNode,
};

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  stats: ConstellationStats | null;
  onNodeClick?: (filePath: string, language: string) => void;
}

export function GraphCanvas({
  nodes: initialNodes,
  edges: initialEdges,
  stats,
  onNodeClick,
}: GraphCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Filter & Control States
  const [luminosityFilter, setLuminosityFilter] = useState(0);
  const [gravityMultiplier, setGravityMultiplier] = useState(1);

  // Sync when parent passes new data or controls change
  useEffect(() => {
    // Apply filters and multipliers to initial nodes
    const processedNodes = initialNodes.map((n) => {
      const isVisible = ((n.data as any).luminosity ?? 1) >= luminosityFilter;
      const baseSize = ((n.data as any).baseSize ||
        (n.data as any).size ||
        20) as number;

      return {
        ...n,
        hidden: !isVisible,
        data: {
          ...n.data,
          baseSize, // preserve original size
          size: baseSize * gravityMultiplier,
        },
      };
    });

    setNodes(processedNodes);
  }, [initialNodes, setNodes, luminosityFilter, gravityMultiplier]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const nodeColor = useCallback((node: Node) => {
    const color = (node.data as Record<string, unknown>)?.color;
    return typeof color === "string" ? color : "#6b7280";
  }, []);

  const solarSystemCount = useMemo(
    () => stats?.solarSystems?.length ?? 0,
    [stats],
  );

  return (
    <div className="w-full h-full min-h-[600px] border border-border/50 rounded-xl overflow-hidden bg-background relative">
      {/* Stats bar */}
      {stats && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-3 flex-wrap">
          <div className="bg-card/80 backdrop-blur border border-border/50 rounded-lg px-3 py-1.5 text-xs text-muted-foreground flex gap-3">
            <span className="text-foreground font-semibold">{stats.repo}</span>
            <span>·</span>
            <span>{stats.fileCount} files</span>
            <span>·</span>
            <span>{stats.edgeCount} imports</span>
            <span>·</span>
            <span>{solarSystemCount} solar systems</span>
          </div>
          {stats.mostComplex && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs text-amber-400">
              ⚡ Most complex: <strong>{stats.mostComplex}</strong>
            </div>
          )}
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={
          onNodeClick
            ? (_e: React.MouseEvent, node: Node) => {
                const d = node.data as Record<string, unknown>;
                const fp = d.filePath as string;
                const lang = (d.language as string) ?? "";
                if (fp) onNodeClick(fp, lang);
              }
            : undefined
        }
        fitView
        fitViewOptions={{ padding: 0.15 }}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        minZoom={0.05}
        maxZoom={4}
      >
        <Controls className="bg-background text-foreground border-border/50" />
        <MiniMap
          nodeColor={nodeColor}
          maskColor="rgba(0, 0, 0, 0.6)"
          className="bg-card border-border/50"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="rgba(255,255,255,0.04)"
        />
      </ReactFlow>

      {/* Constellation Controls Panel */}
      <div className="absolute bottom-6 right-6 z-10 bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl w-64 text-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 border-b border-white/10 pb-2">
          Constellation Controls
        </h3>

        <div className="space-y-5">
          {/* Luminosity Filter */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Luminosity Filter</span>
              <span className="font-mono text-indigo-300">
                {luminosityFilter.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.1"
              value={luminosityFilter}
              onChange={(e) => setLuminosityFilter(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-widest">
              <span>All Files</span>
              <span>Hubs Only</span>
            </div>
          </div>

          {/* Gravity Multiplier (Node Size Scale) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Gravity Scale</span>
              <span className="font-mono text-indigo-300">
                {gravityMultiplier.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={gravityMultiplier}
              onChange={(e) => setGravityMultiplier(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-500 uppercase tracking-widest">
              <span>Min</span>
              <span>Max</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip CSS */}
      <style>{`
                .react-flow__node-constellation .constellation-tooltip {
                    display: none;
                }
                .react-flow__node-constellation:hover .constellation-tooltip {
                    display: block;
                }
            `}</style>
    </div>
  );
}
