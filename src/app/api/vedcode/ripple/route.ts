/**
 * POST /api/vedcode/ripple
 * Accepts a file path + content, runs ts-morph impact analysis,
 * calls Nova Pro for the Butterfly Effect narrative.
 */
import { NextResponse } from 'next/server';
import { traceImpactChain } from '@/lib/vedcode/ripple';
import { generateRippleNarrative } from '@/lib/vedcode/rippleAI';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { filePath, content } = await req.json();

        if (!filePath || !content) {
            return NextResponse.json(
                { error: 'filePath and content are required' },
                { status: 400 }
            );
        }

        console.log(`[Ripple] Analyzing: ${filePath}`);

        // 1. Trace the impact chain via ts-morph + DynamoDB import cache
        const chain = await traceImpactChain(filePath, content);

        // 2. Generate Butterfly Effect narrative via Nova Pro
        const narrative = await generateRippleNarrative(chain);

        console.log(`[Ripple] Done — ${chain.affectedFiles.length} affected files, risk: ${chain.riskLevel}`);

        return NextResponse.json({
            chain,
            narrative,
        });
    } catch (error: any) {
        console.error('[Ripple] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
