import { NextResponse } from "next/server";
import { generateText } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { GroundingEngine } from "@/lib/code-intelligence/groundingEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { keyword } = body;

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    // Use the same GroundingEngine as the Learn API for project-aware context
    const grounding = new GroundingEngine();
    const context = await grounding.getContext(keyword);
    const groundingContext = grounding.formatContextToPrompt(context);

    const { text } = await generateText({
      model: bedrock("mistral.mistral-large-2402-v1:0"),
      prompt: `You are a Just-In-Time (JIT) developer mentor. The user highlighted the term "${keyword}" in their codebase and wants a quick, focused explanation.

${groundingContext}

Provide a concise but precise explanation:
1. What "${keyword}" is and the core mental model behind it.
2. How it is used (one minimal code example).
3. If project context is available above, reference how it appears or should appear in THIS project specifically.

Keep it under 200 words. Be direct and practical.`,
    });

    return NextResponse.json({ explanation: text, keyword });
  } catch (error: any) {
    console.error("[ExplainKeyword]", error.message);
    return NextResponse.json({ error: "Failed to explain keyword" }, { status: 500 });
  }
}
