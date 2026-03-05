import { NextRequest, NextResponse } from 'next/server';
import { fileContentCache } from '@/lib/constellation/cache';

/**
 * GET /api/explore/file?path=src/components/Foo.tsx
 * Returns the raw file content from the in-memory cache.
 */
export async function GET(req: NextRequest) {
    const filePath = req.nextUrl.searchParams.get('path');
    const sessionId = req.cookies.get('constellation-session')?.value;

    if (!filePath || !sessionId) {
        return NextResponse.json({ error: 'path and session required' }, { status: 400 });
    }

    const files = fileContentCache.get(sessionId);
    if (!files) {
        return NextResponse.json({ error: 'No project loaded. Please analyze a repository first.' }, { status: 404 });
    }

    const content = files.get(filePath);
    if (content === undefined) {
        return NextResponse.json({ error: `File not found: ${filePath}` }, { status: 404 });
    }

    return NextResponse.json({ filePath, content });
}
