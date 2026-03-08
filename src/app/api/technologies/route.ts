import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { technologies } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allTechs = await db.query.technologies.findMany({
      columns: {
        id: true,
        slug: true,
        name: true,
      },
      orderBy: [desc(technologies.createdAt)],
    });

    return NextResponse.json({ technologies: allTechs });
  } catch (error: any) {
    console.error("[Technologies API] Error:", error.message);
    return NextResponse.json({ error: "Failed to load technologies" }, { status: 500 });
  }
}
