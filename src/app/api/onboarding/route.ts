import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    await db
      .update(profiles)
      .set({
        name: data.name,
        handle: data.handle,
        bio: data.bio,
        image: data.image,
        linkedin: data.linkedin,
        github: data.github,
        codingPhilosophy: data.codingPhilosophy,
        interests: data.interests,
        hobbies: data.hobbies,
        primaryOs: data.primaryOs,
        preferredIde: data.preferredIde,
        hardwareSetup: data.hardwareSetup,
        themePreference: data.themePreference,
        onboardingComplete: true,
      })
      .where(eq(profiles.email, session.user.email));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
