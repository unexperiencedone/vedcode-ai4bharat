import { NextResponse } from "next/server";
import { generateRecallPrompt } from "@/lib/agents/recall";

export async function POST(req: Request) {
    try {
        const { keywords, context } = await req.json();

        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
            return NextResponse.json({ error: "keywords array is required" }, { status: 400 });
        }

        const challenge = await generateRecallPrompt(
            keywords,
            context ?? ""
        );

        return NextResponse.json({ challenge });
    } catch (error: any) {
        console.error("[Recall API]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
