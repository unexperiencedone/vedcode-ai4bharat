"use client";

import * as React from "react";
import {
  Search,
  LayoutDashboard,
  FolderOpen,
  Heart,
  History,
  Settings,
  Copy,
  Split,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function VaultPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* Vault Header */}
      <header className="h-16 border-b border-border/10 flex items-center px-6 justify-between flex-shrink-0 bg-background/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 text-white">
              <span className="font-mono text-lg font-bold">V</span>
            </div>
            <span className="font-bold text-lg tracking-tight">The Vault</span>
          </div>
          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span>Collections</span>
            <span className="text-xs">/</span>
            <span>Algorithms</span>
            <span className="text-xs">/</span>
            <span className="text-foreground font-medium">
              Dijkstra Pathfinding
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative group hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <Input
              placeholder="Search snippets (Cmd+K)..."
              className="pl-10 w-64 bg-muted/50 border-transparent focus:border-primary transition-all rounded-lg"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="inline-flex items-center border border-border/20 rounded px-1.5 text-[10px] font-sans font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
          <div className="h-6 w-px bg-border/10" />
          <Button variant="ghost" className="rounded-full w-8 h-8 p-0">
            <img
              className="w-8 h-8 rounded-full border border-border/10"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuADqK7oEq3JxKs4PxcwuwHowLVD_39lD1UTghZ3CxOgaqzbFNcpGkrYvf2lH2QZdHidlfTaDvmyX0CGAiqVdip5yXJ3xIzoYNL6WaVF8c1isGsJsTtv5XRU3B7o5ahaUDG7l6IGU2tDKAdi7r5aQAoTdB2dneoDFS-XI1gtGYKSKa9CWwkuSCA8MMKdZY7iN4qpyskjeqGoznw37vEWac2v720gQwRznRChNcQh0eeYeLz22Wf1sDX2zilbYXZ5ZFE3E3qJA7mbUba0"
              alt="Avatar"
            />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Collapsed) */}
        <aside className="w-16 flex-shrink-0 border-r border-border/10 bg-muted/5 flex flex-col items-center py-6 gap-6 z-30">
          <SidebarIcon icon={LayoutDashboard} active />
          <SidebarIcon icon={FolderOpen} label="Collections" />
          <SidebarIcon icon={Heart} label="Favorites" />
          <SidebarIcon icon={History} label="History" />
          <div className="flex-1" />
          <SidebarIcon icon={Settings} />
        </aside>

        <main className="flex-1 flex flex-col lg:flex-row h-full relative">
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
                <div className="h-full overflow-auto p-6">
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
                  <div className="flex gap-4">
                    <span>Ln 24, Col 12</span>
                    <span>UTF-8</span>
                    <span>4 spaces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                    <span>Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Pane: Documentation */}
          <section className="flex-1 h-1/2 lg:h-full lg:w-2/5 bg-background border-t lg:border-t-0 lg:border-l border-border/10 overflow-y-auto">
            <div className="p-8 lg:p-10 max-w-3xl mx-auto w-full">
              <div className="flex items-start justify-between mb-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Algorithm</Badge>
                  <Badge variant="secondary">Graph Theory</Badge>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                    Optimized
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-muted-foreground">
                      Last edited
                    </div>
                    <div className="text-xs font-medium">2 hours ago</div>
                  </div>
                  <img
                    className="w-8 h-8 rounded-full border border-border/10"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAY7xFesJRn3Q4pqefsmenCtpU_VqVjOHmb--nlmzYFPnAIWD03CVIjz6QVKd0rdr6h29LGGdEQq2xwIcp0LDKMTK_gUEfIHmAOz7cOuqNP040hse8PjWQTp4YzOop2o_ahFtdYEHpzr93zN6RbyoKzFpMu5PCy57lxj9YH01-6_NBvA21VrKB4gC0RWI86D7CozPOWNJRK4iQ6tuGZRn7hj8be_VkhPV-OLIvz701vM-9KzCq8_Imn6vTmlXHuRjmJD2G7VfJsIfps"
                    alt="Editor"
                  />
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-4 tracking-tight">
                Dijkstra&apos;s Shortest Path
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 font-light">
                A highly optimized implementation of Dijkstra&apos;s algorithm
                using a binary heap priority queue. This function finds the
                shortest paths between nodes in a graph.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <StatBox label="Time Complexity" value="O(E + V log V)" />
                <StatBox label="Space Complexity" value="O(V)" />
              </div>

              <Separator className="my-8" />

              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Usage
              </h3>
              <div className="bg-muted/30 rounded-lg p-4 mb-8 border border-border/10 font-mono text-xs text-muted-foreground">
                <span className="text-foreground">g = Graph()</span>
                <br />
                g.add_node(&apos;A&apos;)
                <br />
                <span className="text-muted-foreground"># ... add edges</span>
                <br />
                <span className="text-primary">visited, path</span> =
                dijkstra(g, &apos;A&apos;)
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

interface SidebarIconProps {
  icon: React.ElementType;
  label?: string;
  active?: boolean;
}

function SidebarIcon({ icon: Icon, label, active }: SidebarIconProps) {
  return (
    <button
      className={cn(
        "p-2 rounded-lg transition-colors relative group",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="w-6 h-6" />
      {label && (
        <div className="absolute left-14 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </button>
  );
}

interface ActionIconProps {
  icon: React.ElementType;
  tooltip: string;
}

function ActionIcon({ icon: Icon, tooltip }: ActionIconProps) {
  return (
    <button
      className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
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
    <div className="p-4 rounded-lg bg-card border border-border/10">
      <div className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
        {label}
      </div>
      <div className="font-mono text-sm font-medium">{value}</div>
    </div>
  );
}
