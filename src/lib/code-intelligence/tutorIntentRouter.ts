import { getMasteryScore } from '@/lib/intelligence/recommendationEngine';

export type TutorIntent = 'debug' | 'concept' | 'architecture' | 'learning' | 'unknown';

export interface ReasoningContext {
    intent: TutorIntent;
    activeFile: string | null;
    conceptsInFile: string[];
    recentCommitConcepts: string[];
    userMastery: Record<string, number>;
    architectureStress: number | null;
    systemReasoning: string;
}

/**
 * Phase 9 (Step 1): The AI Tutor Intent Router
 * Determines what reasoning engines must be engaged BEFORE the LLM speaks.
 */
export class TutorIntentRouter {

    /**
     * 1. Intent Detection
     * Uses lightweight regex/keywords (in prod, a small classification model)
     * to determine the core intent of the user's question.
     */
    static detectIntent(query: string): TutorIntent {
        const q = query.toLowerCase();

        if (q.includes('fail') || q.includes('bug') || q.includes('error') || q.includes('break') || q.includes('wrong')) {
            return 'debug';
        }
        if (q.includes('what is') || q.includes('explain') || q.includes('how does')) {
            return 'concept';
        }
        if (q.includes('refactor') || q.includes('design') || q.includes('coupled') || q.includes('architecture')) {
            return 'architecture';
        }
        if (q.includes('learn') || q.includes('next') || q.includes('path') || q.includes('should i track')) {
            return 'learning';
        }

        return 'unknown';
    }

    /**
     * 2. Context Orchestration
     * Based on the intent, it pulls directly from the 7 intelligence layers.
     */
    static async routeQuery(
        query: string,
        currentFilePath: string | null,
        userProfileId: string,
        mockSessionData?: any // Simulating the global store for this demo
    ): Promise<ReasoningContext> {
        const intent = this.detectIntent(query);

        // Base context structure
        const context: ReasoningContext = {
            intent,
            activeFile: currentFilePath,
            conceptsInFile: mockSessionData?.activeConcepts || [],
            recentCommitConcepts: mockSessionData?.recentCommitConcepts || [],
            userMastery: {},
            architectureStress: mockSessionData?.currentStress || null,
            systemReasoning: '',
        };

        // Populate the specific mastery levels for relevant concepts
        for (const concept of context.conceptsInFile) {
            context.userMastery[concept] = await getMasteryScore(userProfileId, concept);
        }

        // 3. System Reasoning Engine Injection
        switch (intent) {
            case 'debug':
                // Route through Concept Time-Travel and Regression Corrector
                const regressions = context.recentCommitConcepts.filter(c => (context.userMastery[c] || 0) < 0.4);
                if (regressions.length > 0) {
                    context.systemReasoning = `The issue likely relates to recently introduced concepts: \${regressions.join(', ')}. User mastery is low.`;
                } else {
                    context.systemReasoning = `No obvious conceptual regressions found. Check stack trace.`;
                }
                break;

            case 'concept':
                // Route through Adaptive Explanation
                const targetConcept = context.conceptsInFile[0] || 'Unknown';
                const score = context.userMastery[targetConcept] || 0;
                context.systemReasoning = `Explain \${targetConcept} at mastery level \${score.toFixed(2)}. \${score < 0.3 ? 'Use analogies.' : 'Use technical depth.'}`;
                break;

            case 'architecture':
                // Route through Architectural Stress
                if (context.architectureStress && context.architectureStress > 0.7) {
                    context.systemReasoning = `This module has high coupling/stress. Advise extracting functionality.`;
                } else {
                    context.systemReasoning = `Architecture is relatively stable. Proceed normally.`;
                }
                break;

            case 'learning':
                // Route through Mentor Patterns
                const weakConcepts = Object.entries(context.userMastery)
                    .filter(([_, s]) => s < 0.3)
                    .map(([c, _]) => c);

                context.systemReasoning = `Suggest the user reinforces \${weakConcepts.join(', ') || 'foundation concepts'} based on recent struggles.`;
                break;

            case 'unknown':
            default:
                context.systemReasoning = `Standard contextual response. Lean on active file: \${context.activeFile}`;
                break;
        }

        return context;
    }
}
