import { NextResponse } from 'next/server';
import { converse, MISTRAL_LARGE_2_ID } from '@/lib/documentExplainer/bedrock';

export const maxDuration = 60;

const KEYWORD_SYSTEM_PROMPT = `You are a technical terminology extractor. Your job is to identify the most important domain-specific keywords, acronyms, and concepts from a document and provide a concise one-sentence definition for each.

Rules:
1. Extract 10-25 key terms. Focus on domain-specific and technical terms, not common words.
2. Keep definitions SHORT — one sentence, max 20 words.
3. Return ONLY a valid JSON object. No markdown, no backticks, no explanation.
4. Format: { "term": "definition", "another term": "definition" }
5. Use the EXACT casing of the term as it appears in the document.`;

export async function POST(req: Request) {
    try {
        const { documentContent } = await req.json();

        if (!documentContent) {
            return NextResponse.json({ error: 'Document content is required' }, { status: 400 });
        }

        console.log('[Keywords] Extracting keywords...');

        const prompt = `Extract key technical terms and their definitions from this document. Return only a JSON object.

Document:
${documentContent.substring(0, 6000)}`; // Cap to avoid token overflow

        const responseText = await converse(
            MISTRAL_LARGE_2_ID,
            [{ role: 'user', content: [{ text: prompt }] }],
            KEYWORD_SYSTEM_PROMPT,
            0.2
        );

        // Extract the JSON object from the response (in case it added extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('[Keywords] No JSON found in response:', responseText.substring(0, 200));
            return NextResponse.json({ keywords: {} });
        }

        const keywords = JSON.parse(jsonMatch[0]);
        console.log(`[Keywords] Extracted ${Object.keys(keywords).length} terms`);

        return NextResponse.json({ keywords });
    } catch (error: any) {
        console.error('[Keywords] Error:', error);
        // Non-fatal: return empty keywords so the page still renders
        return NextResponse.json({ keywords: {} });
    }
}
