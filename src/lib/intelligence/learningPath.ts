import { db } from '../db';
import { conceptRelationships, userConceptProgress, conceptCards } from '../../db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export interface ConceptGap {
    missingConceptId: string;
    name: string;
    slug: string;
    masteryLevel: string;
}

/**
 * Engine 3: Learning Path Engine
 * Detects missing knowledge (Concept Gaps) based on dependency graph + user progress.
 */
export async function getConceptGaps(conceptId: string, profileId: string): Promise<ConceptGap[]> {
    try {
        // 1. Fetch all dependencies (prerequisites) for this concept
        const dependencies = await db.query.conceptRelationships.findMany({
            where: and(
                eq(conceptRelationships.targetConceptId, conceptId),
                eq(conceptRelationships.relationType, 'depends_on')
            )
        });

        if (dependencies.length === 0) return [];

        const sourceIds = dependencies.map(d => d.sourceConceptId);

        // 2. Fetch user's progress for these specific dependencies
        const progress = await db.query.userConceptProgress.findMany({
            where: and(
                eq(userConceptProgress.profileId, profileId),
                inArray(userConceptProgress.conceptId, sourceIds)
            )
        });

        // 3. Any dependency NOT in the progress table OR with understanding < 0.4 is a gap
        const masteredIds = new Set(
            progress
                .filter(p => (p.understandingScore || 0) >= 0.4)
                .map(p => p.conceptId)
        );

        const gapIds = sourceIds.filter(id => !masteredIds.has(id));

        if (gapIds.length === 0) return [];

        // 4. Fetch the names/slugs of the gap concepts
        const gaps = await db.query.conceptCards.findMany({
            where: inArray(conceptCards.id, gapIds)
        });

        return gaps.map(g => {
            const up = progress.find(p => p.conceptId === g.id);
            return {
                missingConceptId: g.id,
                name: g.name,
                slug: g.slug,
                masteryLevel: up?.masteryLevel || 'unvisited'
            };
        });

    } catch (error: any) {
        console.error('Error in getConceptGaps:', error.message);
        return [];
    }
}
