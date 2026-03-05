import { db } from "../db";
import { userConceptProgress, conceptCards } from "../../db/schema";
import { eq, and, inArray } from "drizzle-orm";

export interface GuardAdvice {
  conceptSlug: string;
  conceptName: string;
  masteryLevel: "learning" | "familiar" | "mastered";
  severity: "INFO" | "WARNING" | "CRITICAL";
  message: string;
}

/**
 * Guard Advisor
 * Generates personalized advice based on user mastery.
 */
export class GuardAdvisor {
  
  async getAdvice(impactedConcepts: any[], userId: string): Promise<GuardAdvice[]> {
    if (impactedConcepts.length === 0) return [];

    const conceptIds = impactedConcepts.map(c => c.conceptId);

    // Fetch user progress for these concepts
    const progress = await db.select({
      conceptId: userConceptProgress.conceptId,
      masteryLevel: userConceptProgress.masteryLevel,
      understandingScore: userConceptProgress.understandingScore,
      recallScore: userConceptProgress.recallScore,
    })
    .from(userConceptProgress)
    .where(inArray(userConceptProgress.conceptId, conceptIds));

    const progressMap = new Map(progress.map(p => [p.conceptId, p]));

    return impactedConcepts.map(concept => {
      const userProgress = progressMap.get(concept.conceptId);
      const mastery = (userProgress?.masteryLevel as "learning" | "familiar" | "mastered") || "learning";
      
      let severity: "INFO" | "WARNING" | "CRITICAL" = "INFO";
      let message = "";

      if (mastery === "learning") {
        severity = "CRITICAL";
        message = `This change affects ${concept.name}, which you are still learning. Verify dependencies carefully.`;
      } else if (mastery === "familiar") {
        severity = "WARNING";
        message = `You've used ${concept.name} before, but impact here might be subtle. Recommend a quick review.`;
      } else {
        severity = "INFO";
        message = `Impacts ${concept.name}. You've mastered this, but keep an eye on side effects.`;
      }

      return {
        conceptSlug: concept.slug,
        conceptName: concept.name,
        masteryLevel: mastery,
        severity,
        message
      };
    });
  }
}
