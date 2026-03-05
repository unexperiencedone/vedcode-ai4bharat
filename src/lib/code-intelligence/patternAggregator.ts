import { updateEvidencePattern } from "./evidenceMemory";
import { db } from "../db";
import { conceptUsage } from "../../db/schema";
import { eq, inArray } from "drizzle-orm";

export interface RawSignalContext {
    profileId: string;
    fileId: string;
    detectedConcepts: { slug: string, confidence: number }[];
    architecturalStress?: number;
    errorRates?: number; // E.g., failed builds or exceptions
}

/**
 * Aggregates raw signals in a given file modification and updates Evidence Memory patterns.
 */
export async function aggregatePatterns(context: RawSignalContext) {
    const { profileId, detectedConcepts, architecturalStress, errorRates } = context;

    // Pattern 1: Async Error Handling Gap
    // Check if they are using async/await or promises without try/catch / high error rates
    const hasAsync = detectedConcepts.some(c => c.slug === 'async_await' || c.slug === 'promise');
    const hasErrorHandling = detectedConcepts.some(c => c.slug === 'try_catch' || c.slug === 'error_boundary');

    if (hasAsync && !hasErrorHandling) {
        await updateEvidencePattern(
            profileId,
            'async_error_handling_gap',
            0.85,
            ['async_await', 'error_handling']
        );
    }

    // Pattern 2: High Coupling and Architecture Stress Blind Spot
    // If the file is highly stressed and they are making changes to heavily used React Hooks or State
    const hasHooks = detectedConcepts.some(c => c.slug === 'useeffect' || c.slug === 'custom_hooks');
    if (architecturalStress && architecturalStress > 0.7 && hasHooks) {
        await updateEvidencePattern(
            profileId,
            'architectural_hotspot_mismanagement',
            0.90,
            ['custom_hooks', 'architecture']
        );
    }

    // Pattern 3: Excessive UseEffect without Cleanup
    const hasUseEffect = detectedConcepts.some(c => c.slug === 'useeffect');
    const hasCleanup = detectedConcepts.some(c => c.slug === 'useeffect_cleanup' || c.slug === 'memory_leaks');
    if (hasUseEffect && !hasCleanup) {
        await updateEvidencePattern(
            profileId,
            'useeffect_cleanup_gap',
            0.80,
            ['useeffect', 'memory_leaks']
        );
    }

    // Pattern 4: Prop Drilling (If components are passing too many props and not using Context)
    const hasProps = detectedConcepts.some(c => c.slug === 'props');
    const hasContext = detectedConcepts.some(c => c.slug === 'use_context');
    if (architecturalStress && architecturalStress > 0.6 && hasProps && !hasContext) {
        await updateEvidencePattern(
            profileId,
            'prop_drilling_overuse',
            0.75,
            ['props', 'use_context']
        );
    }
}
