/**
 * POST /api/vedcode/ingest  — kick off ingestion job
 * GET  /api/vedcode/ingest?sourceId=xxx — poll status
 */
import { NextResponse } from 'next/server';
import { ingestSource } from '@/lib/vedcode/ingestion';
import { getSourceMeta } from '@/lib/vedcode/dynamodb';

export const maxDuration = 300; // 5min for long ingestions

function slugify(url: string): string {
    return url
        .replace(/^https?:\/\//, '')
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()
        .slice(0, 64);
}

export async function POST(req: Request) {
    try {
        const { url, name } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'url is required' }, { status: 400 });
        }

        const sourceId = slugify(url);
        const sourceName = name || new URL(url).hostname;

        console.log(`[Ingest] Starting ingestion for: ${url} (id: ${sourceId})`);

        // Fire ingestion in the background — don't await so request returns immediately
        ingestSource(sourceId, url, sourceName).catch(err =>
            console.error(`[Ingest] Background job failed for ${sourceId}:`, err)
        );

        return NextResponse.json({
            sourceId,
            status: 'started',
            message: `Ingestion started for ${sourceName}. Poll /api/vedcode/ingest?sourceId=${sourceId} for status.`,
        });
    } catch (error: any) {
        console.error('[Ingest] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
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

    return NextResponse.json(meta);
}
