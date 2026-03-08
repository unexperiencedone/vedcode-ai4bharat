export type TutorIntent = 'debug' | 'concept' | 'architecture' | 'learning' | 'unknown';

export interface ReasoningContext {
    intent: TutorIntent;
    activeFile: string | null;
    conceptsInFile: string[];
    recentCommitConcepts: string[];
    userMastery: Record<string, number>;
    architectureStress: number | null;
    systemReasoning: string;
    pastMessages?: Array<{ role: string; content: string }>;
}
