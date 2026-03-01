"use client";

import * as React from "react";
import { Heart, Copy, Split, Download, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function VaultPage() {
  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 flex flex-col lg:flex-row h-full relative overflow-hidden">
        {/* Left Pane: Code Editor */}
        <section className="flex-1 h-1/2 lg:h-full lg:w-3/5 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center relative flex flex-col group/editor">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />

          <div className="relative z-10 flex-1 p-6 lg:p-10 flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-xs font-mono font-medium flex items-center gap-1">
                  Python 3.11
                </span>
                <span className="text-xs text-muted-foreground">
                  pathfinding.py
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ActionIcon icon={Copy} tooltip="Copy" />
                <ActionIcon icon={Split} tooltip="Fork" />
                <ActionIcon icon={Download} tooltip="Download" />
              </div>
            </div>

            {/* Code Block */}
            <div className="bg-background/60 backdrop-blur-md rounded-xl flex-1 overflow-hidden flex flex-col shadow-2xl ring-1 ring-white/5 font-mono text-sm leading-relaxed border border-primary/10">
              <div className="h-full overflow-auto p-6 transition-colors duration-500 group-hover/editor:bg-white/[0.02]">
                <pre className="text-sm">
                  <code>{`import heapq

class Graph:
    def __init__(self):
        self.nodes = set()
        self.edges = {}
        self.distances = {}

    def add_node(self, value):
        self.nodes.add(value)

    def add_edge(self, from_node, to_node, distance):
        self.edges.setdefault(from_node, []).append(to_node)
        self.distances[(from_node, to_node)] = distance

def dijkstra(graph, initial):
    # Priority queue to store visited nodes
    visited = {initial: 0}
    path = {}
    nodes = set(graph.nodes)
    
    # Using min-heap for optimization O(V log V)
    pq = [(0, initial)]
    
    while nodes and pq:
        (current_dist, current_node) = heapq.heappop(pq)
        
        if current_node not in nodes:
            continue
            
        nodes.remove(current_node)
        
        for neighbor in graph.edges.get(current_node, []):
            new_distance = current_dist + graph.distances[(current_node, neighbor)]
            
            if neighbor not in visited or new_distance < visited[neighbor]:
                visited[neighbor] = new_distance
                heapq.heappush(pq, (new_distance, neighbor))
                path[neighbor] = current_node
                
    return visited, path`}</code>
                </pre>
              </div>
              <div className="h-8 bg-muted/30 border-t border-white/5 flex items-center px-4 text-xs text-muted-foreground justify-between">
                <div className="flex gap-4 font-mono">
                  <span>Ln 24, Col 12</span>
                  <span>UTF-8</span>
                  <span className="text-primary/60">4 spaces</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  <span className="text-[10px] font-bold tracking-tight">
                    VERIFIED
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Pane: Documentation */}
        <section className="flex-1 h-1/2 lg:h-full lg:w-2/5 bg-background border-t lg:border-t-0 lg:border-l border-border/10 overflow-y-auto custom-scrollbar">
          <div className="p-8 lg:p-10 max-w-3xl mx-auto w-full">
            <div className="flex items-start justify-between mb-8">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-white/5 border-white/10 hover:bg-white/10"
                >
                  Algorithm
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-white/5 border-white/10 hover:bg-white/10"
                >
                  Graph Theory
                </Badge>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                  Optimized
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    Last Sync
                  </div>
                  <div className="text-xs font-medium">2 hours ago</div>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 p-0.5">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-[10px] font-bold">
                    K
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-4 tracking-tight">
              Dijkstra&apos;s Shortest Path
            </h1>
            <p className="text-muted-foreground/60 text-lg leading-relaxed mb-8 font-light">
              A highly optimized implementation of Dijkstra&apos;s algorithm
              using a binary heap priority queue. This function finds the
              shortest paths between nodes in a graph.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <StatBox label="Time Complexity" value="O(E + V log V)" />
              <StatBox label="Space Complexity" value="O(V)" />
            </div>

            <Separator className="my-10 opacity-5" />

            <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary mb-6">
              Protocol Usage
            </h3>
            <div className="bg-muted/20 backdrop-blur-sm rounded-xl p-6 mb-10 border border-white/5 font-mono text-xs text-muted-foreground/80 leading-loose group/usage relative">
              <div className="absolute top-4 right-4 opacity-0 group-hover/usage:opacity-100 transition-opacity">
                <Copy className="w-3.5 h-3.5 cursor-pointer hover:text-primary" />
              </div>
              <span className="text-emerald-400">g = Graph()</span>
              <br />
              g.add_node(<span className="text-amber-300">&apos;A&apos;</span>)
              <br />
              <span className="text-muted-foreground/40"># ... add edges</span>
              <br />
              <span className="text-primary">visited, path</span> = dijkstra(g,{" "}
              <span className="text-amber-300">&apos;A&apos;</span>)
            </div>

            <div className="p-8 border border-white/5 rounded-2xl bg-white/[0.02] flex flex-col items-center justify-center text-center">
              <Terminal className="text-white/10 mb-4" size={32} />
              <h3 className="text-white/20 font-mono text-[10px] uppercase tracking-[0.2em]">
                Runtime Analysis Ingesting...
              </h3>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

interface ActionIconProps {
  icon: React.ElementType;
  tooltip: string;
}

function ActionIcon({ icon: Icon, tooltip }: ActionIconProps) {
  return (
    <button
      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
      title={tooltip}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-xl group hover:border-primary/20 transition-colors">
      <div className="text-primary text-[10px] uppercase tracking-[0.2em] font-bold mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
        {label}
      </div>
      <div className="font-mono text-sm font-medium text-white/80">{value}</div>
    </div>
  );
}
