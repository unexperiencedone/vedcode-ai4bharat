"use client";

import { useState } from "react";
import { GuardSummary } from "@/components/guard/GuardSummary";
import { ImpactList } from "@/components/guard/ImpactList";

export default function GuardPage() {
  const [data, setData] = useState<{ summary: any, impacts: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/guard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileDiff: "mock-diff" })
      });
      const json = await res.json();
      setData(json);
    } catch(e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-8 lg:p-12 flex flex-col pt-16 mt-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Context Guard
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Pre-execution impact agent. Review the ripple effects of your recent changes before committing or deploying.
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <button 
            onClick={handleScan}
            disabled={isLoading}
            className="px-4 py-2 border border-border/50 bg-card hover:bg-muted/50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? "Scanning..." : "Rescan Codebase"}
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="w-full h-64 flex flex-col items-center justify-center border border-border/50 bg-card/50 rounded-xl animate-pulse">
           <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4"></div>
           <p className="text-muted-foreground animate-pulse">Running AST dependency tracing...</p>
        </div>
      ) : data ? (
        <>
          <GuardSummary changes={data.summary.changesDetected} impacts={data.summary.rippleImpacts} />
          <ImpactList impacts={data.impacts} />
        </>
      ) : (
        <div className="w-full flex flex-col items-center justify-center py-24 text-muted-foreground border border-dashed border-border/50 rounded-xl">
          <p>No scans performed yet.</p>
          <button onClick={handleScan} className="mt-4 text-primary hover:underline">Run Initial Scan</button>
        </div>
      )}
      
    </div>
  );
}
