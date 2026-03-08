"use server";

import { db } from "@/lib/db";
import { userConceptProgress, conceptChangeLog, profiles, mentorEvidencePatterns } from "@/db/schema";
import { eq, desc, and, lt } from "drizzle-orm";
import { auth } from "@/auth";

/**
 * Resolves the session user's auth ID to their profile UUID.
 * All DB tables use `profileId` (the UUID from `profiles.id`), NOT the OAuth auth ID.
 */
async function getProfileId(authId: string): Promise<string | null> {
    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.authId, authId),
        columns: { id: true },
    });
    return profile?.id ?? null;
}

export async function getDynamicInsight(pathname: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    // Resolve auth ID → profile UUID (all FK relations use profile.id)
    const profileId = await getProfileId(session.user.id);
    if (!profileId) return null;

    // 1. Check for recent knowledge regressions
    const recentRegressions = await db.query.conceptChangeLog.findMany({
        where: eq(conceptChangeLog.profileId, profileId),
        orderBy: [desc(conceptChangeLog.timestamp)],
        limit: 1,
        with: { concept: true },
    });

    if (recentRegressions.length > 0 && Math.random() > 0.3) {
        const reg = recentRegressions[0];
        return {
            type: "architecture" as const,
            patternType: reg.changeType,
            severityScore: reg.confidence || 0.8,
            title: "Regression Detected",
            actionableAdvice: `Your understanding of "${reg.concept.name}" may have drifted. The change type detected was "${reg.changeType}". Consider reviewing it to reinforce your mental model.`,
            relatedConcepts: [reg.concept.slug, "error_handling"],
        };
    }

    // 2. Check for concepts with low mastery that the user is actively working with
    const lowMastery = await db.query.userConceptProgress.findMany({
        where: and(
            eq(userConceptProgress.profileId, profileId),
            lt(userConceptProgress.understandingScore, 0.4)
        ),
        limit: 5,
        with: { concept: true },
    });

    if (lowMastery.length > 0) {
        const gap = lowMastery[Math.floor(Math.random() * lowMastery.length)];
        return {
            type: "learning" as const,
            patternType: "recall_gap",
            severityScore: 0.7,
            title: "Knowledge Gap Detected",
            actionableAdvice: `Your recall score for "${gap.concept.name}" is currently low (${Math.round((gap.understandingScore ?? 0) * 100)}%). Opening the Handbook page for this concept and doing an active recall challenge will lock it in.`,
            relatedConcepts: [gap.concept.slug],
        };
    }

    // 3. Check for persistent evidence patterns from the mentor engine (real behavioral data)
    const patterns = await db
        .select()
        .from(mentorEvidencePatterns)
        .where(eq(mentorEvidencePatterns.profileId, profileId))
        .limit(1);

    if (patterns.length > 0 && Math.random() > 0.5) {
        const p = patterns[0];
        return {
            type: "refactor" as const,
            patternType: p.patternType,
            severityScore: Math.min(p.confidenceScore, 1),
            title: "Recurring Pattern Detected",
            actionableAdvice: `The pattern "${p.patternType.replace(/_/g, " ")}" has been observed ${p.occurrenceCount} time(s) in your codebase. Addressing it consistently will improve code quality.`,
            relatedConcepts: (p.relatedConcepts as string[]) || [],
        };
    }

    // No relevant insight to show — return null (don't show anything)
    return null;
}
