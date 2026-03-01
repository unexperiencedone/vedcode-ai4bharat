"use client";

import { useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  { 
    id: '1', 
    position: { x: 400, y: 300 }, 
    data: { label: 'app/layout.tsx' },
    style: { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#fff', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '8px', padding: '10px' }
  },
  { 
    id: '2', 
    position: { x: 300, y: 150 }, 
    data: { label: 'components/layout/Navbar.tsx' },
    style: { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#fff', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '8px', padding: '10px' }
  },
  { 
    id: '3', 
    position: { x: 500, y: 150 }, 
    data: { label: 'components/dashboard/DashboardView.tsx' },
    style: { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#fff', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '8px', padding: '10px' }
  },
  { 
    id: '4', 
    position: { x: 500, y: 450 }, 
    data: { label: 'lib/db/schema.ts' },
    style: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '8px', padding: '10px' }
  },
  { 
    id: '5', 
    position: { x: 650, y: 300 }, 
    data: { label: 'app/api/user/route.ts' },
    style: { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.5)', borderRadius: '8px', padding: '10px' }
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '2', target: '1', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e1-3', source: '3', target: '1', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e4-3', source: '4', target: '3', animated: true, style: { stroke: '#10b981' } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#10b981' } },
  { id: 'e5-3', source: '5', target: '3', animated: true, style: { stroke: '#f59e0b' } },
];

export function GraphCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGraph() {
      try {
        const res = await fetch("/api/explore");
        const data = await res.json();
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      } catch (e) {
        console.error("Failed to load graph data", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGraph();
  }, [setNodes, setEdges]);

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[600px] border border-border/50 rounded-xl flex items-center justify-center bg-card/50">
         <div className="flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
           <p className="text-sm tracking-widest text-muted-foreground uppercase">Parsing Workspace AST...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] border border-border/50 rounded-xl overflow-hidden bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Controls className="bg-background text-foreground border-border/50" />
        <MiniMap 
          nodeColor={(n) => {
            if (n.style?.color) return n.style.color as string;
            return '#fff';
          }}
          maskColor="rgba(0, 0, 0, 0.5)"
          className="bg-card border-border/50" 
        />
        <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="rgba(255,255,255,0.05)" />
      </ReactFlow>
    </div>
  );
}
