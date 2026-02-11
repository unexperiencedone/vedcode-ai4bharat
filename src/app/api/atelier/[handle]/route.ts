import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles, snippets } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.handle, handle),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get snippet count for this user
    const [snippetCount] = await db
      .select({ value: count() })
      .from(snippets)
      .where(eq(snippets.authorId, profile.id));

    // Get recent snippets by this user
    const userSnippets = await db
      .select({
        id: snippets.id,
        title: snippets.title,
        language: snippets.language,
        difficulty: snippets.difficulty,
        createdAt: snippets.createdAt,
        code: snippets.code,
      })
      .from(snippets)
      .where(eq(snippets.authorId, profile.id))
      .orderBy(desc(snippets.createdAt))
      .limit(10);

    return NextResponse.json({
      profile: {
        name: profile.name,
        handle: profile.handle,
        role: profile.role,
        bio: profile.bio,
        image: profile.image,
        email: profile.email,
        linkedin: profile.linkedin,
        github: profile.github,
        codingPhilosophy: profile.codingPhilosophy,
        interests: profile.interests,
        hobbies: profile.hobbies,
        primaryOs: profile.primaryOs,
        preferredIde: profile.preferredIde,
        hardwareSetup: profile.hardwareSetup,
        themePreference: profile.themePreference,
      },
      stats: {
        snippets: snippetCount?.value ?? 0,
      },
      snippets: userSnippets,
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
