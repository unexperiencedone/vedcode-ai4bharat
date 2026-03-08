import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userRoadmaps, learnerProfile, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

/**
 * POST /api/roadmap/complete
 * Marks a roadmap chapter as completed and bumps the user's masteryScore.
 * Advanced tests unlock at masteryScore >= 0.8.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roadmapId } = await req.json();
    if (!roadmapId) {
      return NextResponse.json({ error: "roadmapId required" }, { status: 400 });
    }

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.email, session.user.email),
      columns: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Mark roadmap as completed
    await db.update(userRoadmaps)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userRoadmaps.id, roadmapId));

    // Bump learner profile mastery score (+0.15 per completed chapter, capped at 1.0)
    const existingProfile = await db.query.learnerProfile.findFirst({
      where: eq(learnerProfile.profileId, profile.id),
    });

    if (existingProfile) {
      const newMastery = Math.min((existingProfile.conceptMasteryScore || 0) + 0.15, 1.0);
      const newConcepts = (existingProfile.totalKeywordsLearned || 0) + 10; // approximate

      await db.update(learnerProfile)
        .set({
          conceptMasteryScore: newMastery,
          totalKeywordsLearned: newConcepts,
          lastUpdated: new Date(),
          lastSignalAt: new Date(),
        })
        .where(eq(learnerProfile.profileId, profile.id));

      const advancedTestsUnlocked = newMastery >= 0.8;

      return NextResponse.json({
        ok: true,
        masteryScore: newMastery,
        advancedTestsUnlocked,
        message: advancedTestsUnlocked
          ? "Advanced tests unlocked! Your mastery score reached 80%."
          : `Mastery score updated to ${Math.round(newMastery * 100)}%.`,
      });
    }

    return NextResponse.json({ ok: true, masteryScore: 0.15 });
  } catch (error: any) {
    console.error("[Roadmap/Complete] Error:", error.message);
    return NextResponse.json({ error: "Failed to complete roadmap" }, { status: 500 });
  }
}
