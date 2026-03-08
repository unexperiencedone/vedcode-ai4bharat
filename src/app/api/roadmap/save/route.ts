import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userRoadmaps, profiles } from "@/db/schema";
import type { RoadmapStep } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

/**
 * POST /api/roadmap/save
 * Saves a user-approved roadmap as a new isolated chapter in userRoadmaps.
 * Each call creates a NEW standalone chapter — ML and Python are always separate rows.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, goal, techSlug, steps } = body as {
      title: string;
      goal: string;
      techSlug: string;
      steps: RoadmapStep[];
    };

    if (!title || !goal || !techSlug || !steps?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Resolve internal profile ID
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.email, session.user.email),
      columns: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const [saved] = await db.insert(userRoadmaps).values({
      profileId: profile.id,
      title,
      goal,
      techSlug,
      steps,
      status: "active",
      currentStepIndex: 0,
    }).returning();

    return NextResponse.json({ roadmap: saved });
  } catch (error: any) {
    console.error("[Roadmap/Save] Error:", error.message);
    return NextResponse.json({ error: "Failed to save roadmap" }, { status: 500 });
  }
}
