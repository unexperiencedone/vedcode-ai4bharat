"use client";

import { Play, Copy, Download, Trash2, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ControlPanelProps {
  language: string;
  setLanguage: (lang: string) => void;
  detectedLanguage?: string;
  runCode: () => void;
  isLoading: boolean;
  code: string;
  setCode: (code: string) => void;
}

const LANGUAGES = [
  { id: "auto", label: "Auto-Detect" },
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
];

export default function ControlPanel({
  language,
  setLanguage,
  runCode,
  isLoading,
  code,
  setCode,
  detectedLanguage,
}: ControlPanelProps) {
  const handleCopy = () => navigator.clipboard.writeText(code);

  const handleDownload = () => {
    const activeLang = language === "auto" ? detectedLanguage : language;
    const extMap: Record<string, string> = {
      python: "py",
      javascript: "js",
      rust: "rs",
      cpp: "cpp",
      java: "java",
      c: "c",
      go: "go",
    };
    const ext = extMap[activeLang ?? ""] ?? activeLang ?? "txt";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
    a.download = `main.${ext}`;
    a.click();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm">
      {/* Language selector */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-muted-foreground hidden sm:block">
          Language
        </label>
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="appearance-none rounded-md border border-border bg-background px-3 py-1.5 pr-7 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer transition-colors"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
                {lang.id === "auto" && detectedLanguage && language === "auto"
                  ? ` (${detectedLanguage})`
                  : ""}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleCopy}
          title="Copy code"
          className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
        >
          <Copy className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Copy</span>
        </button>

        <button
          onClick={handleDownload}
          title="Download file"
          className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Download</span>
        </button>

        <button
          onClick={() => setCode("")}
          title="Clear editor"
          className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>

        <button
          onClick={runCode}
          disabled={isLoading}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-semibold text-white transition-all shadow-sm",
            isLoading
              ? "bg-primary/50 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90 active:scale-[0.97]"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Running…
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" fill="currentColor" />
              Run
            </>
          )}
        </button>
      </div>
    </div>
  );
}
