/**
 * VedaCode Ripple AI — Butterfly Effect Narrative Generator
 * Uses Nova 2 Pro to explain cascading breakage across layers.
 */
import { converse } from '@/lib/documentExplainer/bedrock';
import type { ImpactChain } from './ripple';

const NOVA_PRO = process.env.BEDROCK_NOVA_PRO_ID || 'amazon.nova-pro-v1:0';

const BUTTERFLY_EFFECT_PROMPT = `You are an expert software architect specializing in TypeScript/Next.js codebases.

You will receive a JSON impact chain showing which files import from a changed file. Your job is to explain the LOGICAL RIPPLE EFFECT — the Butterfly Effect — that propagates through the layers.

Rules:
1. Explain the cascade layer by layer: DB Model → Drizzle Action → Server Action → Component
2. Be SPECIFIC about WHY each layer breaks. For example: "Changing the User schema invalidates the Zod validator in createUser(), which breaks the expected props in <UserForm>"
3. Use concrete file names from the chain
4. Flag the highest-risk breakage first
5. Keep it under 400 words
6. Format in clean markdown with emoji severity indicators (🔴 breaking, 🟡 warning, 🔵 info)`;

export interface RippleNarrative {
    markdown: string;
    summary: string; // one-line TL;DR
}

export async function generateRippleNarrative(chain: ImpactChain): Promise<RippleNarrative> {
    if (chain.affectedFiles.length === 0) {
        return {
            markdown: '✅ **No ripple effects detected.** This file has no importers in the project.',
            summary: 'Safe to change — no dependents found.',
        };
    }

    const chainJson = JSON.stringify({
        changedFile: chain.changedFile,
        exportedSymbols: chain.exportedSymbols,
        riskLevel: chain.riskLevel,
        affectedFiles: chain.affectedFiles.map(f => ({
            ...f,
            filePath: f.filePath,
        })),
    }, null, 2);

    const prompt = `Analyze this impact chain and explain the Butterfly Effect ripple through the codebase:

\`\`\`json
${chainJson}
\`\`\`

Provide:
1. A one-sentence TL;DR on the first line starting with "**TL;DR:**"
2. A layer-by-layer breakdown of the cascading effects
3. The single most dangerous breakage point`;

    try {
        const response = await converse(
            NOVA_PRO,
            [{ role: 'user', content: [{ text: prompt }] }],
            BUTTERFLY_EFFECT_PROMPT,
            0.3
        );

        // Extract TL;DR from first line
        const lines = response.split('\n');
        const tldrLine = lines.find(l => l.includes('TL;DR')) || '';
        const summary = tldrLine.replace(/\*\*/g, '').replace('TL;DR:', '').trim() ||
            `${chain.riskLevel.toUpperCase()} risk — ${chain.affectedFiles.length} files affected`;

        return { markdown: response, summary };
    } catch (err: any) {
        console.error('[RippleAI] Error:', err);
        // Graceful fallback — still return useful info without AI
        const fallback = chain.affectedFiles.map(f =>
            `- ${f.severity === 'breaking' ? '🔴' : f.severity === 'warning' ? '🟡' : '🔵'} **${f.filePath}** (${f.layerType}) — imports \`${f.importedSymbols.slice(0, 3).join(', ')}\``
        ).join('\n');

        return {
            markdown: `## Impact Chain\n\n${fallback}`,
            summary: `${chain.riskLevel.toUpperCase()} risk — ${chain.affectedFiles.length} files affected`,
        };
    }
}
