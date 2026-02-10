import { db } from "@/lib/db";
import { snippets } from "@/db/schema";
import { sql } from "drizzle-orm";

export interface SkillStat {
  language: string;
  count: number;
  masteryScore: number;
}

export async function getSkillStats() {
  try {
    const stats = await db.select({
      language: snippets.language,
      count: sql<number>`count(*)`,
      masteryScore: sql<number>`sum(case when ${snippets.difficulty} = 'Mastery' then 3 when ${snippets.difficulty} = 'Expert' then 2 else 1 end)`
    })
    .from(snippets)
    .groupBy(snippets.language);

    // Normalize data (ensure numbers)
    const formattedStats: SkillStat[] = stats.map(s => ({
      language: s.language,
      count: Number(s.count),
      masteryScore: Number(s.masteryScore || 0)
    }));

    // Calculate "Group IQ"
    const groupIQ = formattedStats.reduce((acc, curr) => acc + curr.masteryScore, 0);
    
    return { stats: formattedStats, groupIQ };
  } catch (error) {
    console.error("Failed to calculate mastery stats:", error);
    return { stats: [], groupIQ: 0 };
  }
}
