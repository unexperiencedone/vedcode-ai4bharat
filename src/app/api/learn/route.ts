import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
    try {
        const { keyword } = await fetch("/api/parse-body", { method: "POST", body: req.body }).then(res => res.json()).catch(async () => await req.json());

        if (!keyword) {
            return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
        }

        // In a full implementation, we'd pull the `projectFiles` from Drizzle here to pass as context mapping
        // const files = await db.select().from(projectFiles).where(eq(projectFiles.userId, session.user.id));

        // For MVP, we use the LLM to generate a simulated "Code-First" and "Theory-Second" response structured beautifully
        const prompt = `
      You are an elite developer mentor. The user has asked for an explanation of the concept / keyword: "${keyword}".
      
      Respond in Markdown. 
      Structure your response exactly like this:
      
      ### Code-First Context (Simulated Project Match)
      Provide a highly realistic, brief 5-10 line code snippet in TypeScript showing exactly how this keyword is typically implemented in a Next.js/Drizzle/Tailwind project.
      Explain the snippet in 1-2 sentences.

      ### Theory-Second Explanation
      Provide a brilliantly clear, concise 2 paragraph explanation of what this concept actually is and why it was invented.
      Avoid fluff. Use analogies if helpful.
    `;

        // Using OpenAI connection if configured, otherwise returning simulated response
        if (process.env.OPENAI_API_KEY) {
            const { text } = await generateText({
                model: openai("gpt-4o-mini"),
                prompt: prompt
            });

            return NextResponse.json({ explanation: text });
        }

        // Fallback if no API key
        return NextResponse.json({
            explanation: `### Code-First Context\n\`\`\`typescript\n// Placeholder Code\nconst example = "${keyword}";\n\`\`\`\nThis is a simulated ${keyword} example.\n\n### Theory-Second\n${keyword} is a critical component in modern web development.`
        });

    } catch (error) {
        console.error("Learn API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
