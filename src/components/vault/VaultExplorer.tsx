"use client";
import { useState, useEffect } from "react";
import { Search, Code2, User, Calendar, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface Snippet {
  id: number;
  title: string;
  code: string;
  language: string;
  difficulty: string | null;
  authorName: string | null;
  createdAt: string | null;
}

export default function VaultExplorer({ initialSnippets }: { initialSnippets: Snippet[] }) {
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(initialSnippets[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/vault/search?q=${searchQuery}`);
        if (res.ok) {
          const data = await res.json();
          setSnippets(data);
          if (!selectedSnippet && data.length > 0) {
            setSelectedSnippet(data[0]);
          }
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="flex flex-1 overflow-hidden border-t border-white/10 h-full">
      {/* List Column */}
      <aside className="w-1/3 min-w-[300px] border-r border-white/10 flex flex-col bg-background/50 backdrop-blur-sm">
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="System Query..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors font-mono"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
             <div className="p-8 text-center text-muted-foreground text-xs font-mono animate-pulse">Scanning database...</div>
          ) : snippets.length === 0 ? (
             <div className="p-8 text-center text-muted-foreground text-xs font-mono">No intelligence found.</div>
          ) : (
            snippets.map((s) => (
              <button 
                key={s.id}
                onClick={() => setSelectedSnippet(s)}
                className={cn(
                  "w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-all group relative",
                  selectedSnippet?.id === s.id ? "bg-primary/5 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-mono text-primary/80 uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded">
                    {s.language}
                  </span>
                  {selectedSnippet?.id === s.id && (
                     <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                <h4 className={cn(
                  "text-sm font-bold truncate transition-colors",
                  selectedSnippet?.id === s.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {s.title}
                </h4>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground/50">
                    <User className="w-3 h-3" />
                    <span>{s.authorName || "Unknown"}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Detail Column */}
      {selectedSnippet ? (
        <main className="flex-1 bg-black/40 flex flex-col overflow-hidden relative">
           {/* Background Grid */}
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="p-8 pb-4 border-b border-white/10 flex justify-between items-start z-10 bg-background/20 backdrop-blur-md">
            <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground mb-2 flex items-center gap-3">
                    {selectedSnippet.title}
                    <span className="text-xs font-normal font-mono text-muted-foreground border border-white/10 px-2 py-0.5 rounded-full bg-white/5">
                        ID: {selectedSnippet.id.toString().padStart(4, '0')}
                    </span>
                </h2>
                <div className="flex items-center gap-6 text-xs text-muted-foreground font-mono">
                    <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span>{selectedSnippet.authorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{selectedSnippet.createdAt ? new Date(selectedSnippet.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
                <span className={cn(
                    "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border",
                    selectedSnippet.difficulty === "Core" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                    selectedSnippet.difficulty === "Expert" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                )}>
                    {selectedSnippet.difficulty || "Standard"}
                </span>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Shield className="w-3 h-3" /> VERIFIED
                </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 relative z-10">
            {/* Code Block */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-[#0d0d0d] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">{selectedSnippet.language}</span>
                    </div>
                    <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed custom-scrollbar">
                        <code className="text-foreground/90 whitespace-pre">{selectedSnippet.code}</code>
                    </pre>
                </div>
            </div>
            
            <div className="mt-8 max-w-2xl">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-4 flex items-center gap-2">
                    <Code2 className="w-4 h-4" /> Technical Narrative
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                    This snippet is a critical component of the system architecture. It was indexed by 
                    <strong className="text-primary"> {selectedSnippet.authorName}</strong> to ensure knowledge continuity 
                    across Cluster 2. The logic implementation follows strict type-safety protocols designated by the Core Team.
                </p>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 bg-black/40 flex items-center justify-center p-8 text-center">
            <div className="max-w-md">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Code2 className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Vault Intelligence</h3>
                <p className="text-muted-foreground text-sm">Select a neural node from the sidebar to inspect its code logic and metadata.</p>
            </div>
        </main>
      )}
    </div>
  );
}
