import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logs } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const recentLogs = await db
      .select()
      .from(logs)
      .orderBy(desc(logs.timestamp))
      .limit(50); // Fetch last 50 logs for the feed

    return NextResponse.json(recentLogs);
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
