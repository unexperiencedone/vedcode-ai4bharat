import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// Active Recall Agent
// Used to parse the memory log and generate custom spaced-repetition micro-challenges based on keywords previously interacted with in the codebase.

export async function generateRecallPrompt(recentKeywords: string[], projectContext: string) {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    system: "You are the Active Recall sidekick mentor for Ved Code. Your job is to test developers' memory by asking a micro-challenge about a concept they recently engaged with in their codebase.",
    prompt: `Recent Keywords: ${recentKeywords.join(", ")}\n\nProject Architecture Context:\n${projectContext}\n\nGenerate ONE engaging micro-challenge question that forces the developer to active recall how one of these keywords works or is implemented in their project. Do not give the answer away.`,
  });
  
  return text;
}
