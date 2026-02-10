import { db } from "@/lib/db";
import { logs } from "@/db/schema";

export async function createArchiveLog(data: {
  action: string;
  cluster: number;
  author: string;
  target?: string;
  message?: string;
}) {
  try {
    await db.insert(logs).values({
      action: data.action,
      cluster: data.cluster,
      author: data.author,
      target: data.target,
      message: data.message,
    });
  } catch (error) {
    console.error("Failed to create log:", error);
    // Silent fail to not disrupt main flow
  }
}
