import { db } from "../db";
import { conceptUsage, conceptCards } from "../../db/schema";
import { eq, inArray } from "drizzle-orm";

export interface ImpactedConcept {
    conceptId: string;
    slug: string;
    name: string;
    confidence: number;
}

/**
 * Concept Impact Engine
 * Resolves the learning concepts affected by changes in symbols.
 */
export class ConceptImpact {

    /**
     * Finds all concepts mapped to a set of impacted symbol IDs.
     */
    async getImpactedConcepts(symbolIds: string[]): Promise<ImpactedConcept[]> {
        if (symbolIds.length === 0) return [];

        const usages = await db.select({
            conceptId: conceptUsage.conceptId,
            confidence: conceptUsage.confidence,
            slug: conceptCards.slug,
            name: conceptCards.name,
        })
            .from(conceptUsage)
            .innerJoin(conceptCards, eq(conceptUsage.conceptId, conceptCards.id))
            .where(inArray(conceptUsage.symbolId, symbolIds));

        // Deduplicate concepts and keep highest confidence
        const conceptMap = new Map<string, ImpactedConcept>();
        usages.forEach(u => {
            if (!conceptMap.has(u.slug) || (u.confidence || 0) > conceptMap.get(u.slug)!.confidence) {
                conceptMap.set(u.slug, {
                    conceptId: u.conceptId,
                    slug: u.slug,
                    name: u.name,
                    confidence: u.confidence || 1.0
                });
            }
        });

        return Array.from(conceptMap.values());
    }
}
