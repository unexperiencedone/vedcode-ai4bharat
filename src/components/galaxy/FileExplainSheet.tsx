'use client';

import { useEffect, useState, useRef } from 'react';
import { X, Loader2, Sparkles, ChevronDown, ChevronRight, Lightbulb, Code2, Zap } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExplainBlock {
    lines: [number, number];
    title: string;
    explanation: string;
    concepts: string[];
    creativity: string;
}

interface ConceptDeepDive {
    explanation: string;
    useCase: string;
    codeExample: string;
    proTip: string;
}

interface FileExplainSheetProps {
    filePath: string;
    language: string;
    onClose: () => void;
}

// ── Language map for syntax highlighting ──────────────────────────────────────

const LANG_MAP: Record<string, string> = {
    '.ts': 'typescript', '.tsx': 'tsx', '.js': 'javascript', '.jsx': 'jsx',
    '.py': 'python', '.go': 'go', '.rs': 'rust', '.java': 'java',
    '.kt': 'kotlin', '.cs': 'csharp', '.rb': 'ruby', '.php': 'php',
    '.cpp': 'cpp', '.c': 'c', '.swift': 'swift', '.dart': 'dart',
    '.vue': 'markup', '.svelte': 'markup', '.sh': 'bash', '.lua': 'lua',
};

function syntaxLang(filePath: string) {
    const ext = '.' + (filePath.split('.').pop() ?? '');
    return LANG_MAP[ext] ?? 'text';
}

// ── Concept Chip ──────────────────────────────────────────────────────────────

