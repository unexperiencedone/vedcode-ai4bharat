import { NextResponse } from 'next/server';
import { converse, MISTRAL_LARGE_2_ID } from '@/lib/documentExplainer/bedrock';

export const maxDuration = 60;

const SCENARIOS_SYSTEM_PROMPT = `You are the "Master Pedagogical Architect" specializing in Creative Logic Mapping. Your mission is to explore how a document's core axioms translate into a vast universe of applications.

# WRITING PRINCIPLES
1. CROSS-DOMAIN MAPPING: Map the documentation's logic to completely different industries (e.g. Finance, Bio-tech, Game Engines, Robotics).
2. "BARRIER" ARCHITECTURE: If the logic faces a bottleneck in a specific domain, explain the creative "architectural bypass."
3. HUMAN-READABLE MATH: If you use math, break it down into a "Human-Readable Key" where variables are characters in a story.
4. VARIETY: Do not limit yourself to 3 scenarios. Provide as many as are truly insightful.

# 🎨 FORMATTING & READABILITY
1. USE AIRY SPACING: Use double-newlines between paragraphs.
2. SYMBOLS & SEPARATION: Use symbols (---, 🚩, 🚀) to separate distinct logic blocks.
3. HIERARCHY: Use ## for the Universe title and ### for each Scenario.

# DOCUMENT STRUCTURE
- ## 🌌 Creative Application Universe
  (A high-level narrative on the universal versatility of this logic.)

- ### [Scenario Title]: [Domain Name]
  **The Logic Mapping:** (How the core pattern works in this new domain)
  **The Architectural Bypass:** (How to handle domain-specific limitations)
  **The Insight:** (Why this is a "Master Move" for a developer)

(Repeat for diverse scenarios)

---
## 🧩 The Universal Principle
(One deep-dive paragraph on the core axiom that makes this logic globally reusable.)`;

export async function POST(req: Request) {
    try {
        const { documentContent } = await req.json();

        if (!documentContent) {
            return NextResponse.json({ error: 'Document content is required' }, { status: 400 });
        }

        console.log('[Tab 3] Bedrock Creative Universe (Mistral Large 2) started...');

        const text = await converse(
            MISTRAL_LARGE_2_ID, 
            [{ role: "user", content: [{ text: `Analyze this core logic and explore its vast potential across different creative domains:\n\n${documentContent}` }] }], 
            SCENARIOS_SYSTEM_PROMPT,
            0.8
        );

        return NextResponse.json({ scenarios: text });
    } catch (error: any) {
        console.error('[Tab 3] Scenarios Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to generate scenarios' },
            { status: 500 }
        );
    }
}
