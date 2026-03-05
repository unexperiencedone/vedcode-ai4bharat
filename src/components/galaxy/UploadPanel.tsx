'use client';

import { useState, useRef } from 'react';
import { GitBranch, Loader2, Telescope, X, ChevronRight } from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';
import type { ConstellationStats } from '@/lib/constellation/cache';

interface UploadPanelProps {
    onGraphReady: (nodes: Node[], edges: Edge[], stats: ConstellationStats) => void;
}

const EXAMPLE_REPOS = [
    'https://github.com/vercel/next.js',
    'https://github.com/shadcn-ui/ui',
    'https://github.com/pmndrs/zustand',
];

const PROGRESS_MESSAGES = [
    'Connecting to GitHub…',
    'Fetching repository file tree…',
    'Downloading source files…',
    'Running ts-morph AST analysis…',
    'Computing complexity & gravity…',
    'Building Solar System layout…',
    'Almost there…',
];

export function UploadPanel({ onGraphReady }: UploadPanelProps) {
    const [repoUrl, setRepoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progressIdx, setProgressIdx] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startProgressMessages = () => {
        setProgressIdx(0);
        intervalRef.current = setInterval(() => {
            setProgressIdx((i) => Math.min(i + 1, PROGRESS_MESSAGES.length - 1));
        }, 2200);
    };

    const stopProgress = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const analyze = async () => {
        if (!repoUrl.trim()) return;
        setLoading(true);
        setError('');
        startProgressMessages();

        try {
            const res = await fetch('/api/explore/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl: repoUrl.trim() }),
            });
            const data = await res.json() as {
                nodes?: Node[];
                edges?: Edge[];
                stats?: ConstellationStats;
                error?: string;
            };
            if (!res.ok || data.error) {
                setError(data.error ?? 'Analysis failed');
                return;
            }
            onGraphReady(data.nodes ?? [], data.edges ?? [], data.stats!);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Network error');
        } finally {
            stopProgress();
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[560px] px-6">
            {/* Ambient starfield decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                {Array.from({ length: 60 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            width: Math.random() > 0.8 ? 2 : 1,
                            height: Math.random() > 0.8 ? 2 : 1,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.6 + 0.2,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-8">
                {/* Icon + headline */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Telescope className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Map Your Codebase
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Paste a GitHub repository URL to generate a live
                        <strong className="text-foreground"> ProjectConstellation</strong> — every file
                        mapped by complexity and imports.
                    </p>
                </div>

                {/* URL Input */}
                <div className="w-full flex gap-2">
                    <div className="flex-1 flex items-center gap-2 border border-border/60 bg-card/80 rounded-lg px-4 py-3 focus-within:border-primary/60 transition-colors">
                        <GitBranch className="w-4 h-4 text-muted-foreground shrink-0" />
                        <input
                            type="url"
                            placeholder="https://github.com/owner/repo"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !loading && analyze()}
                            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                            disabled={loading}
                        />
                        {repoUrl && !loading && (
                            <button onClick={() => setRepoUrl('')} className="text-muted-foreground hover:text-foreground">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={analyze}
                        disabled={!repoUrl.trim() || loading}
                        className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                        {loading ? 'Analyzing…' : 'Analyze'}
                    </button>
                </div>

                {/* Progress messages */}
                {loading && (
                    <div className="w-full bg-card/50 border border-border/40 rounded-lg px-5 py-4 flex flex-col gap-2">
                        <p className="text-xs font-medium text-primary tracking-widest uppercase">
                            {PROGRESS_MESSAGES[progressIdx]}
                        </p>
                        <div className="w-full h-1 bg-border/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-2000"
                                style={{
                                    width: `${((progressIdx + 1) / PROGRESS_MESSAGES.length) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="w-full bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {/* Example repos */}
                {!loading && !error && (
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-xs text-muted-foreground">Try an example:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {EXAMPLE_REPOS.map((repo) => (
                                <button
                                    key={repo}
                                    onClick={() => setRepoUrl(repo)}
                                    className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-card/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                                >
                                    {repo.replace('https://github.com/', '')}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    {[
                        { color: '#3b82f6', label: 'Component' },
                        { color: '#f59e0b', label: 'API Route' },
                        { color: '#10b981', label: 'Library' },
                        { color: '#8b5cf6', label: 'Schema / DB' },
                    ].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-1.5">
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{
                                    backgroundColor: color,
                                    boxShadow: `0 0 6px ${color}88`,
                                }}
                            />
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
