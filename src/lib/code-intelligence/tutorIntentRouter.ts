import { db } from '@/lib/db';
import { 
    conceptUsage, 
    fileNodes, 
    architectureMetrics, 
    conceptChangeLog,
    conceptCards
} from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getMasteryScore } from '@/lib/intelligence/recommendationEngine';
import { TutorIntent, ReasoningContext } from '@/lib/types/tutor';

export { type TutorIntent, type ReasoningContext };

export class TutorIntentRouter {
    static detectIntent(query: string): TutorIntent {
        const q = query.toLowerCase();
        if (q.includes('fail') || q.includes('bug') || q.includes('error') || q.includes('break') || q.includes('wrong')) return 'debug';
        if (q.includes('what is') || q.includes('explain') || q.includes('how does')) return 'concept';
        if (q.includes('refactor') || q.includes('design') || q.includes('coupled') || q.includes('architecture')) return 'architecture';
        if (q.includes('learn') || q.includes('next') || q.includes('path') || q.includes('should i track')) return 'learning';
        return 'unknown';
    }

    static async routeQuery(
        query: string,
        currentFilePath: string | null,
        userProfileId: string
    ): Promise<ReasoningContext> {
        const intent = this.detectIntent(query);

        // 1. Fetch real active concepts from the file-concept mapping
        let activeConcepts: string[] = [];
        if (currentFilePath) {
            const file = await db.query.fileNodes.findFirst({
                where: eq(fileNodes.path, currentFilePath),
                with: {
                    conceptUsages: {
                        with: {
                            concept: true
                        }
                    }
                }
            });
            activeConcepts = file?.conceptUsages.map(cu => cu.concept.slug) || [];
        }

        // 2. Fetch recent regressions from the concept change log
        // Safety check: ensure we have a valid UUID for the profile
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userProfileId);
        
        const recentChanges = isValidUUID ? await db.query.conceptChangeLog.findMany({
            where: eq(conceptChangeLog.profileId, userProfileId),
            orderBy: [desc(conceptChangeLog.timestamp)],
            limit: 5,
            with: {
                concept: true
            }
        }) : [];

        const recentCommitConcepts = recentChanges.map(rc => rc.concept.slug);

        // 3. Fetch architectural stress for the current file
        let architectureStress: number | null = null;
        if (currentFilePath) {
            const file = await db.query.fileNodes.findFirst({
                where: eq(fileNodes.path, currentFilePath)
            });
            if (file) {
                const metrics = await db.query.architectureMetrics.findFirst({
                    where: and(
                        eq(architectureMetrics.nodeId, file.id),
                        eq(architectureMetrics.nodeType, 'file')
                    )
                });
                architectureStress = metrics?.stressScore || 0;
            }
        }

        const context: ReasoningContext = {
            intent,
            activeFile: currentFilePath,
            conceptsInFile: activeConcepts,
            recentCommitConcepts,
            userMastery: {},
            architectureStress,
            systemReasoning: '',
        };

        // Populate mastery
        for (const concept of context.conceptsInFile) {
            context.userMastery[concept] = await getMasteryScore(userProfileId, concept);
        }

        // System Reasoning Engine
        switch (intent) {
            case 'debug':
                const regressions = context.recentCommitConcepts.filter(c => (context.userMastery[c] || 0) < 0.4);
                context.systemReasoning = regressions.length > 0
                    ? `The issue likely relates to recently introduced concepts: ${regressions.join(', ')}. User mastery is low.`
                    : `No obvious conceptual regressions found in recent history. Review stack trace.`;
                break;

            case 'concept':
                const targetConcept = context.conceptsInFile[0] || 'Unknown';
                const score = context.userMastery[targetConcept] || 0;
                context.systemReasoning = `Explain ${targetConcept} at mastery level ${score.toFixed(2)}. ${score < 0.3 ? 'Use analogies.' : 'Use technical depth.'}`;
                break;

            case 'architecture':
                context.systemReasoning = (context.architectureStress && context.architectureStress > 0.7)
                    ? `This module has high coupling/stress (${context.architectureStress.toFixed(2)}). Advise extracting functionality.`
                    : `Architecture is relatively stable. Proceed normally.`;
                break;

            case 'learning':
                const weakConcepts = Object.entries(context.userMastery)
                    .filter(([_, s]) => s < 0.3)
                    .map(([c, _]) => c);
                context.systemReasoning = `Suggest the user reinforces ${weakConcepts.join(', ') || 'foundation concepts'} based on recent struggles.`;
                break;

            default:
                context.systemReasoning = `Standard contextual response for ${context.activeFile || 'global context'}.`;
        }

        return context;
    }
}

