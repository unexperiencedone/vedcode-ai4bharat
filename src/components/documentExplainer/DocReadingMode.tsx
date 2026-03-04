"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import MermaidDiagram from "./MermaidDiagram";
import { highlightKeywords } from "./KeywordTooltip";


// Plugins for math and formatting
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  Loader2,
  FileText,
  Network,
  Code,
  Sparkles,
  AlertCircle,
  BookOpen,
  ChevronRight,
  Maximize2,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function DocReadingMode() {
  const [documentInput, setDocumentInput] = useState("");
  const [activeTab, setActiveTab] = useState<
    "read" | "diagram" | "code" | "guard"
  >("read");

  // Tab state
  const [mermaidCode, setMermaidCode] = useState<string>("");
  const [mermaidLoading, setMermaidLoading] = useState(false);
  const [mermaidError, setMermaidError] = useState<string>("");

  const [scenarios, setScenarios] = useState<string>("");
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [scenariosError, setScenariosError] = useState<string>("");

  const [impactSummary, setImpactSummary] = useState<string>("");
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactError, setImpactError] = useState<string>("");

  // Tab 1: Deep Insight — direct streaming state (no useChat)
  const [explanation, setExplanation] = useState<string>("");
  const [isReadingLoading, setIsReadingLoading] = useState(false);
  const [chatError, setChatError] = useState<string>("");

  // Shared keyword map for tooltip highlights (all tabs)
  const [keywords, setKeywords] = useState<Record<string, string>>({});
  const [keywordsLoading, setKeywordsLoading] = useState(false);


  const handleExplain = async () => {
    if (!documentInput.trim()) return;

    // Reset all tab state
    setExplanation("");
    setChatError("");
    setMermaidCode("");
    setMermaidError("");
    setScenarios("");
    setScenariosError("");
    setImpactSummary("");
    setImpactError("");
    setKeywords({});


    // ── Tab 1: Stream explanation directly via fetch (no useChat) ──
    setIsReadingLoading(true);
    fetch("/api/documentExplainer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentContent: documentInput }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res
            .json()
            .catch(() => ({ error: "Request failed" }));
          setChatError(err.error || "Request failed");
          return;
        }
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setExplanation(
            (prev) => prev + decoder.decode(value, { stream: true }),
          );
        }
      })
      .catch((err) => setChatError(err.message || "Stream failed"))
      .finally(() => setIsReadingLoading(false));

    // ── Tab 2: Knowledge Map ──
    setMermaidLoading(true);
    fetch("/api/documentVisualizer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentContent: documentInput }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.mermaidCode) setMermaidCode(data.mermaidCode);
        else setMermaidError(data.error || "Failed to generate diagram");
      })
      .catch((err) => setMermaidError(err.message))
      .finally(() => setMermaidLoading(false));

    // ── Tab 3: Creative Domains ──
    setScenariosLoading(true);
    fetch("/api/documentScenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentContent: documentInput }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.scenarios) setScenarios(data.scenarios);
        else setScenariosError(data.error || "Failed to generate scenarios");
      })
      .catch((err) => setScenariosError(err.message))
      .finally(() => setScenariosLoading(false));

    // ── Tab 4: Impact Guard ──
    setImpactLoading(true);
    fetch("/api/preflightCheck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filePath: "src/app/page.tsx",
        content: documentInput,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.impactSummary) setImpactSummary(data.impactSummary);
        else setImpactError(data.error || "Failed to analyze impact");
      })
      .catch((err) => setImpactError(err.message))
      .finally(() => setImpactLoading(false));

    // ── Keywords: run in parallel, non-blocking ──
    setKeywordsLoading(true);
    fetch("/api/documentKeywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentContent: documentInput }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.keywords) setKeywords(data.keywords);
      })
      .catch(() => {}) // Non-fatal
      .finally(() => setKeywordsLoading(false));
  };


  const isAnyLoading =
    isReadingLoading || mermaidLoading || scenariosLoading || impactLoading;
  const hasAnyContent =
    explanation || mermaidCode || scenarios || impactSummary;

  // Shared markdown component factory — injects keyword highlighting into all tabs
  const makeMarkdownComponents = (accentColor: string) => ({
    p: ({ children }: any) => (
      <p className="leading-[1.8] text-slate-300 mb-8">
        {React.Children.map(children, (child) =>
          typeof child === "string" ? highlightKeywords(child, keywords) : child
        )}
      </p>
    ),
    h2: ({ children }: any) => (
      <h2 className={`text-4xl font-bold text-white mt-16 mb-10 pb-6 border-b border-white/[0.05] tracking-tight`}>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-2xl font-semibold text-white mt-12 mb-6 tracking-tight flex items-center gap-3">
        <span className={`w-1 h-6 ${accentColor} rounded-full inline-block`} />
        {children}
      </h3>
    ),
    hr: () => <hr className="my-16 border-white/[0.05]" />,
    li: ({ children }: any) => (
      <li className="text-slate-300 mb-4 leading-relaxed">
        {React.Children.map(children, (child) =>
          typeof child === "string" ? highlightKeywords(child, keywords) : child
        )}
      </li>
    ),
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <CodeBlock
          language={match[1]}
          value={String(children).replace(/\n$/, "")}
        />
      ) : (
        <code
          className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-blue-500/20"
          {...props}
        >
          {children}
        </code>
      );
    },
  });


  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-100 overflow-hidden font-sans selection:bg-blue-500/30">
      {/* ── LEFT PANEL ── */}
      <div className="w-[400px] border-r border-slate-800/60 flex flex-col bg-slate-900/10 backdrop-blur-2xl z-10">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-blue-600/20 rounded-xl">
              <BookOpen className="text-blue-400" size={22} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              The Manuscript
            </h2>
          </div>
        </div>

        <div className="flex-1 px-8 pb-8 flex flex-col gap-6">
          <textarea
            value={documentInput}
            onChange={(e) => setDocumentInput(e.target.value)}
            placeholder="Paste your code or documentation..."
            className="flex-1 w-full rounded-2xl bg-[#0f172a]/40 border border-slate-800/80 p-5 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all resize-none placeholder:text-slate-600 custom-scrollbar"
          />

          <div className="space-y-4">
            <Button
              onClick={handleExplain}
              disabled={isAnyLoading || !documentInput.trim()}
              className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl shadow-blue-500/10 gap-3 text-base font-semibold transition-all active:scale-[0.98]"
            >
              {isAnyLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Execute Deep Explanation</span>
                </>
              )}
            </Button>

            <div className="p-4 rounded-2xl bg-slate-800/20 border border-slate-800/50 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Engine A
                </span>
                <div className="text-xs text-slate-300 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Llama 3.3
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Engine B
                </span>
                <div className="text-xs text-slate-300 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Mistral Large
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col relative bg-[#020617]">
        {/* Navigation */}
        <div className="h-20 border-b border-white/[0.03] flex items-center px-10 bg-[#020617]/40 backdrop-blur-md justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 p-1.5 bg-slate-900/40 rounded-[1.25rem] border border-white/[0.05]">
            <TabButton
              active={activeTab === "read"}
              onClick={() => setActiveTab("read")}
              label="Deep Insight"
              icon={<FileText size={16} />}
              loading={isReadingLoading}
            />
            <TabButton
              active={activeTab === "diagram"}
              onClick={() => setActiveTab("diagram")}
              label="Knowledge Map"
              icon={<Network size={16} />}
              loading={mermaidLoading}
            />
            <TabButton
              active={activeTab === "code"}
              onClick={() => setActiveTab("code")}
              label="Creative Domains"
              icon={<Code size={16} />}
              loading={scenariosLoading}
            />
            <TabButton
              active={activeTab === "guard"}
              onClick={() => setActiveTab("guard")}
              label="Impact Guard"
              icon={<AlertCircle size={16} />}
              loading={impactLoading}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:bg-white/5 rounded-full"
            >
              <Share2 size={18} />
            </Button>
            <div className="h-4 w-px bg-white/10" />
            <div className="text-xs text-slate-500 font-medium tracking-wide">
              {isAnyLoading
                ? "THE ARCHITECT IS DESIGNING..."
                : "WORKSPACE IDLE"}
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-hidden relative">
          {!hasAnyContent && !isAnyLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-[2.5]" />
                <Sparkles size={80} className="text-blue-500/40 relative" />
              </div>
              <h3 className="text-2xl font-light text-slate-400">
                Pioneer the Knowledge
              </h3>
              <p className="text-slate-600 mt-3 text-sm max-w-[280px] text-center leading-relaxed font-medium">
                Submit your manuscript to activate the Pedagogical Engine.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-full custom-scrollbar">
              <div className="max-w-[850px] mx-auto py-16 px-12">
                {/* ── TAB 1: Deep Insight ── */}
                {activeTab === "read" && (
                  <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {chatError && (
                      <ErrorCard title="Engine Failure" message={chatError} />
                    )}

                    {isReadingLoading && !explanation && (
                      <LoadingState
                        label="Mapping Technical Context..."
                        color="text-blue-500"
                      />
                    )}

                    {explanation && (
                      <article className="prose prose-invert prose-lg max-w-none pb-40 prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={makeMarkdownComponents("bg-blue-600") as any}
                        >
                          {explanation}
                        </ReactMarkdown>
                      </article>
                    )}
                  </div>
                )}

                {/* ── TAB 2: Knowledge Map ── */}
                {activeTab === "diagram" && (
                  <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {mermaidError && (
                      <ErrorCard
                        title="Logic Mapping Failed"
                        message={mermaidError}
                      />
                    )}

                    {mermaidLoading && !mermaidCode && (
                      <LoadingState
                        label="Extracting Structural Axioms..."
                        color="text-emerald-500"
                      />
                    )}

                    {mermaidCode && (
                      <div className="space-y-12">
                        <Card className="bg-slate-900/30 border-white/[0.05] backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border">
                          <CardHeader className="p-10 pb-4 border-b border-white/[0.02]">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <CardTitle className="text-emerald-400 flex items-center gap-3 text-2xl font-bold">
                                  <Network size={28} />
                                  Knowledge Galaxy
                                </CardTitle>
                                <CardDescription className="text-slate-500 text-sm font-medium tracking-wide">
                                  DEPENDENCY FLOW & ARCHITECTURAL AXIOMS
                                </CardDescription>
                              </div>
                              <Button
                                variant="secondary"
                                className="bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl h-11 px-6 border border-white/5"
                              >
                                <Maximize2 size={16} className="mr-2" />
                                Expand
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-10 pt-12">
                            <MermaidDiagram code={mermaidCode} />
                          </CardContent>
                        </Card>

                        <details className="group/details">
                          <summary className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-bold cursor-pointer hover:text-slate-400 transition-colors list-none flex items-center gap-3 ml-2">
                            <ChevronRight
                              size={14}
                              className="group-open/details:rotate-90 transition-transform text-emerald-500"
                            />
                            View Structural Source
                          </summary>
                          <pre className="mt-6 p-8 bg-black/40 rounded-3xl overflow-x-auto text-xs text-emerald-500/60 border border-emerald-500/10 font-mono leading-relaxed backdrop-blur-md">
                            {mermaidCode}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB 3: Creative Domains ── */}
                {activeTab === "code" && (
                  <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {scenariosError && (
                      <ErrorCard
                        title="Trans-Domain Search Failed"
                        message={scenariosError}
                      />
                    )}

                    {scenariosLoading && !scenarios && (
                      <LoadingState
                        label="Architecting Creative Use Cases..."
                        color="text-amber-500"
                      />
                    )}

                    {scenarios && (
                      <article className="prose prose-invert prose-lg max-w-none pb-40 prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0">
                        <div className="mb-10 p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                          <h4 className="text-amber-400 font-bold flex items-center gap-2 mb-2">
                            <Sparkles size={16} />
                            Creative Domain Synthesis
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed m-0 font-medium">
                            The Master Architect has mapped the document&apos;s
                            axioms to the following diverse industries and
                            creative logic structures.
                          </p>
                        </div>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={makeMarkdownComponents("bg-amber-500") as any}
                        >
                          {scenarios}
                        </ReactMarkdown>
                      </article>
                    )}
                  </div>
                )}

                {/* ── TAB 4: Impact Guard ── */}
                {activeTab === "guard" && (
                  <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {impactError && (
                      <ErrorCard
                        title="Context Guard Failure"
                        message={impactError}
                      />
                    )}

                    {impactLoading && !impactSummary && (
                      <LoadingState
                        label="Detecting Structural Ripple Effects..."
                        color="text-red-500"
                      />
                    )}

                    {impactSummary && (
                      <article className="prose prose-invert prose-lg max-w-none pb-40 prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0">
                        <div className="mb-10 p-8 bg-red-500/5 border border-red-500/10 rounded-[2rem]">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="p-2 bg-red-500/20 rounded-xl">
                              <AlertCircle className="text-red-400" size={20} />
                            </div>
                            <h4 className="text-red-400 font-bold m-0 text-xl tracking-tight">
                              Architectural Pre-flight Active
                            </h4>
                          </div>
                          <p className="text-sm text-red-300/60 leading-relaxed m-0 font-medium">
                            VedaCode is currently auditing your project for
                            architectural ripple effects. The system has
                            identified the following potential breakages.
                          </p>
                        </div>

                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={makeMarkdownComponents("bg-red-500") as any}
                        >
                          {impactSummary}
                        </ReactMarkdown>
                      </article>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .katex {
          font-size: 1.15em !important;
        }
        .katex-display {
          margin: 2rem 0 !important;
        }

        /* Prose Overrides for "Airy" feel */
        .prose h2 code {
          font-size: 0.8em;
        }
        .prose blockquote {
          border-left-color: #3b82f6;
          font-style: normal;
          background: rgba(59, 130, 246, 0.03);
          padding: 1.5rem 2rem;
          border-radius: 0 1rem 1rem 0;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}

function TabButton({ active, onClick, label, icon, loading }: any) {
  const accentColor =
    label === "Deep Insight"
      ? "text-blue-500"
      : label === "Knowledge Map"
        ? "text-emerald-500"
        : label === "Creative Domains"
          ? "text-amber-500"
          : "text-red-500";
  const glowShadow =
    label === "Deep Insight"
      ? "shadow-blue-500/10"
      : label === "Knowledge Map"
        ? "shadow-emerald-500/10"
        : label === "Creative Domains"
          ? "shadow-amber-500/10"
          : "shadow-red-500/10";

  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-3 text-[13px] font-bold rounded-2xl transition-all duration-300 flex items-center gap-2.5 outline-none tracking-tight",
        active
          ? `bg-[#1e293b] text-white shadow-2xl ${glowShadow} border border-white/10`
          : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent",
      )}
    >
      <span
        className={cn(
          "transition-transform duration-300",
          active ? `${accentColor} scale-110` : "text-slate-600",
          active ? "animate-in zoom-in-50" : "",
        )}
      >
        {icon}
      </span>
      {label}
      {loading && (
        <Loader2 size={12} className="animate-spin opacity-40 ml-1" />
      )}
    </button>
  );
}

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-10 group/code overflow-hidden rounded-2xl border border-white/[0.08] shadow-2xl">
      <div className="bg-[#0f172a] h-11 flex items-center justify-between px-5 border-b border-white/[0.05]">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white"
        >
          {copied ? (
            <Check size={14} className="text-emerald-500" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1.5rem 1.25rem",
          background: "#020617",
          fontSize: "0.85rem",
          lineHeight: "1.7",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

function ErrorCard({ title, message }: any) {
  return (
    <div className="p-10 bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400 flex items-start gap-6 mb-12">
      <div className="p-3 bg-red-500/10 rounded-2xl shrink-0">
        <AlertCircle size={24} />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-red-300 tracking-tight">
          {title}
        </h3>
        <p className="text-base text-red-400/70 leading-relaxed font-medium">
          {message}
        </p>
      </div>
    </div>
  );
}

function LoadingState({ label, color }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-40 gap-8 animate-in fade-in duration-1000">
      <div className="relative">
        <div
          className={cn(
            "absolute inset-0 blur-3xl opacity-10 scale-[3] animate-pulse rounded-full",
            color.replace("text", "bg"),
          )}
        />
        <Loader2 className={cn("animate-spin relative", color)} size={56} />
      </div>
      <div className="space-y-3 text-center">
        <p className="text-xl font-light text-slate-300 tracking-wide">
          {label}
        </p>
        <div className="h-0.5 w-12 bg-white/10 mx-auto rounded-full" />
        <p className="text-[10px] uppercase tracking-[0.4em] text-slate-600 font-black animate-pulse">
          Consulting Axis
        </p>
      </div>
    </div>
  );
}
