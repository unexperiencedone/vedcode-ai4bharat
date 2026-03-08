"use server";

import { db } from "../db";
import { chatSessions, chatMessages } from "../../db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { embedText } from "../vedcode/embeddings";

// Helper: serialize a number[] into a Postgres-compatible vector literal
function toVectorLiteral(arr: number[]): string {
  return `[${arr.join(",")}]`;
}

export async function createChatSession(profileId: string, title?: string) {
  const [session] = await db
    .insert(chatSessions)
    .values({
      profileId,
      title: title || "New Conversation",
    })
    .returning();
  return session;
}

export async function getChatSessions(profileId: string) {
  return await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.profileId, profileId))
    .orderBy(desc(chatSessions.updatedAt));
}

export async function saveChatMessage(
  sessionId: string,
  profileId: string,
  role: "user" | "tutor",
  content: string
) {
  // Generate embedding for memory (non-blocking — skipped if it fails)
  let embeddingVector: string | null = null;
  try {
    const embedding = await embedText(content);
    // Validate dimension before inserting to avoid Postgres vector mismatch
    if (embedding && embedding.length === 512) {
      embeddingVector = toVectorLiteral(embedding);
    }
  } catch (err) {
    console.error("Failed to generate embedding for chat message:", err);
  }

  // Single atomic insert — use raw SQL for vector cast to avoid Drizzle serialization issue
  const [message] = await db.execute<typeof chatMessages.$inferSelect>(sql`
    INSERT INTO chat_messages (id, session_id, profile_id, role, content, embedding, created_at)
    VALUES (
      gen_random_uuid(),
      ${sessionId},
      ${profileId},
      ${role},
      ${content},
      ${embeddingVector ? sql.raw(`'${embeddingVector}'::vector`) : sql`NULL`},
      NOW()
    )
    RETURNING *
  `);

  // Update session's updatedAt timestamp
  await db
    .update(chatSessions)
    .set({ updatedAt: new Date() })
    .where(eq(chatSessions.id, sessionId));

  return message;
}

export async function getChatSessionMessages(sessionId: string) {
  return await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);
}

/**
 * Search for past messages that are semantically similar to the current query.
 * This provides "long-term memory" across sessions.
 */
export async function searchSimilarMessages(
  profileId: string,
  query: string,
  limit: number = 5
) {
  try {
    const embedding = await embedText(query);
    if (!embedding || embedding.length !== 512) return [];

    const vectorStr = toVectorLiteral(embedding);

    // Use cosine similarity (<=>) for normalized vectors from Titan
    const results = await db.execute(sql`
      SELECT id, role, content, 1 - (embedding <=> ${vectorStr}::vector) as similarity
      FROM chat_messages
      WHERE profile_id = ${profileId}
      AND embedding IS NOT NULL
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT ${limit}
    `);

    return results as unknown as Array<{
      id: string;
      role: string;
      content: string;
      similarity: number;
    }>;
  } catch (err) {
    console.error("Semantic search failed:", err);
    return [];
  }
}
