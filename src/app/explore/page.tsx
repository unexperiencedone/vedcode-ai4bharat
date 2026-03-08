'use client';

import { useState, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { GraphCanvas } from '@/components/galaxy/GraphCanvas';
import { UploadPanel } from '@/components/galaxy/UploadPanel';
import { FileExplainSheet } from '@/components/galaxy/FileExplainSheet';
import { FileTreeSidebar } from '@/components/galaxy/FileTreeSidebar';
import { PreFlightGateway } from '@/components/guard/PreFlightGateway';
import type { ConstellationStats } from '@/lib/constellation/cache';
import { RefreshCw, Clock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getFileMetrics } from '@/lib/actions/exploreActions';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

// TTL: 10 minutes — graph data older than this triggers a soft-refresh prompt
const GRAPH_CACHE_TTL = 10 * 60 * 1000;

interface GraphCache {
  repoUrl: string;
  stats: ConstellationStats;
}

export default function ExplorePage() {
    const { data: session } = useSession();

    // Persist the last loaded repo URL and stats across navigations (10 min TTL)
    const [graphCache, setGraphCache, clearGraphCache] = useLocalStorage<GraphCache | null>(
        'vedcode_explore_cache',
        null,
        GRAPH_CACHE_TTL
    );

    const [graphData, setGraphData] = useState<{
        nodes: Node[];
        edges: Edge[];
        stats: ConstellationStats;
    } | null>(null);

    const [selectedFile, setSelectedFile] = useState<{
        filePath: string;
        language: string;
    } | null>(null);

    const [preFlightFile, setPreFlightFile] = useState<{
        filePath: string;
        language: string;
        metrics: { stressScore: number; learningGaps: string[] };
    } | null>(null);

    const handleGraphReady = useCallback((nodes: Node[], edges: Edge[], stats: ConstellationStats) => {
        setGraphData({ nodes, edges, stats });
        setGraphCache({ repoUrl: stats.repo || '', stats });
    }, [setGraphCache]);

    const handleNodeClick = async (filePath: string, language: string) => {
        if (!session?.user) {
            setSelectedFile({ filePath, language });
            return;
        }

        const user = session.user as any;
        try {
            const metrics = await getFileMetrics(filePath, user.id);
            
            if (metrics.stressScore >= 0.6 || metrics.learningGaps.length > 0) {
                setPreFlightFile({ filePath, language, metrics });
            } else {
                setSelectedFile({ filePath, language });
            }
        } catch (error) {
            console.error("Failed to fetch file metrics:", error);
            setSelectedFile({ filePath, language });
        }
    };

    const handleClear = () => {
        setGraphData(null);
        setSelectedFile(null);
        clearGraphCache();
    };

    return (
        <div className="flex flex-col h-full w-full p-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Project Constellation
                    </h1>
                    <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                        {graphData
                            ? `Visualizing ${graphData.stats.repo} · branch: ${graphData.stats.branch} · click any star to explore`
                            : graphCache
                                ? `Last session: ${graphCache.stats?.repo || graphCache.repoUrl} · Paste a new URL or continue exploring`
                                : 'Paste a GitHub URL to generate a live AST-powered codebase map.'}
                    </p>
                    {graphCache && !graphData && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-yellow-500/80">
                            <Clock size={12} />
                            <span>Graph data from last session — paste the URL again to reload.</span>
                        </div>
                    )}
                </div>

                {graphData && (
                    <div className="flex items-center gap-3">
                        <div className="border border-border/50 bg-card rounded-lg p-1.5 flex text-xs">
                            <button className="px-3 py-1.5 bg-primary/20 text-primary rounded-md font-medium">
                                Radial-Force
                            </button>
                            <button className="px-3 py-1.5 text-muted-foreground hover:text-foreground">
                                Hierarchical
                            </button>
                        </div>
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-2 px-4 py-2 border border-border/50 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            New Repo
                        </button>
                    </div>
                )}
            </div>

            {/* Content — explicit height: React Flow requires a real pixel value */}
            <div className="w-full flex gap-4" style={{ height: 'calc(100vh - 190px)' }}>
                {graphData ? (
                    <>
                        {/* Persistent File Tree Sidebar */}
                        <div className="h-full rounded-xl overflow-hidden border border-border/50 shrink-0">
                            <FileTreeSidebar 
                                nodes={graphData.nodes} 
                                onNodeClick={handleNodeClick} 
                            />
                        </div>

                        {/* Graph Canvas */}
                        <div className="h-full flex-1 rounded-xl overflow-hidden shadow-2xl">
                            <GraphCanvas
                                nodes={graphData.nodes}
                                edges={graphData.edges}
                                stats={graphData.stats}
                                onNodeClick={handleNodeClick}
                            />
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full border border-border/50 rounded-xl bg-card/30 relative overflow-hidden">
                        <UploadPanel onGraphReady={handleGraphReady} defaultUrl={graphCache?.repoUrl} />
                    </div>
                )}
            </div>

            {/* File Explanation Sheet */}
            {selectedFile && (
                <FileExplainSheet
                    filePath={selectedFile.filePath}
                    language={selectedFile.language}
                    onClose={() => setSelectedFile(null)}
                />
            )}

            {/* Pre-Flight Gateway */}
            {preFlightFile && (
                <PreFlightGateway
                    filePath={preFlightFile.filePath}
                    metrics={preFlightFile.metrics}
                    onAcknowledge={() => {
                        setSelectedFile({ filePath: preFlightFile.filePath, language: preFlightFile.language });
                        setPreFlightFile(null);
                    }}
                    onCancel={() => setPreFlightFile(null)}
                />
            )}
        </div>
    );
}
