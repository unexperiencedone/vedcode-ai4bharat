import { notFound } from "next/navigation";
import { getConceptCardBySlug } from "@/lib/actions/handbookActions";
import { ExplanationCard } from "@/components/learning/ExplanationCard";
import { db } from "@/lib/db";
import { userConceptProgress, profiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

export default async function HandbookConceptPage({
  params,
}: {
  params: Promise<{ tech: string; slug: string }>;
}) {
  const { slug } = await params;
  const [concept, session] = await Promise.all([
    getConceptCardBySlug(slug),
    auth(),
  ]);

  if (!concept) {
    return notFound();
  }

  // Fetch real mastery data for this concept if user is logged in
  let mastery = { understanding: 0, recall: 0, level: "unexplored", nextReviewAt: null as Date | null, groundingScore: 100, isProjectSynced: false };

  if (session?.user) {
    try {
      const userProfile = await db.query.profiles.findFirst({
        where: eq(profiles.authId, session.user.id as string),
      });
      if (userProfile) {
        const progress = await db.query.userConceptProgress.findFirst({
          where: and(
            eq(userConceptProgress.profileId, userProfile.id),
            eq(userConceptProgress.conceptId, concept.id)
          ),
        });
        if (progress) {
          mastery = {
            understanding: progress.understandingScore ?? 0,
            recall: progress.recallScore ?? 0,
            level: progress.masteryLevel ?? "unexplored",
            nextReviewAt: progress.nextReviewAt ?? null,
            groundingScore: 100,
            isProjectSynced: true,
          };
        }
      }
    } catch {
      // Mastery lookup failed — fall back to defaults silently
    }
  }

  // Map concept data to ExplanationCard format
  const mappedExplanation = {
    theory: concept.beginnerExplanation + "\n\n" + concept.intermediateExplanation,
    snippet: concept.examples[0]?.code || "// No example provided",
    language: concept.examples[0]?.language || "typescript",
    projectApplication: concept.advancedExplanation ||
      "See the AI Tutor for project-specific applications of this concept.",
  };

  return (
    <div className="w-full p-12">
      <ExplanationCard
        keyword={concept.name}
        explanation={mappedExplanation}
        mastery={mastery}
      />
    </div>
  );
}
