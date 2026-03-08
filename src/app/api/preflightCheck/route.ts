import { NextResponse } from 'next/server';
import { converse, NOVA_2_PRO_ID } from '@/lib/documentExplainer/bedrock';
import { CodebaseAnalyzer } from '@/lib/parser/analyzer';
import * as path from 'path';

export const maxDuration = 60;

const RIPPLE_SYSTEM_PROMPT = `You are the "VedCode Context Guard." Your mission is to perform a pre-execution impact analysis on a code change.

# 🛰️ ANALYSIS PRINCIPLES
1. BE PRECISE: Identify exactly what might break.
2. STRUCTURAL & SEMANTIC: Use the provided "Structural Ribble Map" (from AST analysis) and the "Code Content" to explain WHY these files are affected.
3. ADAPTIVE WARNINGS: Differentiate between "Breaking Changes" (e.g. signature changes) and "Side Effects" (e.g. logic flow changes).

# 🎨 FORMATTING & STYLE
Use your "Airy" document style:
- Use double-newlines.
- Use symbols (⚠️, 🔗, 🛡️) for alertness.
- Keep it concise but deeply technical.

# OUTPUT STRUCTURE
- ## ⚠️ Pre-Flight Impact Analysis
- ### 🔗 Structural Ripple Map
  (List the files affected and their relationship to the changed file.)
- ### 🔬 Semantic Deep-Dive
  (Explain HOW the logic change propagates through these files.)
- ### 🛡️ Safety Recommendation
  (Provide the "Master Architect" advice on whether to proceed or refactor.)`;

export async function POST(req: Request) {
    try {
        const { filePath, content, changeSummary } = await req.json();

        if (!filePath || !content) {
            return NextResponse.json({ error: 'FilePath and content are required' }, { status: 400 });
        }

        console.log(`[Context Guard] Analyzing ripple effects for: ${filePath}`);

        // Initialize analyzer for the current project
        const projectPath = process.cwd();
        const analyzer = new CodebaseAnalyzer(projectPath);

        // 1. Find structural impacts (simple symbol-based check for prototype)
        // In a real scenario, we'd extract the specific symbol that changed in 'content'
        // For prototype, we'll look at all exports in the file
        const exports = analyzer.getExportMap()[path.resolve(projectPath, filePath)] || [];
        const affectedFiles = new Set<string>();

        exports.forEach(symbol => {
            const ripples = analyzer.findRippleEffects(path.resolve(projectPath, filePath), symbol);
            ripples.forEach(r => affectedFiles.add(path.relative(projectPath, r)));
        });

        const rippleMap = Array.from(new Set(affectedFiles));

        // 2. Perform semantic reasoning with Nova 2 Pro
        const prompt = `Change in file: ${filePath}
New Content Segment:
${content}

User Change Summary: ${changeSummary || 'Logic update'}

Structural Ripple Map (Syntactic dependencies):
${rippleMap.length > 0 ? rippleMap.join('\n') : 'No direct importing files found.'}

Task: Use the structural map and the code content to explain the ripple effects and any hidden breakages.`;

        const explanation = await converse(
            NOVA_2_PRO_ID,
            [{ role: "user", content: [{ text: prompt }] }],
            RIPPLE_SYSTEM_PROMPT
        );

        return NextResponse.json({
            impactSummary: explanation,
            affectedFiles: rippleMap
        });
    } catch (error: any) {
        console.error('[Context Guard] Impact Analysis Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to perform pre-flight check' },
            { status: 500 }
        );
    }
}