function ConceptChip({
    concept,
    context,
    language,
}: {
    concept: string;
    context: string;
    language: string;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ConceptDeepDive | null>(null);
    const [error, setError] = useState('');

    const loadDeepDive = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (data) { setOpen((o) => !o); return; }
        setOpen(true);
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/explore/concept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ concept, context, language }),
            });
            const resultData = await res.json() as ConceptDeepDive & { error?: string };
            if (!res.ok || resultData.error) {
                throw new Error(resultData.error ?? 'Failed to analyze concept');
            }
            setData(resultData);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="inline-block mb-2 mr-2">
            <button
                onClick={loadDeepDive}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-xs font-medium text-primary hover:bg-primary/20 hover:border-primary/60 transition-all shadow-sm"
            >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {concept}
            </button>

            {/* Modal Dialog */}
            {open && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setOpen(false)} // close on click outside
                >
                    <div 
                        className="relative w-full max-w-2xl bg-background border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} // prevent clicks inside from closing
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-card/40">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-bold text-foreground">{concept}</h2>
                            </div>
                            <button 
                                onClick={() => setOpen(false)}
                                className="p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
                            {error ? (
                                <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                                    {error}
                                </div>
                            ) : !data ? (
                                <div className="space-y-4">
                                    <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse" />
                                    <div className="h-4 bg-muted/50 rounded w-full animate-pulse" />
                                    <div className="h-4 bg-muted/50 rounded w-5/6 animate-pulse" />
                                    <div className="h-32 bg-muted/30 rounded-lg animate-pulse mt-6" />
                                </div>
                            ) : (
                                <>
                                    {/* Explanation */}
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">The Concept</h3>
                                        <p className="text-base text-foreground leading-relaxed">{data.explanation}</p>
                                    </div>
                                    
                                    {/* Use Case */}
                                    <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                        <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-semibold text-foreground mb-1">When to use it</h3>
                                            <p className="text-sm text-foreground/80">{data.useCase}</p>
                                        </div>
                                    </div>

                                    {/* Code Example */}
                                    <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm">
                                        <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border/50">
                                            <Code2 className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-medium text-foreground">Creative Application</span>
                                        </div>
                                        <SyntaxHighlighter
                                            language={language}
                                            style={oneDark}
                                            customStyle={{ margin: 0, fontSize: '13px', background: 'hsl(var(--card))', padding: '16px' }}
                                            wrapLongLines
                                        >
                                            {data.codeExample}
                                        </SyntaxHighlighter>
                                    </div>

                                    {/* Pro Tip */}
                                    <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">Pro Tip</h3>
                                            <p className="text-sm text-amber-800 dark:text-amber-200/90 italic">{data.proTip}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Explain Block Card ────────────────────────────────────────────────────────

function BlockCard({
    block,
    context,
    language,
    active,
    onClick,
}: {
    block: ExplainBlock;
    context: string;
    language: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`rounded-xl border transition-all cursor-pointer mb-3 overflow-hidden ${
                active
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border/40 bg-card/50 hover:border-border/70'
            }`}
        >
            {/* Block header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                        L{block.lines[0]}–{block.lines[1]}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{block.title}</span>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${active ? 'rotate-180' : ''}`}
                />
            </div>

            {active && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/30">
                    {/* Explanation */}
                    <p className="text-sm text-foreground/85 leading-relaxed pt-3">{block.explanation}</p>

                    {/* Concepts */}
                    {block.concepts.length > 0 && (
                        <div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                                Concepts in this block
                            </p>
                            <div>
                                {block.concepts.map((c) => (
                                    <ConceptChip key={c} concept={c} context={context} language={language} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Creativity */}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/8 border border-amber-500/20">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-200/80 leading-relaxed">{block.creativity}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main Sheet ────────────────────────────────────────────────────────────────

export function FileExplainSheet({ filePath, language, onClose }: FileExplainSheetProps) {
    const [fileContent, setFileContent] = useState('');
    const [blocks, setBlocks] = useState<ExplainBlock[]>([]);
    const [activeBlock, setActiveBlock] = useState<number | null>(0);
    const [loadingFile, setLoadingFile] = useState(true);
    const [loadingExplain, setLoadingExplain] = useState(false);
    const [error, setError] = useState('');
    const hasFetched = useRef(false);

    const syntaxLanguage = syntaxLang(filePath);

    // Fetch file content
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        (async () => {
            setLoadingFile(true);
            try {
                const res = await fetch(`/api/explore/file?path=${encodeURIComponent(filePath)}`);
                const data = await res.json() as { content?: string; error?: string };
                if (!res.ok || data.error) throw new Error(data.error);
                setFileContent(data.content ?? '');

                // Immediately kick off AI explanation
                setLoadingExplain(true);
                try {
                    const r2 = await fetch('/api/explore/explain', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ filePath, content: data.content, language }),
                    });
                    const res2 = await r2.json() as { blocks?: ExplainBlock[]; error?: string };
                    if (res2.blocks) setBlocks(res2.blocks);
                } catch { /* explanation failed — show file only */ }
                finally { setLoadingExplain(false); }
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load file');
            } finally {
                setLoadingFile(false);
            }
        })();
    }, [filePath, language]);

    const fileBasename = filePath.split('/').pop() ?? filePath;
    const [highlightStart, highlightEnd] = activeBlock !== null && blocks[activeBlock]
        ? blocks[activeBlock].lines
        : [0, 0];

    return (
        /* Overlay */
        <div className="fixed inset-0 z-50 flex justify-end" onClick={(e) => e.target === e.currentTarget && onClose()}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Sheet */}
            <div
                className="relative flex w-full max-w-5xl h-full bg-background border-l border-border/50 shadow-2xl animate-in slide-in-from-right duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* LEFT — source file */}
                <div className="flex flex-col w-1/2 border-r border-border/30 overflow-hidden">
                    {/* File header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 bg-card/50 shrink-0">
                        <Code2 className="w-4 h-4 text-primary" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{fileBasename}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{filePath}</p>
                        </div>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-auto">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Code */}
                    <div className="flex-1 overflow-auto">
                        {loadingFile ? (
                            <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading file…</span>
                            </div>
                        ) : error ? (
                            <div className="p-6 text-sm text-destructive">{error}</div>
                        ) : (
                            <SyntaxHighlighter
                                language={syntaxLanguage}
                                style={oneDark}
                                showLineNumbers
                                wrapLines
                                lineProps={(lineNumber: number) => {
                                    const highlight =
                                        highlightStart > 0 &&
                                        lineNumber >= highlightStart &&
                                        lineNumber <= highlightEnd;
                                    return {
                                        style: highlight
                                            ? { backgroundColor: 'rgba(99,102,241,0.15)', display: 'block' }
                                            : {},
                                    };
                                }}
                                customStyle={{ margin: 0, height: '100%', fontSize: '12px', background: 'transparent' }}
                            >
                                {fileContent}
                            </SyntaxHighlighter>
                        )}
                    </div>
                </div>

                {/* RIGHT — AI explanation */}
                <div className="flex flex-col w-1/2 overflow-hidden">
                    {/* Panel header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-card/50 shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">AI Breakdown</span>
                        {loadingExplain && (
                            <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Analysing…
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {loadingExplain && blocks.length === 0 && (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-16 rounded-xl border border-border/30 bg-card/30 animate-pulse" />
                                ))}
                                <p className="text-xs text-center text-muted-foreground pt-2">
                                    Nova Pro is reading your code…
                                </p>
                            </div>
                        )}

                        {blocks.length > 0 && (
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                                    {blocks.length} code blocks — click to expand
                                </p>
                                {blocks.map((block, i) => (
                                    <BlockCard
                                        key={i}
                                        block={block}
                                        context={fileContent.split('\n').slice(block.lines[0] - 1, block.lines[1]).join('\n')}
                                        language={syntaxLanguage}
                                        active={activeBlock === i}
                                        onClick={() => setActiveBlock(activeBlock === i ? null : i)}
                                    />
                                ))}
                            </div>
                        )}

                        {!loadingExplain && blocks.length === 0 && !loadingFile && !error && (
                            <p className="text-sm text-muted-foreground text-center pt-8">
                                Could not generate explanation. The file may be a config or binary.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
