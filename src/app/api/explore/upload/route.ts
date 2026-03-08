import { NextRequest, NextResponse } from 'next/server';
import { parseGithubUrl, fetchRepoFiles } from '@/lib/constellation/githubFetcher';
import { analyzeRepo } from '@/lib/constellation/astParser';
import { buildConstellationGraph } from '@/lib/constellation/layout';
import { constellationCache, fileContentCache } from '@/lib/constellation/cache';
import { db } from '@/lib/db';
import { fileNodes, architectureMetrics } from '@/db/schema';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as { repoUrl?: string };
        const { repoUrl } = body;

        if (!repoUrl?.trim()) {
            return NextResponse.json({ error: 'repoUrl is required' }, { status: 400 });
        }

        // 1. Resolve owner / repo / branch from the URL
        const { owner, repo, branch } = await parseGithubUrl(repoUrl);

        // 2. Fetch all code files via GitHub API
        const files = await fetchRepoFiles(owner, repo, branch);
        if (files.size === 0) {
            return NextResponse.json(
                { error: 'No TypeScript/JavaScript files found in this repository.' },
                { status: 400 }
            );
        }

        // 3. Run ts-morph AST analysis
        const { nodes: analysisNodes, edgePairs } = analyzeRepo(files);

        // 4. Build React Flow layout (Solar System radial)
        const { nodes, edges } = buildConstellationGraph(analysisNodes, edgePairs);

        // 4.5 Architect Heatmap Integration (Phase 5.4)
        try {
            const allFiles = await db.select().from(fileNodes);
            const allMetrics = await db.select().from(architectureMetrics);

            const fileToMetric = new Map();
            allFiles.forEach((f: any) => {
                const m = allMetrics.find((metric: any) => metric.nodeId === f.id);
                if (m) fileToMetric.set(f.path.replace(/\\/g, '/'), m);
            });

            nodes.forEach(node => {
                const pathMatch = node.data.filePath as string;
                // find loose match if exact fails
                const metric = fileToMetric.get(pathMatch) ||
                    [...fileToMetric.entries()].find(([k]) => pathMatch.endsWith(k))?.[1];

                if (metric) {
                    node.data.stressScore = metric.stressScore;
                    node.data.coupling = metric.couplingScore;
                    node.data.density = metric.conceptDensity;
                    node.data.volatility = metric.changeFrequency;

                    // UI Overrides
                    if (metric.stressScore > 0.7) {
                        node.data.redAlert = true;
                        node.data.glowRadius = 30; // CRITICAL
                    } else if (metric.stressScore > 0.4) {
                        node.data.color = "#f59e0b"; // AMBER - WARNING
                        node.data.glowRadius = 20;
                    } else {
                        node.data.color = "#10b981"; // GREEN - STABLE
                    }
                }
            });

            // 4.6 Red-Alert Trajectories (Cascading Paths) with BFS Depth Limit
            // Animate edges that connect high-stress nodes up to a max depth
            const MAX_DEPTH = 3;
            const stressOrigins = new Set(nodes.filter(n => n.data.redAlert).map(n => n.id));
            
            // Build adjacency list for fast traversal
            const adj = new Map<string, string[]>();
            edges.forEach(e => {
                if (!adj.has(e.source)) adj.set(e.source, []);
                adj.get(e.source)!.push(e.target);
            });

            const visitedEdges = new Set<string>();
            const queue: { nodeId: string, depth: number }[] = [];
            
            stressOrigins.forEach(id => queue.push({ nodeId: id, depth: 0 }));

            while (queue.length > 0) {
                const { nodeId, depth } = queue.shift()!;
                if (depth >= MAX_DEPTH) continue;

                const neighbors = adj.get(nodeId) || [];
                for (const targetId of neighbors) {
                    const edgeId = `${nodeId}->${targetId}`; // Assuming edge tracking
                    const edge = edges.find(e => e.source === nodeId && e.target === targetId);
                    
                    if (edge && !visitedEdges.has(edge.id)) {
                        visitedEdges.add(edge.id);
                        edge.animated = true;
                        
                        // Fading out visually as depth increases
                        const intensity = 1 - (depth / MAX_DEPTH);
                        edge.style = { 
                            stroke: "#ef4444", 
                            strokeWidth: 1.5 + intensity * 1.5, 
                            opacity: 0.3 + intensity * 0.6,
                            filter: `drop-shadow(0 0 ${2 + intensity * 3}px rgba(239,68,68,${0.2 + intensity * 0.4}))`
                        };

                        queue.push({ nodeId: targetId, depth: depth + 1 });
                    }
                }
            }

        } catch (e) {
            console.error("Failed to merge stress metrics:", e);
        }

        // 5. Compute stats
        const solarSystems = [...new Set(analysisNodes.map((n) => n.solarSystem))];
        const mostComplex = [...analysisNodes].sort((a, b) => b.complexity - a.complexity)[0];
        const stats = {
            fileCount: nodes.length,
            edgeCount: edges.length,
            solarSystems,
            mostComplex: mostComplex
                ? (mostComplex.filePath.split('/').pop() ?? mostComplex.filePath)
                : 'n/a',
            repo: `${owner}/${repo}`,
            branch,
        };

        const data = { nodes, edges, stats };

        // 6. Cache with session cookie
        const sessionId =
            req.cookies.get('constellation-session')?.value ?? crypto.randomUUID();
        constellationCache.set(sessionId, data);
        fileContentCache.set(sessionId, files); // for the explain API

        const response = NextResponse.json({ ...data, sessionId });
        response.cookies.set('constellation-session', sessionId, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 h
        });
        return response;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Analysis failed';
        console.error('[Constellation Upload]', err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const sessionId = req.cookies.get('constellation-session')?.value;
    if (sessionId) {
        constellationCache.delete(sessionId);
        fileContentCache.delete(sessionId);
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.delete('constellation-session');
    return res;
}
