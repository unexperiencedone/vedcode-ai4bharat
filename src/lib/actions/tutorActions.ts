"use server";

import { TutorIntentRouter } from '../code-intelligence/tutorIntentRouter';
import { ReasoningContext } from '../types/tutor';
import { generateText } from "ai";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { searchSimilarMessages } from "./chatActions";

export async function getTutorReasoning(
    query: string,
    currentFilePath: string | null,
    userProfileId: string,
    pageContext?: any
): Promise<ReasoningContext> {
    // 1. Core context gathering via static analysis & DB
    const context = await TutorIntentRouter.routeQuery(
        query,
        currentFilePath,
        userProfileId
    );

    // 2. Fetch semantic memory from past conversations
    const pastMessages = await searchSimilarMessages(userProfileId, query, 3);
    context.pastMessages = pastMessages.map(m => ({ role: m.role, content: m.content }));

    // 3. LLM Synthesis for actual helpful response using AWS Bedrock Nova Pro
    try {
        const { text } = await generateText({
            model: bedrock("amazon.nova-pro-v1:0"),
            system: `You are Veda, an expert engineering mentor. 
            
            Current Live Context:
            - Active File: ${context.activeFile || 'None'}
            - Search Keyword/Topic: ${pageContext?.searchKeyword || 'None'}
            - Intent: ${context.intent}
            - Concepts in File: ${context.conceptsInFile.join(', ')}
            - User Mastery: ${JSON.stringify(context.userMastery)}
            
            Historical Context (Semantic Memory):
            ${context.pastMessages?.length ? 
              context.pastMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n') 
              : 'No relevant history found.'}

            Priority Guidelines:
            1. ALWAYS prioritize the "Current Live Context" (especially the Search Keyword) over any historical memory.
            2. If the user asks about the search keyword, disregard conflicting information from past sessions.
            3. Use history only for continuity or when the current context is insufficient.
            4. Keep responses concise, professional, and mentoring in tone.
            5. Do NOT use the phrase "Standard contextual response".`,
            prompt: query,
        });

        context.systemReasoning = text;
    } catch (error) {
        console.error("AI Generation failed:", error);
        // Fallback already handled in context.systemReasoning by TutorIntentRouter or hardcoded fallback
    }

    return context;
}


