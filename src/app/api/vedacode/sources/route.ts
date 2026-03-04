/**
 * GET /api/vedacode/sources — list all ingested sources
 */
import { NextResponse } from 'next/server';
import { listAllSources } from '@/lib/vedacode/dynamodb';

export async function GET() {
    try {
        const sources = await listAllSources();
        // Sort by most recently ingested
        sources.sort((a, b) => new Date(b.ingestedAt).getTime() - new Date(a.ingestedAt).getTime());
        return NextResponse.json({ sources });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
