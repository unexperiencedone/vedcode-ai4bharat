"use client";

import { useMemo, useCallback, useEffect } from "react";
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

  // Sync when parent passes new data (useNodesState only reads initial value on mount)
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);
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
