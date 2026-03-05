import { db } from '../db';
import { learnerProfile, skillSignals, userConceptProgress } from '../../db/schema';
import { eq, desc, and } from 'drizzle-orm';

/**
 * Weights for different types of signals
 */
const SIGNAL_WEIGHTS: Record<string, number> = {
  quiz_beginner_correct: 0.03,
  quiz_intermediate_correct: 0.05,
  quiz_advanced_correct: 0.07,
  quiz_failed: -0.02,
  concept_viewed: 0.01,
  jit_explainer_used: 0.02,
  example_opened: 0.03,
  advanced_tab_opened: 0.04,
  roadmap_step_complete: 0.05
};

/**
 * Thresholds for skill levels
 */
const LEVEL_THRESHOLDS = {
  beginner: { min: 0.0, max: 0.35 },
  intermediate: { min: 0.35, max: 0.70 },
  advanced: { min: 0.70, max: 1.0 }
};

/**
 * Main inference function for a user's global skill level
 */
/**
 * Main inference function for a user's global skill level
 */
export async function inferSkillLevel(profileId: string, latestSignal?: any) {
  try {
    // 1. Fetch current profile
    const profile = await db.query.learnerProfile.findFirst({
      where: eq(learnerProfile.profileId, profileId)
    });

    if (!profile) return null;

    // 2. Fetch recent signals (last 100 or so to prevent infinite recalculation)
    const signals = await db.query.skillSignals.findMany({
      where: eq(skillSignals.profileId, profileId),
      orderBy: [desc(skillSignals.timestamp)],
      limit: 100
    });

    // 3. Process latest signal for concept-specific mastery if present
    if (latestSignal && latestSignal.conceptId) {
      let masteryType: 'understanding' | 'recall' = 'understanding';
      let isPassive = false;
      let delta = 0;

      const type = latestSignal.signalType;
      const payload = latestSignal.payload || {};

      if (type === 'quiz_answered') {
        masteryType = 'recall';
        const isCorrect = payload.correct;
        const difficulty = payload.difficulty || 'beginner';
        if (isCorrect) {
          // Rule: Success weights
          delta = difficulty === 'advanced' ? 0.07 : (difficulty === 'intermediate' ? 0.05 : 0.03);
        } else {
          delta = -0.02; // Rule: Failed quiz
        }
      } else {
        masteryType = 'understanding';
        if (type === 'concept_viewed') {
          delta = 0.01;
          isPassive = true;
        } else if (type === 'jit_explainer_used') {
          delta = 0.02;
          isPassive = true;
        } else if (type === 'example_opened') {
          delta = 0.03;
          isPassive = false; // Example interaction is active
        } else if (type === 'advanced_tab_opened') {
          delta = 0.04;
        }
      }

      if (delta !== 0) {
        await updateConceptMastery(profileId, latestSignal.conceptId, masteryType, delta, isPassive);
      }
    }

    // 4. Calculate score delta from signals with recency weighting
    let scoreDelta = 0;
    let totalRecencyWeight = 0;

    const now = new Date();

    for (const signal of signals) {
      let type = signal.signalType;
      const payload = signal.payload as any;

      // Specialized handling for quizzes in global score
      if (type === 'quiz_answered') {
        const isCorrect = payload?.correct;
        const difficulty = payload?.difficulty || 'beginner';
        if (isCorrect) {
          type = `quiz_${difficulty}_correct`;
        } else {
          type = 'quiz_failed';
        }
      }

      // Calculate recency weight
      const ageInDays = (now.getTime() - signal.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      let recencyWeight = 1.0;
      if (ageInDays > 90) recencyWeight = 0.2;
      else if (ageInDays > 30) recencyWeight = 0.6;
      else if (ageInDays > 7) recencyWeight = 0.8;

      const baseWeight = SIGNAL_WEIGHTS[type] || 0;
      scoreDelta += (baseWeight * recencyWeight);
      totalRecencyWeight += recencyWeight;
    }

    // Recent activity score = average recency weight of the analyzed window
    const recentActivityScore = signals.length > 0 ? totalRecencyWeight / signals.length : 0;

    // 5. Update the continuous score
    let newScore = Math.min(1.0, Math.max(0.0, (profile.skillScore || 0) + scoreDelta));

    // 6. Determine new level label
    let newLevel = 'beginner';
    if (newScore >= LEVEL_THRESHOLDS.advanced.min) newLevel = 'advanced';
    else if (newScore >= LEVEL_THRESHOLDS.intermediate.min) newLevel = 'intermediate';

    // 7. Update Database
    const [updated] = await db.update(learnerProfile)
      .set({
        skillScore: newScore,
        skillLevel: newLevel,
        recentActivityScore: recentActivityScore,
        lastUpdated: new Date()
      })
      .where(eq(learnerProfile.profileId, profileId))
      .returning();

    return updated;
  } catch (error: any) {
    console.error('Error in inferSkillLevel:', error.message);
    return null;
  }
}

/**
 * Update mastery for a specific concept
 * Rules:
 * 1. Understanding capped at 0.6 from passive "reading" sources.
 * 2. Recall only grows via retrieval (quizzes).
 * 3. Mastery = (Understanding * 0.45) + (Recall * 0.55)
 */
export async function updateConceptMastery(
  profileId: string,
  conceptId: string,
  type: 'understanding' | 'recall',
  delta: number,
  isPassive: boolean = false
) {
  try {
    const existing = await db.query.userConceptProgress.findFirst({
      where: and(
        eq(userConceptProgress.profileId, profileId),
        eq(userConceptProgress.conceptId, conceptId)
      )
    });

    if (existing) {
      let newUnderstanding = existing.understandingScore || 0;
      let newRecall = existing.recallScore || 0;

      if (type === 'understanding') {
        // Rule 1: Cap passive growth at 0.6
        if (isPassive && newUnderstanding >= 0.6) {
          // No growth or minimal maintenance growth
        } else {
          newUnderstanding = Math.min(1.0, Math.max(0.0, newUnderstanding + delta));
        }
      } else {
        // Rule 2: Recall grew via retrieval
        newRecall = Math.min(1.0, Math.max(0.0, newRecall + delta));
      }

      // Rule 3: Mastery Favoring Recall
      const masteryScore = (newUnderstanding * 0.45) + (newRecall * 0.55);

      let newLevel = 'learning';
      if (masteryScore > 0.8) newLevel = 'mastered';
      else if (masteryScore > 0.4) newLevel = 'familiar';

      await db.update(userConceptProgress)
        .set({
          understandingScore: newUnderstanding,
          recallScore: newRecall,
          masteryLevel: newLevel,
          lastReviewed: new Date(),
          lastRecallAt: type === 'recall' ? new Date() : existing.lastRecallAt
        })
        .where(eq(userConceptProgress.id, existing.id));
    } else {
      const uStart = type === 'understanding' ? Math.max(0, delta) : 0;
      const rStart = type === 'recall' ? Math.max(0, delta) : 0;

      const masteryScore = (uStart * 0.45) + (rStart * 0.55);

      await db.insert(userConceptProgress).values({
        profileId,
        conceptId,
        understandingScore: uStart,
        recallScore: rStart,
        masteryLevel: masteryScore > 0.4 ? 'familiar' : 'learning',
        lastRecallAt: type === 'recall' ? new Date() : null
      });
    }
  } catch (error: any) {
    console.error('Error in updateConceptMastery:', error.message);
  }
}
