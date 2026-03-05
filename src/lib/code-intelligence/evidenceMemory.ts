import { db } from "../db";
import { mentorEvidencePatterns, mentorInsightLog } from "../../db/schema";
import { eq, and } from "drizzle-orm";

export async function logInsight(
    profileId: string, 
    insightType: string, 
    contextFileId: string | null, 
    confidenceScore: number
) {
    // 24 hour cooldown for the same insight type
    const cooldownDate = new Date();
    cooldownDate.setHours(cooldownDate.getHours() + 24);

    await db.insert(mentorInsightLog).values({
        profileId,
        insightType,
        contextFileId,
        confidenceScore,
        cooldownUntil: cooldownDate
    });
}

export async function isInsightOnCooldown(profileId: string, insightType: string): Promise<boolean> {
    const logs = await db
        .select()
        .from(mentorInsightLog)
        .where(
            and(
                eq(mentorInsightLog.profileId, profileId),
                eq(mentorInsightLog.insightType, insightType)
            )
        )
        .orderBy((fields) => fields.shownAt)
        .limit(1);

    if (logs.length === 0) return false;

    return new Date() < logs[0].cooldownUntil;
}

export async function updateEvidencePattern(
    profileId: string, 
    patternType: string, 
    confidenceScore: number, 
    relatedConcepts: string[]
) {
    const existing = await db
        .select()
        .from(mentorEvidencePatterns)
        .where(
            and(
                eq(mentorEvidencePatterns.profileId, profileId),
                eq(mentorEvidencePatterns.patternType, patternType)
            )
        )
        .limit(1);

    if (existing.length > 0) {
        // Increase occurrence count and update confidence & related concepts
        const currentPattern = existing[0];
        
        // Merge concepts and remove duplicates
        const updatedConcepts = [...new Set([...(currentPattern.relatedConcepts as string[] || []), ...relatedConcepts])];
        
        // Rolling average or max confidence score
        const newConfidence = Math.max(currentPattern.confidenceScore, confidenceScore);

        await db.update(mentorEvidencePatterns)
            .set({
                occurrenceCount: currentPattern.occurrenceCount + 1,
                confidenceScore: newConfidence,
                lastDetectedAt: new Date(),
                relatedConcepts: updatedConcepts
            })
            .where(eq(mentorEvidencePatterns.id, currentPattern.id));
    } else {
        // Insert new pattern
        await db.insert(mentorEvidencePatterns).values({
            profileId,
            patternType,
            confidenceScore,
            relatedConcepts
        });
    }
}

export async function getActivePatterns(profileId: string) {
    return await db
        .select()
        .from(mentorEvidencePatterns)
        .where(eq(mentorEvidencePatterns.profileId, profileId));
}
