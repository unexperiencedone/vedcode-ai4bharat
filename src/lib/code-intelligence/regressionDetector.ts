import { db } from "../db";
import { conceptChangeLog, userConceptProgress, architectureMetrics, conceptCards } from "../../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { generateMentorInsights } from "./mentorInsightEngine";

export interface FailureContext {
    profileId: string;
    commitHash: string;
    errorMessage: string;
    failedFileId?: string;
}

export interface RegressionInsight {
    conceptName: string;
    changeType: string;
    riskScore: number;
    understandingScore: number;
    recallScore: number;
    insightMessage: string;
}

export class RegressionCorrelationEngine {
    
    /**
     * Reconstructs the human knowledge gap that caused a build/test failure.
     */
    async analyzeFailure(context: FailureContext): Promise<RegressionInsight[]> {
        // 1. Get the concepts modified in this specific commit
        const recentChanges = await db.select({
            conceptId: conceptChangeLog.conceptId,
            changeType: conceptChangeLog.changeType,
            fileId: conceptChangeLog.fileId,
            symbolId: conceptChangeLog.symbolId
        })
        .from(conceptChangeLog)
        .where(
            and(
                eq(conceptChangeLog.profileId, context.profileId),
                eq(conceptChangeLog.commitHash, context.commitHash)
            )
        )
        .orderBy(desc(conceptChangeLog.timestamp));

        if (recentChanges.length === 0) return [];

        const insights: RegressionInsight[] = [];

        // 2. Evaluate the risk score for each changed concept
        for (const change of recentChanges) {
            
            // Get Learner Mastery
            const masteryRecord = await db.select().from(userConceptProgress).where(
                and(
                    eq(userConceptProgress.profileId, context.profileId),
                    eq(userConceptProgress.conceptId, change.conceptId)
                )
            ).limit(1);

            const understandingScore = masteryRecord.length > 0 ? masteryRecord[0].understandingScore! : 0.1;
            const recallScore = masteryRecord.length > 0 ? masteryRecord[0].recallScore! : 0.1;
            const masteryLevel = (understandingScore + recallScore) / 2;

            // Get Architecture Stress
            const stressRecord = await db.select().from(architectureMetrics).where(
                eq(architectureMetrics.nodeId, change.fileId)
            ).limit(1);

            const architectureStress = stressRecord.length > 0 ? stressRecord[0].stressScore : 0.5;

            // Base concept impact (simplification: assume 0.8 for structural concepts)
            const conceptImpact = 0.8; 

            // The specific heuristic definition requested by the user:
            // risk_score = concept_impact * architecture_stress * (1 - mastery_level)
            const riskScore = conceptImpact * architectureStress * (1 - masteryLevel);

            if (riskScore > 0.3) {
                // Get Concept Info for the message
                const conceptInfo = await db.select().from(conceptCards).where(eq(conceptCards.id, change.conceptId)).limit(1);
                const conceptName = conceptInfo.length > 0 ? conceptInfo[0].name : "Unknown Concept";

                insights.push({
                    conceptName,
                    changeType: change.changeType,
                    riskScore,
                    understandingScore,
                    recallScore,
                    insightMessage: `Concept Regression Detected\n\nThe failure likely involves the ${conceptName} concept introduced/modified in your last commit. This concept currently has low recall strength (${(recallScore * 100).toFixed(0)}%) in your profile. Review ${conceptName} patterns to resolve the bug safely.`
                });
            }
        }

        // Return highest risk first
        return insights.sort((a, b) => b.riskScore - a.riskScore);
    }
}
