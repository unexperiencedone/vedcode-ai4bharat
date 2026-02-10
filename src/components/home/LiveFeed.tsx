"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

interface Log {
  id: string;
  action: string;
  cluster: number;
  author: string;
  target?: string;
  message?: string;
  timestamp: string;
}

export function LiveFeed() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/logs");
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    
    // Poll every 5 seconds for basic "live" feel
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 bg-black/20 overflow-hidden flex flex-col h-full border-l border-white/10">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Live Feed
          </h2>
        </div>
        <MoreHorizontal className="w-4 h-4 text-muted-foreground/40" />
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto font-mono text-[12px] p-6 space-y-4 no-scrollbar">
        {loading && logs.length === 0 ? (
           <div className="text-muted-foreground/50 italic p-4">Initializing connection to Cluster 1...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-4 group opacity-90 hover:opacity-100 transition-opacity animate-in fade-in slide-in-from-bottom-2 duration-500">
              <span className="text-muted-foreground/30 shrink-0 select-none">
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
              </span>
              <div className="text-muted-foreground/80 break-all">
                <EventTypeBadge type={log.action} />
                
                {log.target && (
                    <>
                        <span className="mx-1 text-muted-foreground/30">→</span>
                        <span className="text-foreground">{log.target}</span>
                    </>
                )}

                {log.message && (
                  <div className="mt-1 text-muted-foreground/50 pl-4 border-l border-white/10 italic">
                    &quot;{log.message}&quot;
                  </div>
                )}
                
                <div className="mt-1 text-[10px] text-muted-foreground/30">
                    by {log.author}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-black/40 flex-shrink-0">
        <div className="flex items-center gap-3 bg-white/5 rounded px-3 py-2 border border-white/5 focus-within:border-primary/50 transition-colors">
          <span className="text-muted-foreground/40 font-mono text-xs select-none">
            $
          </span>
          <input
            type="text"
            className="bg-transparent border-none p-0 text-xs font-mono text-primary focus:ring-0 w-full placeholder:text-muted-foreground/20"
            placeholder="System awaiting command..."
          />
        </div>
      </div>
    </div>
  );
}

function EventTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    COMMIT: "text-primary",
    JOINED: "text-emerald-400",
    QUERY: "text-amber-400",
    SYNC: "text-primary",
    ALERT: "text-rose-400",
    DEPLOY: "text-primary",
  };

  return <span className={cn("font-medium", colors[type] || "text-foreground")}>{type}</span>;
}
