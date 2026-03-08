"use server";
import { db } from '@/lib/db';
import { architectureMetrics, fileNodes, userConceptProgress, conceptCards, conceptUsage } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getFileMetrics(filePath: string, userId: string) {
    const file = await db.query.fileNodes.findFirst({
        where: eq(fileNodes.path, filePath)
    });

    if (!file) {
        return { stressScore: 0, learningGaps: [] };
    }

    const metrics = await db.query.architectureMetrics.findFirst({
        where: eq(architectureMetrics.nodeId, file.id)
    });

    // Find concepts used in this file where user has low mastery
    const usage = await db.query.conceptUsage.findMany({
        where: eq(conceptUsage.fileId, file.id),
        with: {
            concept: true
        }
    });


    const gaps: string[] = [];
    for (const u of usage) {
        const progress = await db.query.userConceptProgress.findFirst({
            where: and(
                eq(userConceptProgress.profileId, userId),
                eq(userConceptProgress.conceptId, u.conceptId)
            )
        });

        if (!progress || (progress.understandingScore || 0) < 0.6) {
            gaps.push(u.concept.name);
        }
    }

    return {
        stressScore: metrics?.stressScore || 0,
        learningGaps: gaps
    };
}
