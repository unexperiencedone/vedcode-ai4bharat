import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';

const bedrock = createAmazonBedrock({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const MODEL = process.env.BEDROCK_NOVA_PRO_ID || 'amazon.nova-pro-v1:0';

interface ExplainBlock {
    lines: [number, number];
    title: string;
    explanation: string;
    concepts: string[];
    creativity: string;
}

/**
 * POST /api/explore/explain
 * Body: { filePath: string, content: string, language: string }
 *
 * Returns a JSON array of ExplainBlock — one per logical section of the file.
 */
export async function POST(req: NextRequest) {
    const { filePath, content, language } = await req.json() as {
        filePath: string;
        content: string;
        language: string;
    };

    if (!filePath || !content) {
        return NextResponse.json({ error: 'filePath and content are required' }, { status: 400 });
    }

    // Cap content length for very large files
    const cappedContent = content.length > 8000
        ? content.slice(0, 8000) + '\n\n// ... (file truncated at 8000 chars for analysis)'
        : content;

    const lineCount = content.split('\n').length;

    const prompt = `You are VedaCode, an elite software architecture teacher.

Analyze this ${language || ''} file: "${filePath}"
It has ${lineCount} lines total.

File content:
\`\`\`${language || ''}
${cappedContent}
\`\`\`

Break the file into highly granular, near line-by-line logical blocks (typically 3-10 lines per block).
You MUST explicitly explain:
1. Every import and external library at the top (why it's needed here).
2. Any configuration or header objects.
3. Every function, class, or component logically step-by-step.

For each block, provide:
- "lines": exact start and end line numbers (1-indexed, MUST NOT overlap, continuous)
- "title": short descriptive title (5 words max)
- "explanation": 2-4 sentences explaining WHAT this code does and WHY it is written this way.
- "concepts": 1-4 programming concept names actually present.
- "creativity": ONE interesting tradeoff or alternative way to write this.`;

    try {
        const { object: blocks } = await generateObject({
            model: bedrock(MODEL),
            output: 'array',
            schema: z.object({
                lines: z.tuple([z.number(), z.number()]),
                title: z.string(),
                explanation: z.string(),
                concepts: z.array(z.string()),
                creativity: z.string()
            }),
            prompt,
            temperature: 0.5,
        });

        return NextResponse.json({ blocks, filePath, lineCount });

    } catch (err) {
        console.error('[Explain API - Bedrock Nova]', err);
        return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }
}
