import { NextResponse } from 'next/server';
import { converse, MISTRAL_LARGE_2_ID } from '@/lib/documentExplainer/bedrock';
import { z } from 'zod';

export const maxDuration = 60;

// Schema for structured topic map data
const TopicMapSchema = z.object({
    topic: z.string().describe('The main topic of the document (max 4 words)'),
    previous: z.array(z.string()).max(5).describe('Prerequisite concepts the reader should know'),
    current: z.array(z.string()).max(10).describe('Key concepts explained in this document'),
    future: z.array(z.string()).max(6).describe('Topics this document unlocks or enables next'),
});

type TopicMap = z.infer<typeof TopicMapSchema>;

function buildMermaid(data: TopicMap): string {
    const sanitize = (s: string) =>
        s.replace(/"/g, "'").replace(/[<>]/g, '').trim();

    const lines: string[] = ['graph TD'];

    if (data.previous.length > 0) {
        lines.push('    subgraph PREV["🔗 Previous Knowledge"]');
        data.previous.forEach((item, i) => {
            lines.push(`        P${i}["${sanitize(item)}"]`);
        });
        lines.push('    end');
    }

    lines.push('    subgraph NOW["🧠 Core Topic"]');
    data.current.forEach((item, i) => {
        lines.push(`        C${i}["${sanitize(item)}"]`);
    });
    lines.push('    end');

    if (data.future.length > 0) {
        lines.push('    subgraph NEXT["🌊 What This Unlocks"]');
        data.future.forEach((item, i) => {
            lines.push(`        F${i}["${sanitize(item)}"]`);
        });
        lines.push('    end');
    }

    if (data.previous.length > 0) lines.push('    PREV --> NOW');
    if (data.future.length > 0) lines.push('    NOW --> NEXT');

    return lines.join('\n');
}

export async function POST(req: Request) {
    try {
        const { documentContent } = await req.json();

        if (!documentContent) {
            return NextResponse.json({ error: 'Document content is required' }, { status: 400 });
        }

        console.log('[Tab 2] Bedrock Visual Map (Mistral Large 2) started...');

        const prompt = `Analyze this document and extract a topic map. 
Return ONLY a raw JSON object with this structure:
{
  "topic": "string",
  "previous": ["concept1", "concept2"],
  "current": ["concept1", "concept2"],
  "future": ["concept1", "concept2"]
}

Rules:
1. Use plain simple words.
2. Max 4 previous, 5 current, 4 future concepts.
3. No explanation, no markdown backticks, just the JSON.

Document:
${documentContent}`;

        const responseText = await converse(MISTRAL_LARGE_2_ID, [{ role: "user", content: [{ text: prompt }] }], "You are a structural data extractor.");
        
        // Basic JSON extraction in case model adds backticks
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
        
        const rawData = JSON.parse(jsonStr);
        const object = TopicMapSchema.parse(rawData);

        const mermaidCode = buildMermaid(object);

        return NextResponse.json({ mermaidCode });
    } catch (error: any) {
        console.error('[Tab 2] Visual Map Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to generate diagram' },
            { status: 500 }
        );
    }
}
