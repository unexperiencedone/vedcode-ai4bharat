/**
 * Creates (or resets) the public demo account, already past onboarding, so anyone —
 * a reviewer, a recruiter, or a screenshot bot — can log in and see the real features.
 *
 *   npx tsx src/scripts/create-demo.ts
 *
 * The credentials are public on purpose: this account is for showing the app, not for
 * holding anything. Override them with DEMO_EMAIL / DEMO_PASSWORD if you want a private one.
 * Running it again resets the password and onboarding state; it never touches other users.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { exit } from "process";
import { db } from "../lib/db";
import { learnerProfile, profiles } from "../db/schema";

export const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@vedcode.dev";
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "VedCodeDemo#2026";

async function main() {
  const password = await bcrypt.hash(DEMO_PASSWORD, 12); // same cost as registration
  const fields = {
    name: "Demo Developer",
    role: "Developer",
    skillLevel: "intermediate",
    bio: "The public demo account for VedCode.",
    onboardingComplete: true,
    password,
  };

  const [existing] = await db.select().from(profiles).where(eq(profiles.email, DEMO_EMAIL)).limit(1);
  let profileId: string;
  if (existing) {
    await db.update(profiles).set(fields).where(eq(profiles.id, existing.id));
    profileId = existing.id;
    console.log(`Reset the demo account (${DEMO_EMAIL}).`);
  } else {
    const [created] = await db
      .insert(profiles)
      .values({ ...fields, email: DEMO_EMAIL, handle: "vedcode-demo" })
      .returning({ id: profiles.id });
    profileId = created.id;
    console.log(`Created the demo account (${DEMO_EMAIL}).`);
  }

  // The learner profile onboarding would have written, so Learn/Handbook personalise.
  await db
    .insert(learnerProfile)
    .values({
      profileId,
      skillLevel: "intermediate",
      learningStyle: "visual",
      preferredDepth: "balanced",
      preferredLanguages: ["TypeScript", "Python"],
      interestDomains: ["Web", "AI"],
      inferredFromOnboarding: true,
    })
    .onConflictDoNothing();

  console.log(`Log in at /login with ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  exit(0);
}

main().catch((error) => {
  console.error("Couldn't create the demo account:", error);
  exit(1);
});
