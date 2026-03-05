import * as dotenv from 'dotenv';
dotenv.config();
import { embedText } from '../lib/vedacode/embeddings';
import { db } from '../lib/db';
import { conceptCards, conceptExamples, conceptQuizzes, conceptRelationships, technologies } from '../db/schema';
import { technologySeeds } from './conceptSeeds';
import { generateObject } from 'ai';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';

const bedrock = createAmazonBedrock({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
});
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const ConceptCardSchema = z.object({
    concept_name: z.string(),
    aliases: z.array(z.string()),
    one_liner: z.string(),
    mental_model: z.string(),
    beginner_explanation: z.string(),
    intermediate_explanation: z.string(),
    advanced_explanation: z.string(),
    prerequisites: z.array(z.string()),
    related_concepts: z.array(z.string()),
    examples: z.array(z.object({
        type: z.enum(['minimal', 'real_world', 'anti_pattern']),
        title: z.string(),
        description: z.string(),
        code: z.string(),
        language: z.string(),
    })),
    quiz: z.object({
        question: z.string(),
        option_a: z.string(),
        option_b: z.string(),
        option_c: z.string(),
        option_d: z.string(),
        correct_option: z.enum(['A', 'B', 'C', 'D']),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    })
});

export async function generateCardsForTech(techSlug: string) {
    console.log(`\n--- Starting generation for ${techSlug} ---`);

    const seedTech = technologySeeds.find(s => s.slug === techSlug);
    if (!seedTech) throw new Error("Technology not found in seeds");

    // Ensure technology exists in DB
    let techRow = await db.query.technologies.findFirst({
        where: eq(technologies.slug, techSlug)
    });

    if (!techRow) {
        const [newTech] = await db.insert(technologies).values({
            slug: seedTech.slug,
            name: seedTech.name,
            category: seedTech.category,
            officialDocsUrl: seedTech.officialDocsUrl,
        }).returning();
        techRow = newTech;
        console.log(`Created technology: ${seedTech.name}`);
    }

    const unmappedRelationships: Array<{
        sourceCardId: string;
        prerequisites: string[];
        related: string[];
    }> = [];

    for (const concept of seedTech.concepts) {
        console.log(`\nGenerating concept: ${concept.name}`);

        // Check if already exists
        const existing = await db.query.conceptCards.findFirst({
            where: (cards: any, { eq, and }: any) => and(
                eq(cards.technologyId, techRow!.id),
                eq(cards.name, concept.name)
            )
        });

        if (existing) {
            console.log(`Skipping ${concept.name} - already exists.`);
            // if it exists we still might want to resolve its relationships? For now just skip.
            continue;
        }

        try {
            const { object: card } = await generateObject({
                model: bedrock('mistral.mistral-large-2402-v1:0'),
                schema: ConceptCardSchema,
                system: `You are an expert developer building a canonical knowledge base. Create a highly accurate concept card for the programming concept.`,
                prompt: `Technology: ${seedTech.name}\nConcept: ${concept.name}\n\nReturn ONLY a valid JSON object matching the schema. No markdown format wrappers. Provide deep, accurate, and insightful explanations. Examples should be realistic and compilable.`
            });

            console.log(`✔ Generated card for ${concept.name}`);

            // Generate embedding
            const embeddingText = `${card.concept_name}. ${card.one_liner} ${card.beginner_explanation}`;
            const embedding = await embedText(embeddingText);

            // Insert into DB inside a transaction
            await db.transaction(async (tx: any) => {
                // 1. Insert Concept Card
                const [insertedCard] = await tx.insert(conceptCards).values({
                    technologyId: techRow!.id,
                    slug: concept.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    name: card.concept_name,
                    aliases: card.aliases,
                    oneLiner: card.one_liner,
                    mentalModel: card.mental_model,
                    beginnerExplanation: card.beginner_explanation,
                    intermediateExplanation: card.intermediate_explanation,
                    advancedExplanation: card.advanced_explanation,
                    embedding: embedding,
                    isVerified: true, // auto-verifying for V1 batch
                }).returning();

                if (!insertedCard) {
                    throw new Error(`Failed to insert concept card for ${concept.name}`);
                }

                // 2. Insert Examples
                for (const ex of card.examples) {
                    await tx.insert(conceptExamples).values({
                        conceptId: insertedCard.id,
                        exampleType: ex.type,
                        title: ex.title,
                        description: ex.description,
                        code: ex.code,
                        language: ex.language,
                    });
                }

                // 3. Insert Quiz
                await tx.insert(conceptQuizzes).values({
                    conceptId: insertedCard.id,
                    question: card.quiz.question,
                    optionA: card.quiz.option_a,
                    optionB: card.quiz.option_b,
                    optionC: card.quiz.option_c,
                    optionD: card.quiz.option_d,
                    correctOption: card.quiz.correct_option,
                    difficulty: card.quiz.difficulty,
                });

                unmappedRelationships.push({
                    sourceCardId: insertedCard.id,
                    prerequisites: card.prerequisites || [],
                    related: card.related_concepts || []
                });
            });

            console.log(`✔ Stored ${concept.name} successfully.`);
        } catch (err: any) {
            console.error(`✖ Failed to generate/store ${concept.name}:`, err.message);
        }
    }

    console.log(`\n--- Resolving Graph Relationships for ${techSlug} ---`);
    // Pass 2: Resolve Relationships
    // Fetch all concepts for this tech to use for resolution
    const techConcepts = await db.query.conceptCards.findMany({
        where: eq(conceptCards.technologyId, techRow!.id)
    });

    for (const rels of unmappedRelationships) {
        for (const prereq of rels.prerequisites) {
            // Find the closest matching concept by name
            const target = techConcepts.find(c =>
                c.name.toLowerCase() === prereq.toLowerCase() ||
                (c.aliases as string[] || []).map(a => a.toLowerCase()).includes(prereq.toLowerCase())
            );
            if (target) {
                await db.insert(conceptRelationships).values({
                    sourceConceptId: rels.sourceCardId,
                    targetConceptId: target.id,
                    relationType: 'depends_on'
                }).catch(() => { }); // ignore duplicates
            }
        }

        for (const related of rels.related) {
            const target = techConcepts.find(c =>
                c.name.toLowerCase() === related.toLowerCase() ||
                (c.aliases as string[] || []).map(a => a.toLowerCase()).includes(related.toLowerCase())
            );
            if (target && target.id !== rels.sourceCardId) {
                await db.insert(conceptRelationships).values({
                    sourceConceptId: rels.sourceCardId,
                    targetConceptId: target.id,
                    relationType: 'related_to'
                }).catch(() => { });
            }
        }
    }
    console.log("Relationship resolution complete.");
}

// To run this standalone:
async function run() {
    const target = process.argv[2];
    if (!target) {
        console.log("Usage: npx tsx src/scripts/generateConceptCards.ts <technology_slug>");
        return;
    }
    await generateCardsForTech(target);
    console.log("\nDone.");
    process.exit(0);
}

if (typeof require !== 'undefined' && require.main === module) {
    run();
}
