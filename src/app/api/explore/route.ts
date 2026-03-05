import { NextRequest, NextResponse } from 'next/server';
import { constellationCache } from '@/lib/constellation/cache';

export async function GET(req: NextRequest) {
    const sessionId = req.cookies.get('constellation-session')?.value;

    if (!sessionId || !constellationCache.has(sessionId)) {
        // No project analyzed yet — return empty state
        return NextResponse.json({ nodes: [], edges: [], stats: null });
    }

    return NextResponse.json(constellationCache.get(sessionId));
}
