import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// JIT Explainer Agent
// Converts a keyword into a contextual explanation based on the codebase.

export async function explainKeyword(keyword: string, contextChunks: string[]) {
  const context = contextChunks.join("\n\n");
  
  const { text } = await generateText({
    model: openai("gpt-4o"),
    system: "You are the JIT Explainer Agent for Ved Code. Your job is to explain programming keywords and concepts specifically within the context of the user's codebase.",
    prompt: `Keyword: ${keyword}\n\nCodebase Context:\n${context}\n\nPlease explain what this keyword means in the context of this project, why it's used here, and give a brief example.`,
  });
  
  return text;
}
