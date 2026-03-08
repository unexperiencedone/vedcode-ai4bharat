import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userRoadmaps, profiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";

/**
 * GET /api/roadmap/mine
 * Returns ALL of the user's saved roadmap chapters, ordered most recent first.
 * Each chapter is self-contained (ML, Python, React — always separate).
 */
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.email, session.user.email),
            columns: { id: true },
        });

        if (!profile) {
            return NextResponse.json({ roadmaps: [] });
        }

        const roadmaps = await db.query.userRoadmaps.findMany({
            where: eq(userRoadmaps.profileId, profile.id),
            orderBy: [desc(userRoadmaps.createdAt)],
        });

        return NextResponse.json({ roadmaps });
    } catch (error: any) {
        console.error("[Roadmap/Mine] Error:", error.message);
        return NextResponse.json({ error: "Failed to load roadmaps" }, { status: 500 });
    }
}

/**
 * PATCH /api/roadmap/mine
 * Updates currentStepIndex for a specific roadmap chapter.
 */
export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { roadmapId, currentStepIndex } = await req.json();

        await db.update(userRoadmaps)
            .set({ currentStepIndex, updatedAt: new Date() })
            .where(eq(userRoadmaps.id, roadmapId));

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("[Roadmap/Mine PATCH] Error:", error.message);
        return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
    }
}
