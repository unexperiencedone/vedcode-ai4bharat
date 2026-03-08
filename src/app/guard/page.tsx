"use client";

import { useState } from "react";
import { GuardSummary } from "@/components/guard/GuardSummary";
import { ImpactList } from "@/components/guard/ImpactList";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { GitBranch, AlertTriangle } from "lucide-react";

export default function GuardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [fileDiff, setFileDiff] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Persist last scan results across navigations
  const [data, setData] = useLocalStorage<{
    summary: any;
    impacts: any[];
  } | null>("vedcode_guard_scan", null);

  const handleScan = async () => {
    if (!fileDiff.trim()) {
      setError("Please paste a file diff or code snippet to analyze.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/guard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileDiff: fileDiff.trim() }),
      });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
      setError("Analysis failed. Please try again.");
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
            Pre-execution impact agent. Review the ripple effects of your recent
            changes before committing or deploying.
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
          <p className="text-muted-foreground animate-pulse">
            Running AST dependency tracing...
          </p>
        </div>
      ) : (
        <>
          {/* Diff Input */}
          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Paste your file diff or modified code snippet:
            </label>
            <textarea
              value={fileDiff}
              onChange={(e) => setFileDiff(e.target.value)}
              rows={10}
              className="w-full rounded-xl border border-border/50 bg-card/30 px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 resize-y transition-colors"
              placeholder={`Paste a git diff or file content here. Example:\n\n- export function getUser() { return db.users.find() }\n+ export async function getUser(id: string) { return await db.query.users.findFirst({ where: eq(users.id, id) }) }`}
            />
            {error && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
                <AlertTriangle size={14} />
                {error}
              </div>
            )}
            <button
              onClick={handleScan}
              disabled={isLoading || !fileDiff.trim()}
              className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GitBranch size={15} />
              Analyze Impact
            </button>
          </div>

          {data && (
            <>
              <GuardSummary
                changes={data.summary.changesDetected}
                impacts={data.summary.rippleImpacts}
              />
              <ImpactList impacts={data.impacts} />
            </>
          )}
        </>
      )}
    </div>
  );
}
