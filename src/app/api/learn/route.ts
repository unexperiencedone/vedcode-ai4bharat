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
                    explanation: {
                        theory: adaptive.explanation,
                        snippet: adaptive.mentalModel || "// Conceptual model here",
                        projectApplication: adaptive.oneLiner || "Project application logic."
                    },
                    gaps: gaps,
                    mastery: {
                        understanding: progress?.understandingScore || 0,
                        recall: progress?.recallScore || 0,
                        level: progress?.masteryLevel || 'learning',
                        groundingScore: 100,
                        isProjectSynced: true
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
            You are an elite developer mentor for VedCode. 
            The user is asking about: "${keyword}".
            
            ${groundingContext}
            
            TASK:
            1. Provide a brilliantly clear, concise explanation.
            2. If knowledge grounding is provided above, reference EXACT symbols and files from the user's project to illustrate your point.
            
            Return your response in EXACTLY this JSON format:
            {
              "theory": "markdown string (2 paragraphs)",
              "snippet": "string with EXACT raw code only (no markdown backticks, no text before/after code).",
              "language": "the programming language of the snippet (e.g. 'cpp', 'typescript', 'python')",
              "projectApplication": "markdown string on how THIS project uses or should use it (1 paragraph)"
            }
        `;

        const { text } = await generateText({
            model: bedrock("mistral.mistral-large-2402-v1:0"),
            prompt: prompt,
        });

        let structuredData;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            structuredData = JSON.parse(jsonMatch ? jsonMatch[0] : text);
        } catch (e) {
            structuredData = {
                theory: text,
                snippet: "",
                language: "typescript",
                projectApplication: "See the explanation above for context on how this concept applies."
            };
        }

        // Create or update progress for this concept exploration (ONLY if card exists)
        let progress;
        if (profileId && card) {
            progress = await db.query.userConceptProgress.findFirst({
                where: and(
                    eq(userConceptProgress.profileId, profileId),
                    eq(userConceptProgress.conceptId, card.id)
                )
            });

            if (!progress) {
                await db.insert(userConceptProgress).values({
                    profileId,
                    conceptId: card.id,
                    understandingScore: 0.1,
                    recallScore: 0,
                    masteryLevel: 'learning',
                    lastReviewed: new Date(),
                });

                progress = {
                    understandingScore: 0.1,
                    recallScore: 0,
                    masteryLevel: 'learning'
                };
            } else {
                await db.update(userConceptProgress)
                    .set({ lastReviewed: new Date() })
                    .where(and(
                        eq(userConceptProgress.profileId, profileId),
                        eq(userConceptProgress.conceptId, card.id)
                    ));
            }
        }

        return NextResponse.json({
            explanation: structuredData,
            mastery: {
                understanding: progress?.understandingScore || 0,
                recall: progress?.recallScore || 0,
                level: progress?.masteryLevel || (card ? 'learning' : 'unexplored'),
                groundingScore: context.usages.length > 0 ? 100 : 0,
                isProjectSynced: context.usages.length > 0
            },
            source: context.concept ? 'grounded_llm' : 'llm_fallback'
        });

    } catch (error: any) {
        console.error("Learn API Error:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
