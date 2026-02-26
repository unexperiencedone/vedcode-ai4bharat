import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles, logs, snippets, portfolioWorks, journals } from "@/db/schema";
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

    // Unified Audit Trail (Real entities)
    const [allSnippets, allWorks, allJournals] = await Promise.all([
      db.select().from(snippets).where(eq(snippets.authorId, profile.id)).orderBy(desc(snippets.createdAt)),
      db.select().from(portfolioWorks).where(eq(portfolioWorks.profileId, profile.id)).orderBy(desc(portfolioWorks.createdAt)),
      db.select().from(journals).where(eq(journals.profileId, profile.id)).orderBy(desc(journals.publishedAt)),
    ]);

    const auditTrail = [
      ...allSnippets.map(s => ({
        id: `snip_${s.id}`,
        action: "SNIPPET_PUBLISH",
        details: `${s.title} (${s.language})`,
        timestamp: s.createdAt,
        cluster: s.difficulty === "Expert" ? 5 : s.difficulty === "Standard" ? 3 : 1,
      })),
      ...allWorks.map(w => ({
        id: `work_${w.id}`,
        action: "PROJECT_PUBLISH",
        details: `${w.title} (${w.category})`,
        timestamp: w.createdAt,
        cluster: w.featured ? 5 : 4,
      })),
      ...allJournals.map(j => ({
        id: `jour_${j.id}`,
        action: "JOURNAL_PUBLISH",
        details: j.title,
        timestamp: j.publishedAt,
        cluster: 2,
      })),
    ].sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());

    // Get 100-day contribution data (Real entities)
    const hundredDaysAgo = new Date();
    hundredDaysAgo.setHours(0, 0, 0, 0);
    hundredDaysAgo.setDate(hundredDaysAgo.getDate() - 100);

    // Re-use logic for graph aggregation
    const dailyMap: Record<string, number> = {};
    auditTrail.forEach(log => {
      const dateStr = new Date(log.timestamp!).toISOString().split('T')[0];
      const logDate = new Date(log.timestamp!);
      if (logDate >= hundredDaysAgo) {
        dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1;
      }
    });

    // Format into a 100-day array
    const contributions = Array.from({ length: 100 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (99 - i));
      const dateStr = date.toISOString().split('T')[0];
      return {
        date: dateStr,
        count: dailyMap[dateStr] || 0
      };
    });

    // Calculate metrics based on REAL entities
    const totalLogs = auditTrail.length;
    const peakActivity = Math.max(...contributions.map(c => c.count), 0);
    const activeDays = contributions.filter(c => c.count > 0).length;
    const consistency = (activeDays / 100) * 100;

    return NextResponse.json({
      profile: {
        name: profile.name,
        handle: profile.handle,
      },
      metrics: {
        totalLogs,
        peakActivity,
        consistency: consistency.toFixed(1) + "%",
        activeDays,
      },
      logs: auditTrail.slice(0, 50), // Show latest 50
      contributions,
    });
  } catch (error) {
    console.error("Pulse API error:", error);
    return NextResponse.json({ error: "Failed to load pulse data" }, { status: 500 });
  }
}
