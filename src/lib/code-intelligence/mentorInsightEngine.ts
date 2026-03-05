import { getActivePatterns, isInsightOnCooldown, logInsight } from "./evidenceMemory";
import { Insight, rankInsights, calculateSeverity } from "./insightRanker";

const ADVICE_DICTIONARY: Record<string, { title: string, template: (count: number) => string, baseWeight: number, type: 'architecture' | 'learning' | 'refactor' }> = {
    'async_error_handling_gap': {
        type: 'learning',
        title: 'Async Error Handling',
        baseWeight: 0.8,
        template: (c) => `You frequently write async functions without handling failures (seen ${c} times recently). Consider revisiting the "Async Error Handling" concept.`
    },
    'architectural_hotspot_mismanagement': {
        type: 'architecture',
        title: 'Architectural Hotspot Detected',
        baseWeight: 0.95, // High priority
        template: (c) => `This file is highly stressed and coupled. Because you recently mastered Custom Hooks, try extracting your state and fetching logic into a dedicated hook.`
    },
    'useeffect_cleanup_gap': {
        type: 'refactor',
        title: 'React Memory Leaks',
        baseWeight: 0.7,
        template: (c) => `You've used useEffect without cleanup functions ${c} times recently. This can lead to memory leaks when components unmount.`
    },
    'prop_drilling_overuse': {
        type: 'refactor',
        title: 'Prop Drilling Detected',
        baseWeight: 0.6,
        template: (c) => `You are passing props deeply through heavily coupled components. Since you know React Context, consider lifting this state into a Context Provider.`
    }
};

/**
 * The central reasoning loop of the Engineering Mentor Engine.
 */
export async function generateMentorInsights(profileId: string, currentFileId: string | null): Promise<Insight[]> {
    // 1. Fetch persistent historical patterns (Evidence Memory)
    const patterns = await getActivePatterns(profileId);

    if (patterns.length === 0) return [];

    const potentialInsights: Insight[] = [];

    // 2. Evaluate Modues & Formulate Insights
    for (const pattern of patterns) {
        const dictionaryEntry = ADVICE_DICTIONARY[pattern.patternType];
        if (!dictionaryEntry) continue;

        // Skip if this specific insight is on a 24-hour cooldown
        const onCooldown = await isInsightOnCooldown(profileId, pattern.patternType);
        if (onCooldown) continue;

        // Calculate severity based on history size
        const severity = calculateSeverity(pattern.confidenceScore, pattern.occurrenceCount, dictionaryEntry.baseWeight);

        // We only consider serious patterns (severity > 0.5)
        if (severity > 0.5) {
            potentialInsights.push({
                type: dictionaryEntry.type,
                patternType: pattern.patternType,
                severityScore: severity,
                title: dictionaryEntry.title,
                actionableAdvice: dictionaryEntry.template(pattern.occurrenceCount),
                relatedConcepts: pattern.relatedConcepts as string[] || []
            });
        }
    }

    // 3. Rank & Cull (The Anti-Clippy Rule)
    // Only return the absolute top 1 insight to prevent alert fatigue
    const sortedInsights = rankInsights(potentialInsights);
    const topInsights = sortedInsights.slice(0, 1);

    // 4. Log delivered insights to enforce future cooldowns
    for (const insight of topInsights) {
        await logInsight(profileId, insight.patternType, currentFileId, insight.severityScore);
    }

    return topInsights;
}
