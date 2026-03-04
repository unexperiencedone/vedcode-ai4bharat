/**
 * GET /api/vedacode/reader?sourceId=xxx
 * Returns pre-processed page explanations + bridge explanations for a source.
 */
import { NextResponse } from 'next/server';
import { loadDocumentEcosystem } from '@/lib/vedacode/encyclopediaProcessor';
import { getSourceMeta } from '@/lib/vedacode/dynamodb';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sourceId = searchParams.get('sourceId');

    if (!sourceId) {
        return NextResponse.json({ error: 'sourceId is required' }, { status: 400 });
    }

    const [meta, ecosystem] = await Promise.all([
        getSourceMeta(sourceId),
        loadDocumentEcosystem(sourceId),
    ]);

    if (!meta) {
        return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    if (ecosystem.pages.length === 0) {
        return NextResponse.json({
            error: 'No page explanations found. Re-ingest this source to generate the Encyclopedia.',
            meta,
        }, { status: 404 });
    }

    return NextResponse.json({
        meta,
        pages: ecosystem.pages,
        bridges: ecosystem.bridges,
    });
}
