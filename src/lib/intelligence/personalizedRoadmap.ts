import { db } from "@/lib/db";
import { conceptCards, technologies } from "@/db/schema";
import { generateText } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { eq, inArray } from "drizzle-orm";

export class PersonalizedRoadmap {
    /**
     * Generates a personalized roadmap of concepts based on a user's goal.
     * @param goal Natural language goal (e.g. "How do I implement authentication?")
     * @param techSlug The technology to scope the roadmap to (e.g., "nextjs")
     */
    static async generate(goal: string, techSlug: string) {
        // 1. Fetch available concepts for the tech
        const tech = await db.query.technologies.findFirst({
            where: eq(technologies.slug, techSlug)
        });

        if (!tech) throw new Error("Technology not found");

        const availableCards = await db.query.conceptCards.findMany({
            where: eq(conceptCards.technologyId, tech.id),
        });

        if (availableCards.length === 0) {
            throw new Error("No concepts found for this technology.");
        }

        // Prepare concept catalog for the LLM
        const catalogContext = availableCards.map(c => 
            `- [${c.slug}] ${c.name}: ${c.oneLiner}`
        ).join("\n");

        // 2. Query LLM to sequence the best concepts
        const prompt = `
            You are an expert technical curriculum designer.
            A user wants to achieve this goal: "${goal}"
            in the technology: "${tech.name}".

            Here are the available concepts in our knowledge base:
            ${catalogContext}

            Select the absolute best combination of these concepts and put them in a logical, step-by-step learning sequence to help the user achieve their goal.

            Return EXACTLY this JSON format:
            {
                "sequence": [
                    { "slug": "concept-slug", "reasoning": "Why this step is necessary for their goal" }
                ],
                "roadmapTitle": "A catchy title for this custom roadmap"
            }
        `;

        const { text } = await generateText({
            model: bedrock("mistral.mistral-large-2402-v1:0"),
            prompt: prompt,
        });

        const data = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);

        if (!data.sequence || !Array.isArray(data.sequence)) {
            throw new Error("Failed to generate sequence.");
        }

        // 3. Map returned slugs back to real concept data
        const sequenceSlugs = data.sequence.map((s: any) => s.slug);
        
        // Ensure we only query for slugs that actually exist
        const validSlugs = sequenceSlugs.filter((s: string) => availableCards.some(c => c.slug === s));

        if (validSlugs.length === 0) {
          throw new Error("No valid concepts matched the sequence.");
        }

        const selectedCards = await db.query.conceptCards.findMany({
            where: inArray(conceptCards.slug, validSlugs)
        });

        // 4. Assemble the final roadmap array combining DB data and LLM reasoning
        const roadmapSteps = data.sequence
            .map((step: any, index: number) => {
                const card = selectedCards.find(c => c.slug === step.slug);
                if (!card) return null;
                
                return {
                    slug: card.slug,
                    name: card.name,
                    reasoning: step.reasoning,
                    orderIndex: index
                };
            })
            .filter(Boolean);

        return {
            title: data.roadmapTitle,
            steps: roadmapSteps
        };
    }
}
