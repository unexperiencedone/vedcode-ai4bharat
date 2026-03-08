import { generateObject } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { z } from "zod";

// Active Recall Agent
// Generates spaced-repetition micro-challenges based on concepts the user recently engaged with.

export const RecallChallengeSchema = z.object({
  type: z.enum(["free-text", "multiple-choice", "code-completion"]),
  question: z.string().describe("The concise active recall question."),
  snippet: z.string().optional().describe("For code-completion, a code snippet with __BLANK__ representing the missing keyword/concept."),
  options: z.array(z.string()).optional().describe("For multiple-choice, array of exactly 4 plausible options."),
  correctAnswer: z.string().describe("The correct answer. Must exactly match one of the options if multiple-choice, or the exact missing keyword if code-completion. For free-text, provide a concise rubric for grading."),
});

export type RecallChallenge = z.infer<typeof RecallChallengeSchema>;

export async function generateRecallPrompt(
  recentKeywords: string[],
  projectContext: string
): Promise<RecallChallenge> {
  const { object } = await generateObject({
    model: bedrock("mistral.mistral-large-2402-v1:0"),
    schema: RecallChallengeSchema,
    system:
      "You are an Active Recall mentor for a developer learning platform. " +
      "Your job is to test developers' memory by generating a concise micro-challenge " +
      "about a concept they recently worked with. " +
      "You must randomly select one of three formats: 'free-text' (a direct question), " +
      "'multiple-choice' (a question with 4 options), or 'code-completion' (a code block with exactly one __BLANK__). " +
      "Ensure the question tests understanding of the core concept, not rote trivia.",
    prompt: `Recent concepts the developer engaged with: ${recentKeywords.join(", ")}\n\nProject context:\n${projectContext}\n\nGenerate ONE active recall micro-challenge targeting the most significant concept above.`,
  });

  return object;
}
