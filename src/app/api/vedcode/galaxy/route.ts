/**
 * GET /api/vedcode/galaxy?sourceId=xxx
 * Returns concept graph nodes + derived edges for the Galaxy visualization.
 */
import { NextResponse } from 'next/server';
import { getSourceMeta } from '@/lib/vedcode/dynamodb';

export interface GalaxyEdge {
    from: string;
    to: string;
    type: 'unlocks' | 'prerequisite' | 'related';
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sourceId = searchParams.get('sourceId');

    if (!sourceId) {
        return NextResponse.json({ error: 'sourceId is required' }, { status: 400 });
    }

    const meta = await getSourceMeta(sourceId);
    if (!meta) {
        return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    const nodes = meta.conceptGraph || [];
    if (nodes.length === 0) {
        return NextResponse.json({ error: 'No concept graph found. Re-ingest this source.' }, { status: 404 });
    }

    // Derive edges from node relationships
    const edges: GalaxyEdge[] = [];
    const allConcepts = new Set(nodes.map((n: any) => n.concept));

    for (const node of nodes as any[]) {
        // prerequisite edge (node depends on this)
        if (node.prerequisite && allConcepts.has(node.prerequisite)) {
            edges.push({ from: node.prerequisite, to: node.concept, type: 'prerequisite' });
        }
        // unlocks edges
        for (const u of node.unlocks || []) {
            if (allConcepts.has(u)) {
                edges.push({ from: node.concept, to: u, type: 'unlocks' });
            }
        }
        // related edges (deduplicated by sorting)
        for (const r of node.related || []) {
            if (allConcepts.has(r)) {
                const [a, b] = [node.concept, r].sort();
                if (!edges.find(e => e.from === a && e.to === b && e.type === 'related')) {
                    edges.push({ from: a, to: b, type: 'related' });
                }
            }
        }
    }

    return NextResponse.json({ meta, nodes, edges });
}
