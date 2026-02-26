import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles, snippets, portfolioWorks, journals, logs } from "@/db/schema";
import { eq, desc, sql, count, and, gte } from "drizzle-orm";

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

    // Get portfolio works for this user
    const userWorks = await db.query.portfolioWorks.findMany({
      where: eq(portfolioWorks.profileId, profile.id),
      orderBy: [desc(portfolioWorks.createdAt)],
    });

    // Get journals for this user
    const userJournals = await db.query.journals.findMany({
      where: eq(journals.profileId, profile.id),
      orderBy: [desc(journals.publishedAt)],
    });

    // Get contribution data (Real entities for the last 50 days)
    const fiftyDaysAgo = new Date();
    fiftyDaysAgo.setHours(0, 0, 0, 0);
    fiftyDaysAgo.setDate(fiftyDaysAgo.getDate() - 50);

    const snippetLogs = await db.select({
      day: sql<string>`DATE(${snippets.createdAt})`,
      count: count(),
    })
      .from(snippets)
      .where(and(eq(snippets.authorId, profile.id), gte(snippets.createdAt, fiftyDaysAgo)))
      .groupBy(sql`DATE(${snippets.createdAt})`);

    const workLogs = await db.select({
      day: sql<string>`DATE(${portfolioWorks.createdAt})`,
      count: count(),
    })
      .from(portfolioWorks)
      .where(and(eq(portfolioWorks.profileId, profile.id), gte(portfolioWorks.createdAt, fiftyDaysAgo)))
      .groupBy(sql`DATE(${portfolioWorks.createdAt})`);

    const journalLogs = await db.select({
      day: sql<string>`DATE(${journals.publishedAt})`,
      count: count(),
    })
      .from(journals)
      .where(and(eq(journals.profileId, profile.id), gte(journals.publishedAt, fiftyDaysAgo)))
      .groupBy(sql`DATE(${journals.publishedAt})`);

    // Merge counts into a daily map
    const dailyMap: Record<string, number> = {};
    [...snippetLogs, ...workLogs, ...journalLogs].forEach(log => {
      dailyMap[log.day] = (dailyMap[log.day] || 0) + Number(log.count);
    });

    // Format into a 50-day array
    const contributions = Array.from({ length: 50 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (49 - i));
      const dateStr = date.toISOString().split('T')[0];
      return {
        date: dateStr,
        count: dailyMap[dateStr] || 0
      };
    });

    return NextResponse.json({
      profile: {
        ...profile,
        interests: Array.isArray(profile.interests) ? profile.interests : [],
        hobbies: Array.isArray(profile.hobbies) ? profile.hobbies : [],
      },
      stats: {
        snippets: Number(snippetCount?.value ?? 0),
        yearsActive: profile.yearsActive ?? 0,
        commitCount: profile.commitCount ?? 0,
        prCount: profile.prCount ?? 0,
      },
      snippets: userSnippets,
      works: userWorks,
      journals: userJournals,
      contributions,
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
