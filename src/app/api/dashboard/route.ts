import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { snippets, profiles, assets } from "@/db/schema";
import { desc, count, eq } from "drizzle-orm";

export async function GET() {
  try {
    // Recent snippets with author info
    const recentSnippets = await db
      .select({
        id: snippets.id,
        title: snippets.title,
        language: snippets.language,
        difficulty: snippets.difficulty,
        createdAt: snippets.createdAt,
        authorName: profiles.name,
        authorHandle: profiles.handle,
        authorImage: profiles.image,
      })
      .from(snippets)
      .leftJoin(profiles, eq(snippets.authorId, profiles.id))
      .orderBy(desc(snippets.createdAt))
      .limit(6);

    // Stats
    const [snippetCount] = await db.select({ value: count() }).from(snippets);
    const [memberCount] = await db.select({ value: count() }).from(profiles);
    const [assetCount] = await db.select({ value: count() }).from(assets);

    // Recent members
    const recentMembers = await db
      .select({
        id: profiles.id,
        name: profiles.name,
        handle: profiles.handle,
        image: profiles.image,
        role: profiles.role,
      })
      .from(profiles)
      .orderBy(desc(profiles.id))
      .limit(5);

    return NextResponse.json({
      recentSnippets,
      stats: {
        snippets: snippetCount?.value ?? 0,
        members: memberCount?.value ?? 0,
        assets: assetCount?.value ?? 0,
      },
      recentMembers,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
