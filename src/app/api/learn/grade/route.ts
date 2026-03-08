import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { z } from "zod";

const GradeSchema = z.object({
  correct: z.boolean().describe("Whether the answer shows strong conceptual understanding and correctness."),
  message: z.string().describe("A very brief, encouraging explanation or correction.")
});

export async function POST(req: Request) {
  try {
    const { question, userAnswer, correctAnswer } = await req.json();

    if (!question || !userAnswer || !correctAnswer) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const { object } = await generateObject({
      model: bedrock("mistral.mistral-large-2402-v1:0"),
      schema: GradeSchema,
      system: 
        "You are an active recall grading assistant. " +
        "You evaluate a user's free-text answer against the correct answer/rubric. " +
        "Be lenient on exact phrasing, but strict on core conceptual understanding. " +
        "Determine if the user's answer is correct conceptually.",
      prompt: `Question: ${question}\n\nCorrect Answer/Rubric: ${correctAnswer}\n\nUser's Answer: ${userAnswer}\n\nGrade this answer.`
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error("[Grade API]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
