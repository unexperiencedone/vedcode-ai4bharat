import { db } from "@/lib/db";
import { snippets, profiles } from "@/db/schema";
import { ilike, or, eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  try {
    const results = await db.select({
      id: snippets.id,
      title: snippets.title,
      code: snippets.code,
      language: snippets.language,
      difficulty: snippets.difficulty,
      authorName: profiles.name,
      createdAt: snippets.createdAt,
    })
    .from(snippets)
    .leftJoin(profiles, eq(snippets.authorId, profiles.id))
    .where(
      or(
        ilike(snippets.title, `%${query}%`),
        ilike(snippets.code, `%${query}%`)
      )
    )
    .orderBy(desc(snippets.createdAt))
    .limit(20);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json({ error: "Failed to search snippets" }, { status: 500 });
  }
}
