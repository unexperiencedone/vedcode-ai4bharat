"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface KnowledgeMapProps {
  technologySlug?: string;
  onNodeClick?: (slug: string, techSlug: string) => void;
}

export function KnowledgeMap({
  technologySlug,
  onNodeClick,
}: KnowledgeMapProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const url = technologySlug
          ? `/api/knowledge-graph?tech=${technologySlug}`
          : "/api/knowledge-graph";
        const res = await fetch(url);
        const data = await res.json();

        // Distribute nodes in a circle for initial layout
        const rad = 250;
        const numNodes = data.nodes.length;
        const mappedNodes = data.nodes.map((n: any, i: number) => {
          const angle = (i / numNodes) * 2 * Math.PI;
          return {
            ...n,
            position: {
              x: numNodes > 1 ? 400 + rad * Math.cos(angle) : 400,
              y: numNodes > 1 ? 300 + rad * Math.sin(angle) : 300,
            },
            style: {
              backgroundColor: "#0f172a",
              color: "#f8fafc",
              border: "1px solid #334155",
              borderRadius: "6px",
              padding: "12px",
              boxShadow:
                "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            },
          };
        });

        setNodes(mappedNodes);
        setEdges(data.edges);
      } catch (err) {
        console.error("Failed to load knowledge map", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [technologySlug, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (onNodeClick && node.data?.slug && node.data?.techSlug) {
      onNodeClick(node.data.slug as string, node.data.techSlug as string);
    } else if (node.data?.slug && node.data?.techSlug) {
      // Default behavior if no handler provided: navigate to handbook
      window.location.href = `/handbook/${node.data.techSlug}/${node.data.slug}`;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-t-2 border-indigo-500 animate-spin mb-4"></div>
          <p>Loading Knowledge Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "600px",
        backgroundColor: "#020617",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        colorMode="dark"
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Controls className="bg-slate-900 border-slate-700 fill-slate-300" />
        <MiniMap
          nodeStrokeColor={() => "#334155"}
          nodeColor={() => "#0f172a"}
          maskColor="rgba(2, 6, 23, 0.7)"
          className="bg-slate-900 border-slate-700"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
          color="#334155"
        />
      </ReactFlow>
    </div>
  );
}
