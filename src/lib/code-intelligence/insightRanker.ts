export interface Insight {
    type: 'architecture' | 'learning' | 'refactor';
    patternType: string;
    severityScore: number; // 0 to 1
    title: string;
    actionableAdvice: string;
    relatedConcepts: string[];
}

export function rankInsights(insights: Insight[]): Insight[] {
    // Sort strictly by severity
    return insights.sort((a, b) => b.severityScore - a.severityScore);
}

// Determines the final severity of a pattern based on historical occurrence and confidence
export function calculateSeverity(confidence: number, occurrenceCount: number, baseWeight: number): number {
    // Logarithmic scaling for occurrences so 5 is much worse than 1, but 50 isn't 10x worse than 5
    const occurrenceMultiplier = Math.min(1.5, 1 + (Math.log10(occurrenceCount) * 0.5));
    
    let rawScore = confidence * occurrenceMultiplier * baseWeight;
    
    // Cap at 1.0 (100% severity)
    return Math.min(1.0, rawScore);
}
