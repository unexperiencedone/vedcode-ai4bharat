import { NextResponse } from "next/server";
import { PersonalizedRoadmap } from "@/lib/intelligence/personalizedRoadmap";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { goal, techSlug } = body;

        if (!goal || !techSlug) {
            return NextResponse.json({ error: "Goal and techSlug are required." }, { status: 400 });
        }

        const roadmap = await PersonalizedRoadmap.generate(goal, techSlug);

        return NextResponse.json({ roadmap });
    } catch (error: any) {
        console.error("[Roadmap/Generate] API Error:", error.message);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
