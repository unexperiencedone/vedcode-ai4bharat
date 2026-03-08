import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conceptQuizzes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateText } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";

/**
 * POST /api/learn/quiz
 * Generates (or returns cached) a concept-specific MCQ question.
 * Cache key = techSlug::conceptSlug — so "python::variables" ≠ "javascript::variables".
 */
export async function POST(req: Request) {
  try {
    const { techSlug, conceptSlug, conceptName, oneLiner } = await req.json();

    if (!conceptSlug || !conceptName) {
      return NextResponse.json({ error: "conceptSlug and conceptName required" }, { status: 400 });
    }

    const tech = techSlug || "general";
    const cacheKey = `${tech}::${conceptSlug}`;

    // Return cached quiz if it exists
    const cached = await db.query.conceptQuizzes.findFirst({
      where: eq(conceptQuizzes.cacheKey, cacheKey),
    });

    if (cached) {
      return NextResponse.json({
        question: cached.question,
        options: cached.options,
        correctIndex: cached.correctIndex,
        explanation: cached.explanation,
        cached: true,
      });
    }

    // Generate a new concept-specific MCQ
    const prompt = `
You are an expert computer science educator. Generate ONE multiple-choice question to test understanding of this concept:

Concept: "${conceptName}"
Context: "${oneLiner || conceptName} (in ${tech})"

The question should:
- Test conceptual understanding, not trivia
- Have exactly 4 options
- Have exactly ONE correct answer
- Provide a clear explanation of why the correct answer is right

Return EXACTLY this JSON (no extra text):
{
  "question": "...",
  "options": ["option A", "option B", "option C", "option D"],
  "correctIndex": 0,
  "explanation": "..."
}
    `.trim();

    const { text } = await generateText({
      model: bedrock("mistral.mistral-large-2402-v1:0"),
      prompt,
    });

    let quizData: { question: string; options: string[]; correctIndex: number; explanation: string };
    try {
      const match = text.match(/\{[\s\S]*\}/);
      quizData = JSON.parse(match ? match[0] : text);
    } catch {
      return NextResponse.json({ error: "Failed to parse quiz response" }, { status: 500 });
    }

    // Validate structure
    if (!quizData.question || !Array.isArray(quizData.options) || quizData.options.length !== 4) {
      return NextResponse.json({ error: "Invalid quiz structure from AI" }, { status: 500 });
    }

    // Cache it
    await db.insert(conceptQuizzes).values({
      cacheKey,
      conceptSlug,
      question: quizData.question,
      options: quizData.options,
      correctIndex: quizData.correctIndex,
      explanation: quizData.explanation,
    }).onConflictDoNothing();

    return NextResponse.json({
      question: quizData.question,
      options: quizData.options,
      correctIndex: quizData.correctIndex,
      explanation: quizData.explanation,
      cached: false,
    });
  } catch (error: any) {
    console.error("[Learn/Quiz] Error:", error.message);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}
