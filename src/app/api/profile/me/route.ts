import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

/**
 * GET /api/profile/me
 * Returns the internal profiles record for the currently authenticated user.
 * This resolves auth_id (NextAuth session user id) → profiles.id (internal DB UUID).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await db.query.profiles.findFirst({
      where: eq(profiles.email, session.user.email),
      columns: {
        id: true,
        handle: true,
        name: true,
        image: true,
        role: true,
        skillLevel: true,
        onboardingComplete: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Profile/me API error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
