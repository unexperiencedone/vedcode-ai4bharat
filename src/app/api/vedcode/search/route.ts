/**
 * POST /api/vedcode/search — semantic search over ingested chunks
 */
import { NextResponse } from 'next/server';
import { embedText } from '@/lib/vedcode/embeddings';
import { vectorSearch } from '@/lib/vedcode/dynamodb';

export async function POST(req: Request) {
    try {
        const { query, sourceId, topK = 5 } = await req.json();

        if (!query || !sourceId) {
            return NextResponse.json(
                { error: 'query and sourceId are required' },
                { status: 400 }
            );
        }

        console.log(`[Search] Query: "${query.slice(0, 60)}..." in source: ${sourceId}`);

        const queryEmbedding = await embedText(query);
        const results = await vectorSearch(queryEmbedding, sourceId, topK);

        return NextResponse.json({
            results: results.map(r => ({
                score: Math.round(r.score * 1000) / 1000,
                pageTitle: r.pageTitle,
                parentHeader: r.parentHeader,
                text: r.text,
                url: r.url,
            })),
        });
    } catch (error: any) {
        console.error('[Search] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
