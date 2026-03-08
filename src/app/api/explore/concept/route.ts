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

/**
 * POST /api/explore/concept
 * Body: { concept: string, context: string, language: string }
 *
 * Returns a JSON object with:
 *  - explanation: what the concept is
 *  - useCase: when/why you'd use it
 *  - codeExample: creative usage DIFFERENT from the context snippet
 *  - proTip: advanced insight most devs miss
 */
export async function POST(req: NextRequest) {
    const { concept, context, language } = await req.json() as {
        concept: string;
        context: string;
        language: string;
    };

    if (!concept) {
        return NextResponse.json({ error: 'concept is required' }, { status: 400 });
    }

    const prompt = `You are VedCode, an expert software architecture mentor.
A developer just encountered the concept "${concept}" in ${language || 'code'}.

Context snippet where they saw it:
\`\`\`
${context?.slice(0, 600) || '(no context provided)'}
\`\`\`

Respond with ONLY a valid JSON object (no markdown, no code fences) in this exact shape:
{
  "explanation": "A clear 2-3 sentence explanation of what ${concept} is and why it exists.",
  "useCase": "One sentence: the canonical reason/situation to reach for ${concept}.",
  "codeExample": "A SHORT, self-contained code snippet (8-15 lines max) showing ${concept} used in a CREATIVE, DIFFERENT context than the snippet above. Use ${language || 'the same language as the context'}. Include a short comment at the top explaining what it demonstrates.",
  "proTip": "One advanced insight about ${concept} that most developers overlook — a gotcha, performance implication, or elegant pattern."
}`;

    try {
        const { object } = await generateObject({
            model: bedrock(MODEL),
            schema: z.object({
                explanation: z.string(),
                useCase: z.string(),
                codeExample: z.string(),
                proTip: z.string()
            }),
            prompt,
            temperature: 0.7,
        });

        return NextResponse.json(object);

    } catch (err) {
        console.error('[Concept API - Bedrock Nova]', err);
        return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }
}
