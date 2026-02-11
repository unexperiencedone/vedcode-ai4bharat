import { db } from "@/lib/db";
import { profiles, logs } from "@/db/schema";
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

    // Build update object — only include image if user uploaded one
    const updateData: Record<string, any> = {
      name: data.name,
      handle: data.handle,
      bio: data.bio,
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
    };

    // Only overwrite image if user uploaded a new one during onboarding
    if (data.image) {
      updateData.image = data.image;
    }

    await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.email, session.user.email));

    // Log the profile creation event for the Live Feed
    await db.insert(logs).values({
      action: "MEMBER_JOIN",
      cluster: 1,
      author: data.name || session.user.name || "Unknown",
      target: `@${data.handle}`,
      message: `Welcome to The Archive, @${data.handle}.`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
