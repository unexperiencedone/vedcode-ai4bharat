import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { learnerProfile, userConceptProgress, profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const CreateProfileSchema = z.object({
  profileId: z.string().uuid(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  skillScore: z.number().min(0).max(1).optional().default(0.0),
  learningStyle: z.enum(['visual', 'textual', 'mixed']),
  preferredDepth: z.enum(['walkthrough', 'balanced', 'key_points']),
  confidenceScore: z.number().min(0).max(1),
  preferredLanguages: z.array(z.string()).optional().default([]),
  interestDomains: z.array(z.string()).optional().default([]),
  inferredFromOnboarding: z.boolean().optional().default(true),
});

const UpdateProfileSchema = z.object({
  profileId: z.string().uuid(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  skillScore: z.number().min(0).max(1).optional(),
  learningStyle: z.enum(['visual', 'textual', 'mixed']).optional(),
  preferredDepth: z.enum(['walkthrough', 'balanced', 'key_points']).optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  preferredLanguages: z.array(z.string()).optional(),
  interestDomains: z.array(z.string()).optional(),
  challengeAccuracy: z.number().min(0).max(1).optional(),
  avgTimeOnExplanation: z.number().min(0).optional(),
  totalKeywordsLearned: z.number().min(0).optional(),
  conceptMasteryScore: z.number().min(0).max(1).optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 });
    }

    const profile = await db.query.learnerProfile.findFirst({
      where: eq(learnerProfile.profileId, profileId),
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Error fetching learner profile:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const result = CreateProfileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.format() }, { status: 400 });
    }

    const {
      profileId,
      skillLevel,
      skillScore,
      learningStyle,
      preferredDepth,
      confidenceScore,
      preferredLanguages,
      interestDomains,
      inferredFromOnboarding
    } = result.data;

    // Check if profile already exists
    const existing = await db.query.learnerProfile.findFirst({
      where: eq(learnerProfile.profileId, profileId),
    });

    if (existing) {
      // If profile exists but user is still here, they might be in a stuck state.
      // Repair the main profile status and return success.
      await db.update(profiles)
        .set({ onboardingComplete: true })
        .where(eq(profiles.id, profileId));

      return NextResponse.json(existing, { status: 200 });
    }

    // Create new profile and update main profile status in a transaction
    const newProfile = await db.transaction(async (tx) => {
      const [inserted] = await tx.insert(learnerProfile).values({
        profileId,
        skillLevel,
        skillScore,
        learningStyle,
        preferredDepth,
        confidenceScore,
        preferredLanguages,
        interestDomains,
        inferredFromOnboarding,
      }).returning();

      await tx.update(profiles)
        .set({ onboardingComplete: true })
        .where(eq(profiles.id, profileId));

      return inserted;
    });

    return NextResponse.json(newProfile, { status: 201 });


  } catch (error: any) {
    console.error('CRITICAL: Error creating learner profile:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}


export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const result = UpdateProfileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.format() }, { status: 400 });
    }

    const { profileId, ...updates } = result.data;

    // Check if profile exists
    const existing = await db.query.learnerProfile.findFirst({
      where: eq(learnerProfile.profileId, profileId),
    });

    if (!existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Ensure lastUpdated is updated
    const updateData = {
      ...updates,
      lastUpdated: new Date(),
    };

    const [updatedProfile] = await db.update(learnerProfile)
      .set(updateData)
      .where(eq(learnerProfile.profileId, profileId))
      .returning();

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    console.error('Error updating learner profile:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
