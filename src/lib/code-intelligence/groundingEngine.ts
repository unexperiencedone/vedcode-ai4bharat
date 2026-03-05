import { db } from "../db";
import { conceptCards, conceptUsage, symbolNodes, fileNodes, architectureMetrics } from "../../db/schema";
import { eq, ilike, and, inArray } from "drizzle-orm";

export interface GroundedContext {
    concept: {
        name: string;
        definition: string;
        slug: string;
    } | null;
    usages: {
        fileName: string;
        symbolName: string;
        snippet: string;
        stressScore: number;
    }[];
}

/**
 * Grounding Engine
 * Connects the Codebase Graph to the LLM reasoning layer.
 */
export class GroundingEngine {

    /**
     * Retrieves rich context from the graph based on a user query/keyword.
     */
    async getContext(keyword: string): Promise<GroundedContext> {
        // 1. Find the concept
        const card = await db.query.conceptCards.findFirst({
            where: eq(conceptCards.slug, keyword.toLowerCase().replace(/\s+/g, '-'))
        }) || await db.query.conceptCards.findFirst({
            where: ilike(conceptCards.name, keyword)
        });

        if (!card) {
            return { concept: null, usages: [] };
        }

        // 2. Find usages in the codebase
        const usages = await db.query.conceptUsage.findMany({
            where: eq(conceptUsage.conceptId, card.id),
            limit: 3,
            with: {
                file: true,
                symbol: true
            }
        });

        // 3. For each usage, fetch stress metrics
        const groundedUsages = await Promise.all(usages.map(async (u) => {
            const metrics = await db.query.architectureMetrics.findFirst({
                where: eq(architectureMetrics.nodeId, u.symbol?.id || u.fileId)
            });

            return {
                fileName: u.file.path,
                symbolName: u.symbol?.name || "Module Scope",
                snippet: u.symbol?.signature || "No signature available",
                stressScore: metrics?.stressScore || 0
            };
        }));

        return {
            concept: {
                name: card.name,
                definition: card.oneLiner,
                slug: card.slug
            },
            usages: groundedUsages
        };
    }

    /**
     * Formats the context into a prompt-friendly string.
     */
    formatContextToPrompt(context: GroundedContext): string {
        if (!context.concept) return "No specific project concepts found for this query.";

        let prompt = `KNOWLEDGE GROUNDING:
The concept "${context.concept.name}" (${context.concept.definition}) is implemented in the following parts of the project:

`;

        context.usages.forEach((u, i) => {
            prompt += `${i + 1}. File: ${u.fileName}
   Symbol: ${u.symbolName}
   Signature: \`${u.snippet}\`
   Architectural Stress: ${u.stressScore > 0.7 ? "CRITICAL (Fragile)" : u.stressScore > 0.4 ? "MEDIUM" : "STABLE"}
   
`;
        });

        return prompt;
    }
}
