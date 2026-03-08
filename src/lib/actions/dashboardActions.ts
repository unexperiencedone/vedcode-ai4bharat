"use server";
import { db } from '@/lib/db';
import { architectureMetrics, conceptChangeLog, userConceptProgress, conceptCards, fileNodes } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function getArchitecturalHeatmap() {
    const metrics = await db.query.architectureMetrics.findMany({
        where: eq(architectureMetrics.nodeType, 'file'),
        limit: 20
    });
    
    const results = [];
    for (const m of metrics) {
        const file = await db.query.fileNodes.findFirst({
            where: eq(fileNodes.id, m.nodeId)
        });
        if (file) {
            results.push({
                name: file.path,
                stressScore: m.stressScore,
                couplingSize: Math.max((m.couplingScore || 0) * 20, 5) 
            });
        }
    }
    return results;
}

export async function getRecentConceptChanges(userId: string) {
    const logs = await db.query.conceptChangeLog.findMany({
        where: eq(conceptChangeLog.profileId, userId),
        orderBy: [desc(conceptChangeLog.timestamp)],
        limit: 10,
        with: {
            concept: true
        }
    });

    return logs.map(log => ({
        id: log.id,
        commitHash: log.commitHash || 'local',
        conceptName: log.concept.name,
        changeType: log.changeType as any,
        confidence: log.confidence,
        timestamp: log.timestamp,
        hasRegressionRisk: log.confidence < 0.5
    }));
}

export async function getUserCognitiveState(userId: string) {
    const progress = await db.query.userConceptProgress.findMany({
        where: eq(userConceptProgress.profileId, userId),
        with: {
            concept: true
        }
    });
    
    if (progress.length === 0) return null;
    
    const sorted = [...progress].sort((a, b) => (a.recallScore || 0) - (b.recallScore || 0));
    
    return {
        highestRisk: {
            name: sorted[0].concept.name,
            understandingScore: sorted[0].understandingScore || 0.1,
            recallScore: sorted[0].recallScore || 0.1,
            masteryLevel: sorted[0].masteryLevel as any || 'learning'
        },
        best: {
            name: sorted[sorted.length - 1].concept.name,
            understandingScore: sorted[sorted.length - 1].understandingScore || 0.9,
            recallScore: sorted[sorted.length - 1].recallScore || 0.9,
            masteryLevel: sorted[sorted.length - 1].masteryLevel as any || 'mastered'
        }
    };
}
