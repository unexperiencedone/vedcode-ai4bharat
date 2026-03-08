import { db } from "@/lib/db";
import { conceptCards, conceptExamples, conceptRelationships, learningRoadmaps, technologies } from "@/db/schema";
import { generateText } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

export interface IngestionResult {
    success: boolean;
    conceptsAdded: number;
    error?: string;
}

export class DocIngestor {
    /**
     * Ingests documentation from a URL and converts it into structured ConceptCards.
     * @param url The documentation URL to scrape.
     * @param technologySlug The technology slug (e.g., 'nextjs', 'zod').
     * @param isSequential Whether to generate a linear roadmap from this source.
     */
    static async ingestFromUrl(url: string, technologySlug: string, isSequential: boolean = true): Promise<IngestionResult> {
        try {
            // 1. Fetch Tech ID
            const tech = await db.query.technologies.findFirst({
                where: eq(technologies.slug, technologySlug)
            });

            if (!tech) {
                return { success: false, conceptsAdded: 0, error: `Technology '${technologySlug}' not found.` };
            }

            // 2. Fetch Content (Simulated as we can't call internal tools directly here, we'll assume content is passed or fetched via a helper)
            // For now, we'll use a placeholder for the content fetching logic.
            // In a real environment, this would call a scraper or fetch utility.
            const rawMarkdown = await this.scrapeUrl(url);

            if (!rawMarkdown || rawMarkdown.length < 100) {
                return { success: false, conceptsAdded: 0, error: "Failed to fetch sufficient content from URL." };
            }

            // 3. LLM Extraction
            const { text } = await generateText({
                model: bedrock("mistral.mistral-large-2402-v1:0"),
                prompt: `
                    You are an expert technical writer and curriculum designer.
                    Extract structured concepts from the following documentation:
                    
                    URL: ${url}
                    TECH: ${tech.name}
                    
                    CONTENT:
                    ${rawMarkdown.substring(0, 15000)} // Truncated for context limits
                    
                    TASK:
                    1. Identify discrete concepts/topics discussed in this documentation.
                    2. For each concept, extract:
                       - Name and internal slug.
                       - Section name (e.g., 'Getting Started', 'Hooks', 'Architecture').
                       - A one-liner mental model.
                       - Beginner, Intermediate, and Advanced explanations.
                       - At least one code example with its language.
                       - Prerequisites: which concepts MUST be learned before this? (return by slug).
                       - Related Concepts: which concepts are laterally related to this? (return by slug).
                       - Logical order index for a step-by-step tutorial.
                    
                    Return EXACTLY this JSON format:
                    {
                        "concepts": [
                            {
                                "name": "Concept Name",
                                "slug": "concept-slug",
                                "section": "Section Name",
                                "oneLiner": "...",
                                "mentalModel": "...",
                                "explanations": {
                                    "beginner": "...",
                                    "intermediate": "...",
                                    "advanced": "..."
                                },
                                "examples": [
                                    { "title": "...", "code": "...", "language": "...", "type": "minimal|real_world" }
                                ],
                                "prerequisites": ["slug1", "slug2"],
                                "relatedConcepts": ["slug3"],
                                "orderIndex": 1
                            }
                        ]
                    }
                `,
            });

            const data = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);
            
            if (!data.concepts || !Array.isArray(data.concepts)) {
                return { success: false, conceptsAdded: 0, error: "LLM failed to return a valid concept list." };
            }

            let addedCount = 0;
            const slugToIdMap = new Map<string, string>();

            // 4. Batch Insert (Simplified Loop)
            for (const concept of data.concepts) {
                const cardId = uuidv4();
                
                // Insert Card
                await db.insert(conceptCards).values({
                    id: cardId,
                    technologyId: tech.id,
                    slug: concept.slug,
                    name: concept.name,
                    section: concept.section,
                    orderIndex: concept.orderIndex,
                    oneLiner: concept.oneLiner,
                    mentalModel: concept.mentalModel,
                    beginnerExplanation: concept.explanations.beginner,
                    intermediateExplanation: concept.explanations.intermediate,
                    advancedExplanation: concept.explanations.advanced,
                });

                slugToIdMap.set(concept.slug, cardId);

                // Insert Examples
                for (const ex of concept.examples) {
                    await db.insert(conceptExamples).values({
                        conceptId: cardId,
                        exampleType: ex.type || 'minimal',
                        title: ex.title,
                        code: ex.code,
                        language: ex.language,
                    });
                }

                // Insert into Roadmap if sequential
                if (isSequential) {
                    await db.insert(learningRoadmaps).values({
                        technologyId: tech.id,
                        topic: concept.name,
                        orderIndex: concept.orderIndex,
                        conceptId: cardId,
                    });
                }

                addedCount++;
            }

            // 5. Build Relationships
            // 5a. First, collect all IDs (including those already existing in the DB for this tech to link across ingestion runs)
            const allTechConcepts = await db.query.conceptCards.findMany({
                where: eq(conceptCards.technologyId, tech.id),
                columns: { id: true, slug: true }
            });
            allTechConcepts.forEach(c => slugToIdMap.set(c.slug, c.id));

            // 5b. Insert Relationships
            for (const concept of data.concepts) {
                const sourceId = slugToIdMap.get(concept.slug);
                if (!sourceId) continue;

                // Handle Prerequisites (depends_on)
                for (const prereqSlug of (concept.prerequisites || [])) {
                    const targetId = slugToIdMap.get(prereqSlug);
                    if (targetId) {
                        try {
                            await db.insert(conceptRelationships).values({
                                sourceConceptId: sourceId,
                                targetConceptId: targetId,
                                relationType: 'depends_on',
                            });
                        } catch (e) {
                            console.log("Relationship might already exist.", e);
                        }
                    }
                }
                
                // Handle Related Concepts (related_to)
                for (const relatedSlug of (concept.relatedConcepts || [])) {
                    const targetId = slugToIdMap.get(relatedSlug);
                    if (targetId) {
                        try {
                            // Bi-directional 'related_to' edge
                            await db.insert(conceptRelationships).values({
                                sourceConceptId: sourceId,
                                targetConceptId: targetId,
                                relationType: 'related_to',
                            });
                        } catch(e) {}
                    }
                }
            }

            return { success: true, conceptsAdded: addedCount };

        } catch (error: any) {
            console.error("Ingestion Error:", error);
            return { success: false, conceptsAdded: 0, error: error.message };
        }
    }

    /**
     * Fetches a URL and returns its text content.
     * Strips HTML tags for clean text that the LLM can process.
     */
    private static async scrapeUrl(url: string): Promise<string> {
        try {
            const response = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; VedCode-DocIngestor/1.0)",
                    "Accept": "text/html,text/plain,*/*",
                },
                signal: AbortSignal.timeout(15000), // 15s timeout
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} fetching ${url}`);
            }

            const contentType = response.headers.get("content-type") || "";
            const rawText = await response.text();

            if (contentType.includes("text/plain") || url.endsWith(".md")) {
                return rawText;
            }

            // Strip HTML tags, clean up whitespace
            const plainText = rawText
                .replace(/<script[\s\S]*?<\/script>/gi, "")
                .replace(/<style[\s\S]*?<\/style>/gi, "")
                .replace(/<[^>]+>/g, " ")
                .replace(/&nbsp;/g, " ")
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/\s{3,}/g, "\n\n")
                .trim();

            return plainText;
        } catch (err: any) {
            throw new Error(`Failed to scrape ${url}: ${err.message}`);
        }
    }
}
