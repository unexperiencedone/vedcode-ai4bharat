import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { technologies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { slug, name, category } = await req.json();

    if (!slug || !name) {
      return NextResponse.json({ error: "slug and name are required" }, { status: 400 });
    }

    // Upsert — don't fail if already exists
    const existing = await db.query.technologies.findFirst({
      where: eq(technologies.slug, slug),
    });

    if (existing) {
      return NextResponse.json({ message: `Technology '${slug}' already exists`, id: existing.id });
    }

    const [tech] = await db
      .insert(technologies)
      .values({ slug, name, category: category || "other" })
      .returning();

    return NextResponse.json({ message: `Created '${slug}'`, id: tech.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
