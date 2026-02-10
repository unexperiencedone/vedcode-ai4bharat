"use server";

import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createArchiveLog } from "./logger";

export async function updateLearningStatus(clerkId: string, status: string) {
  try {
    const [user] = await db.update(profiles)
      .set({ currentLearning: status })
      .where(eq(profiles.clerkId, clerkId))
      .returning();

    if (!user) {
      throw new Error("User not found");
    }

    // Log to the Live Feed automatically
    await createArchiveLog({
      action: 'LEARNING_UPDATE',
      cluster: 3, // The Human Cluster
      author: user.name, // Using name as author for now, as consistent with schema
      target: status, 
      message: `Started learning: ${status}`
    });

    return { success: true, user };
  } catch (error) {
    console.error("Failed to update learning status:", error);
    return { success: false, error };
  }
}
