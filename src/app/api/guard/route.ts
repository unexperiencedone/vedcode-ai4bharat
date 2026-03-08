import { NextResponse } from "next/server";
import { generateText } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";

export async function POST(req: Request) {
  try {
    const { fileDiff } = await req.json();

    if (!fileDiff || typeof fileDiff !== "string") {
      return NextResponse.json({ error: "File diff is required" }, { status: 400 });
    }

    const prompt = `You are a senior software architect performing a pre-commit impact analysis.

A developer has submitted the following code change (diff or modified file content):

--- CHANGE ---
${fileDiff.slice(0, 8000)}
--- END CHANGE ---

Analyze this change and identify all potential ripple effects and impacts across the codebase.

Return ONLY valid JSON in this exact format, no markdown, no explanation:
{
  "summary": {
    "changesDetected": <number of distinct changes spotted>,
    "rippleImpacts": <total number of impact items found>,
    "safeguardStatus": "Active"
  },
  "impacts": [
    {
      "id": 1,
      "sourceFile": "<the file or module being changed>",
      "targetFile": "<the file or module that will be affected>",
      "severity": "high" | "medium" | "low",
      "reason": "<clear, specific explanation of how this change breaks or risks the target>"
    }
  ]
}

Rules:
- Identify real code risks: schema changes, type mismatches, missing fields, API contract breaks, cascading failures.
- If no impacts are found, return an empty impacts array with changesDetected: 0 and rippleImpacts: 0.
- Be specific — name actual functions, types, or patterns from the diff.
- Do NOT invent file paths unless they are clearly implied by the diff content.`;

    const { text } = await generateText({
      model: bedrock("mistral.mistral-large-2402-v1:0"),
      prompt,
    });

    let result;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      result = {
        summary: { changesDetected: 1, rippleImpacts: 1, safeguardStatus: "Active" },
        impacts: [
          {
            id: 1,
            sourceFile: "provided diff",
            targetFile: "unknown — review manually",
            severity: "medium",
            reason: "Could not parse structured analysis. Please review the diff manually for potential regressions.",
          },
        ],
      };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Guard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
