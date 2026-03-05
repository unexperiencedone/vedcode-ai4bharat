import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { skillSignals, learnerProfile } from '@/db/schema';
import { z } from 'zod';
import { inferSkillLevel } from '@/lib/learner/inference';
import { eq } from 'drizzle-orm';

const SignalSchema = z.object({
    profileId: z.string().uuid(),
    conceptId: z.string().uuid().optional(),
    signalType: z.enum([
        'concept_viewed',
        'quiz_answered',
        'jit_explainer_used',
        'example_opened',
        'advanced_tab_opened',
        'keyword_search',
        'roadmap_step_complete'
    ]),
    payload: z.record(z.string(), z.any()).default({}),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate request body
        const result = SignalSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input', details: result.error.format() }, { status: 400 });
        }

        const { profileId, conceptId, signalType, payload } = result.data;

        // Log the signal
        const [newSignal] = await db.insert(skillSignals).values({
            profileId,
            conceptId: conceptId || null,
            signalType,
            payload,
        }).returning();

        // Update lastSignalAt on the profile
        await db.update(learnerProfile)
            .set({ lastSignalAt: new Date() })
            .where(eq(learnerProfile.profileId, profileId));

        // Trigger background skill inference
        // Fire and forget - don't await so API stays fast
        inferSkillLevel(profileId, newSignal).catch(err => console.error('Skill Inference Error:', err));

        return NextResponse.json(newSignal, { status: 201 });
    } catch (error: any) {
        console.error('Error logging skill signal:', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
