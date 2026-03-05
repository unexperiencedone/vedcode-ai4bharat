"use client";

import { Loader2, CheckCircle, XCircle, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface OutputTerminalProps {
  output: any;
  isLoading: boolean;
  customInput: string;
  setCustomInput: (val: string) => void;
}

export default function OutputTerminal({
  output,
  isLoading,
  customInput,
  setCustomInput,
}: OutputTerminalProps) {
  const hasOutput = !!output;
  const isError = hasOutput && output.run?.code !== 0;
  const text = hasOutput
    ? isError
      ? output.run?.stderr || output.run?.output || "Execution failed."
      : output.run?.stdout || "Program completed with no output."
    : null;

  return (
    <div className="flex flex-col min-h-0 rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      {/* Panel header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 bg-card">
        <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Output</span>

        {hasOutput && !isLoading && (
          <div
            className={cn(
              "ml-auto flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide",
              isError ? "text-destructive" : "text-emerald-500"
            )}
          >
            {isError ? (
              <XCircle className="w-3 h-3" />
            ) : (
              <CheckCircle className="w-3 h-3" />
            )}
            {isError ? "Error" : "Success"}
          </div>
        )}

        {isLoading && (
          <Loader2 className="ml-auto w-3.5 h-3.5 animate-spin text-primary" />
        )}
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 overflow-y-auto custom-scrollbar">
        {/* Stdin input */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
            Stdin
          </label>
          <textarea
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Provide input for your program…"
            className="w-full h-20 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
          />
        </div>

        {/* Output area */}
        <div className="flex-1 flex flex-col">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
            Result
          </label>
          <div className="flex-1 min-h-[120px] rounded-md border border-border bg-background p-3 font-mono text-sm overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex h-full items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs">Executing…</span>
              </div>
            ) : text ? (
              <pre
                className={cn(
                  "whitespace-pre-wrap break-words text-sm leading-relaxed",
                  isError ? "text-red-400" : "text-emerald-400"
                )}
              >
                {text}
              </pre>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground/40 italic">
                Run your code to see output here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
