import { NextResponse } from "next/server";
import { getSkillStats } from "@/lib/mastery";

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getSkillStats();
  return NextResponse.json(data);
}
