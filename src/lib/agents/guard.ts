import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// Context Guard Agent
// Analyzes code changes and performs pre-execution checks to warn about ripple effects.

export async function preflightCheck(diff: string, projectContext: string) {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    system: "You are the Context Guard Agent for VedCode. Your job is to analyze potential code changes (diffs) against the broader project architecture to identify downstream breaking changes, ripple effects, and architectural mismatches.",
    prompt: `Code Diff:\n${diff}\n\nProject Architecture Context (AST/Dependencies):\n${projectContext}\n\nAnalyze this change and determine if it breaks any other files (UI components, schemas, middleware). List the affected files and briefly explain why.`,
  });
  
  return text;
}
