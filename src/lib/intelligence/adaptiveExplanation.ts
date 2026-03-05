import { db } from '../db';
import { conceptCards, learnerProfile } from '../../db/schema';
import { eq } from 'drizzle-orm';

export interface AdaptiveResponse {
    conceptId: string;
    name: string;
    oneLiner: string;
    mentalModel: string;
    explanation: string;
    difficulty: string;
    depth: string;
}

/**
 * Engine 1: Adaptive Explanation Engine
 * Selects the optimal slice of knowledge from a concept card based on the learner profile.
 */
export async function getAdaptiveExplanation(conceptId: string, profileId: string): Promise<AdaptiveResponse | null> {
    try {
        // 1. Fetch Profile and Concept Card
        const profile = await db.query.learnerProfile.findFirst({
            where: eq(learnerProfile.profileId, profileId)
        });

        const card = await db.query.conceptCards.findFirst({
            where: eq(conceptCards.id, conceptId)
        });

        if (!card || !profile) return null;

        // 2. Select Explanation Slice based on Skill Level
        let selectedExplanation = card.beginnerExplanation;
        let difficulty = 'beginner';

        if (profile.skillLevel === 'advanced') {
            selectedExplanation = card.advancedExplanation || card.intermediateExplanation || card.beginnerExplanation;
            difficulty = 'advanced';
        } else if (profile.skillLevel === 'intermediate') {
            selectedExplanation = card.intermediateExplanation || card.beginnerExplanation;
            difficulty = 'intermediate';
        }

        // 3. (Optional) In future, we can add LLM "Grounding" here to adapt to interest_domains
        // For now, we return the structured slice select

        return {
            conceptId: card.id,
            name: card.name,
            oneLiner: card.oneLiner || '',
            mentalModel: card.mentalModel || '',
            explanation: selectedExplanation || '',
            difficulty: difficulty,
            depth: profile.preferredDepth || 'balanced'
        };
    } catch (error: any) {
        console.error('Error in getAdaptiveExplanation:', error.message);
        return null;
    }
}
