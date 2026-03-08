"use server";
import { db } from '@/lib/db';
import { learningRoadmaps, conceptCards, technologies, userConceptProgress } from '@/db/schema';
import { eq, asc, and } from 'drizzle-orm';

export async function getLearningRoadmap(technologySlug: string) {
    const tech = await db.query.technologies.findFirst({
        where: eq(technologies.slug, technologySlug)
    });
    
    if (!tech) return [];

    return await db.query.learningRoadmaps.findMany({
        where: eq(learningRoadmaps.technologyId, tech.id),
        orderBy: [asc(learningRoadmaps.orderIndex)],
        with: {
            concept: true
        }
    });
}

export async function getUserMastery(userId: string) {
    const progress = await db.query.userConceptProgress.findMany({
        where: eq(userConceptProgress.profileId, userId),
        with: {
            concept: true
        }
    });
    
    const mastery: Record<string, number> = {};
    progress.forEach(p => {
        mastery[p.concept.slug] = p.recallScore || 0;
    });
    
    return mastery;
}

export async function updateConceptMastery(userId: string, conceptSlug: string, increment: number) {
    const concept = await db.query.conceptCards.findFirst({
        where: eq(conceptCards.slug, conceptSlug)
    });
    
    if (!concept) return;

    const existing = await db.query.userConceptProgress.findFirst({
        where: and(
            eq(userConceptProgress.profileId, userId),
            eq(userConceptProgress.conceptId, concept.id)
        )
    });

    if (existing) {
        await db.update(userConceptProgress)
            .set({ 
                recallScore: Math.min((existing.recallScore || 0) + increment, 1.0),
                lastReviewed: new Date()
            })
            .where(eq(userConceptProgress.id, existing.id));
    } else {
        await db.insert(userConceptProgress).values({
            profileId: userId,
            conceptId: concept.id,
            recallScore: increment,
            lastReviewed: new Date()
        });
    }
}
