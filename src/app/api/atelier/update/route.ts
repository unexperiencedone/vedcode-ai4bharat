import { db } from "@/lib/db";
import { profiles, portfolioWorks, journals } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      profileUpdates, 
      featuredWorks = [], 
      featuredJournals = [] 
    } = await req.json();

    // Get current profile
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.email, session.user.email),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Uniqueness check for handle if it's being changed
    if (profileUpdates.handle && profileUpdates.handle !== profile.handle) {
      const existing = await db.query.profiles.findFirst({
        where: eq(profiles.handle, profileUpdates.handle),
      });
      if (existing) {
        return NextResponse.json({ error: "Handle already taken" }, { status: 400 });
      }
    }

    // Filter fields to avoid overwriting email/name/id
    const { email, name, id, clerkId, authId, ...safeUpdates } = profileUpdates;

    // 1. Update Profile Table
    await db
      .update(profiles)
      .set(safeUpdates)
      .where(eq(profiles.id, profile.id));

    // 2. Manage Featured Works
    // Reset all to false first
    await db
      .update(portfolioWorks)
      .set({ featured: false })
      .where(eq(portfolioWorks.profileId, profile.id));
    
    // Set featured ones
    if (featuredWorks.length > 0) {
      await db
        .update(portfolioWorks)
        .set({ featured: true })
        .where(
          and(
            eq(portfolioWorks.profileId, profile.id),
            inArray(portfolioWorks.id, featuredWorks)
          )
        );
    }

    // 3. Manage Featured Journals
    // Reset all to false first
    await db
      .update(journals)
      .set({ featured: false })
      .where(eq(journals.profileId, profile.id));
    
    // Set featured ones
    if (featuredJournals.length > 0) {
      await db
        .update(journals)
        .set({ featured: true })
        .where(
          and(
            eq(journals.profileId, profile.id),
            inArray(journals.id, featuredJournals)
          )
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
