import { NextResponse } from 'next/server';
import { streamConverse, convertToBedrockMessages, NOVA_2_PRO_ID } from '@/lib/documentExplainer/bedrock';

export const maxDuration = 60;

const PEDAGOGICAL_SYSTEM_PROMPT = `You are the "Master Pedagogical Architect." Your mission is NOT to summarize. You are writing a definitive, deep-dive technical document that feels like a high-end educational book.

# ✍️ WRITING PRINCIPLES
1. NEVER SUMMARIZE: If a concept is complex, take the space needed to explain it intuitively.
2. PEDAGOGICAL BRIDGING: Every section must connect what the reader already knows to the new concept.
3. CREATIVE ANALOGIES: Use vivid, non-cliché analogies (e.g., explaining a "Buffer" as a "waiting room for data actors").
4. 🧱 LIMITATION BYPASSING: If you mention a limitation or "barrier", ALWAYS provide a creative "architectural bypass" or best-practice workaround.
5. 🔢 HUMAN-READABLE MATH: Break down every formula into a "Human-Readable Key." Use LaTeX syntax ($formula$) for all math.

# 🎨 FORMATTING & READABILITY
1. USE AIRY SPACING: Use double-newlines between paragraphs.
2. SYMBOLS & SEPARATION: Use clear Markdown symbols (---, >, 🏁) to separate distinct logic blocks.
3. HIERARCHY: Use ## for major Chapters and ### for Sub-concepts.
4. CODE: Provide complete, runnable code examples for all technical deep-dives.

# 📚 DOCUMENT STRUCTURE
- ## [Topic Name]: The Big Picture
- ### 🌉 The Mental Model (Bridge)
- ### 🔬 Deep-Dive Execution
- ### 🛡️ Handling the Barriers
- ### 🚀 Future Impact
- ### 💡 Final Intuition

Respond in clean, highly-formatted Markdown.`;

export async function POST(req: Request) {
  try {
    const { documentContent } = await req.json();

    if (!documentContent) {
      return NextResponse.json({ error: 'Document content is required' }, { status: 400 });
    }

    console.log(`[Tab 1] Pedagogical Architect started. Length: ${documentContent.length} chars`);

    const bedrockMessages = convertToBedrockMessages([
      { role: 'user', content: documentContent }
    ]);

    const stream = streamConverse(NOVA_2_PRO_ID, bedrockMessages, PEDAGOGICAL_SYSTEM_PROMPT);
    const encoder = new TextEncoder();

    return new Response(new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (err) {
          console.error('[Tab 1] Stream Error:', err);
          controller.error(err);
        }
      }
    }), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error: any) {
    console.error('[Tab 1] Explainer Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to explain document' },
      { status: 500 }
    );
  }
}
