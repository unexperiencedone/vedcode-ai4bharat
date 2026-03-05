import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conceptCards, userConceptProgress } from "@/db/schema";
import { eq, ilike, and } from "drizzle-orm";
import { getAdaptiveExplanation } from "@/lib/intelligence/adaptiveExplanation";
import { getConceptGaps } from "@/lib/intelligence/learningPath";
import { generateText } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { GroundingEngine } from "@/lib/code-intelligence/groundingEngine";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { keyword, profileId } = body;

        if (!keyword) {
            return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
        }

        // 1. Attempt to find the concept card (slug match or name match)
        let card = await db.query.conceptCards.findFirst({
            where: eq(conceptCards.slug, keyword.toLowerCase().replace(/\s+/g, '-'))
        });

        if (!card) {
            card = await db.query.conceptCards.findFirst({
                where: ilike(conceptCards.name, keyword)
            });
        }

        // 2. If card found, use Engine 1: Adaptive Explanation
        if (card && profileId) {
            const adaptive = await getAdaptiveExplanation(card.id, profileId);
            const gaps = await getConceptGaps(card.id, profileId);

            // Fetch current progress
            const progress = await db.query.userConceptProgress.findFirst({
                where: and(
                    eq(userConceptProgress.profileId, profileId),
                    eq(userConceptProgress.conceptId, card.id)
                )
            });

            if (adaptive) {
                return NextResponse.json({
                    explanation: adaptive,
                    gaps: gaps,
                    mastery: {
                        understanding: progress?.understandingScore || 0,
                        recall: progress?.recallScore || 0,
                        level: progress?.masteryLevel || 'learning'
                    },
                    source: 'knowledge_base'
                });
            }
        }

        // 3. Fallback: Grounded LLM Response (Mistral Large - AWS Bedrock)
        const grounding = new GroundingEngine();
        const context = await grounding.getContext(keyword);
        const groundingContext = grounding.formatContextToPrompt(context);

        const prompt = `
            You are an elite developer mentor for Ved Code. 
            The user is asking about: "${keyword}".
            
            ${groundingContext}
            
            TASK:
            1. Provide a brilliantly clear, concise explanation structured in Markdown.
            2. If knowledge grounding is provided above, reference EXACT symbols and files from the user's project to illustrate your point.
            3. Address any architectural stress (fragility) mentioned in the grounding.
            
            ### Contextual Snippet
            (Use a snippet from the grounding if available, otherwise a generic realistic one).
            
            ### Theory
            2 paragraphs explaining the core concept.
            
            ### Project Application
            1 paragraph on how this specific project implements or should implement this concept.
        `;

        const { text } = await generateText({
            model: bedrock("mistral.mistral-large-2402-v1:0"),
            prompt: prompt
        });

        return NextResponse.json({
            explanation: {
                name: keyword,
                explanation: text,
                difficulty: 'unknown'
            },
            source: context.concept ? 'grounded_llm' : 'llm_fallback'
        });

    } catch (error: any) {
        console.error("Learn API Error:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

