import { db } from '../db';
import { userConceptProgress, conceptCards, learningRoadmaps } from '../../db/schema';
import { eq, and, asc, notInArray } from 'drizzle-orm';

/**
 * Recommendation Engine
 * Handles memory decay (Ebbinghaus) and suggests what to learn next.
 */

/**
 * Calculates decayed familiarity score based on time passed since last review.
 * Simplistic Ebbinghaus approximation.
 */
export function calculateDecayedScore(baseScore: number, lastReviewed: Date): number {
    const now = new Date();
    const hoursPassed = (now.getTime() - lastReviewed.getTime()) / (1000 * 60 * 60);
    
    // Half-life of 24 hours for fresh knowledge, longer for established knowledge
    // Stability factor (S) increases as mastery increases
    const stability = baseScore * 48; // Simple proxy
    const lambda = 0.693 / Math.max(1, stability);
    
    return baseScore * Math.exp(-lambda * hoursPassed);
}

/**
 * Suggests the next concept to learn based on current technology roadmap.
 */
export async function getNextStep(profileId: string, technologyId: string) {
    try {
        // 1. Get user's mastered/learning concepts
        const progress = await db.query.userConceptProgress.findMany({
            where: eq(userConceptProgress.profileId, profileId)
        });

        const masteredIds = progress
            .filter(p => (p.understandingScore || 0) > 0.7)
            .map(p => p.conceptId);

        // 2. Find the earliest roadmap item NOT mastered
        const roadmapItem = await db.query.learningRoadmaps.findFirst({
            where: and(
                eq(learningRoadmaps.technologyId, technologyId),
                masteredIds.length > 0 ? notInArray(learningRoadmaps.conceptId, masteredIds) : undefined
            ),
            orderBy: [asc(learningRoadmaps.orderIndex)]
        });

        if (!roadmapItem) return null;

        // 3. Fetch the concept card
        return await db.query.conceptCards.findFirst({
            where: eq(conceptCards.id, roadmapItem.conceptId)
        });

    } catch (error: any) {
        console.error('Error in getNextStep:', error.message);
        return null;
    }
}

/**
 * Gets a combined mastery score (understanding + recall) for a given concept slug.
 */
export async function getMasteryScore(profileId: string, conceptSlug: string): Promise<number> {
    try {
        const concept = await db.query.conceptCards.findFirst({
            where: eq(conceptCards.slug, conceptSlug)
        });
        
        if (!concept) return 0.2; // default if not found

        const progress = await db.query.userConceptProgress.findFirst({
            where: and(
                eq(userConceptProgress.profileId, profileId),
                eq(userConceptProgress.conceptId, concept.id)
            )
        });

        if (!progress) return 0.2; // default low mastery

        return ((progress.understandingScore || 0) * 0.45) + ((progress.recallScore || 0) * 0.55);
    } catch (e) {
        return 0.2; // fallback
    }
}
