import { generateText } from 'ai';
import { bedrock } from '@ai-sdk/amazon-bedrock';

export interface ContextualExplanation {
    mentalModelMatch: string;
    codeAnalysis: string;
    suggestion: string;
}

/**
 * Engine 2: JIT Context Explainer
 * Grounding LLM explanations in verified concept cards + real user code.
 */
export async function getContextExplainer(
    conceptName: string,
    mentalModel: string,
    theory: string,
    userCode: string
): Promise<ContextualExplanation | null> {
    try {
        const prompt = `
            You are an elite developer mentor for VedCode. 
            
            REFERENCE CONCEPT: "${conceptName}"
            MENTAL MODEL: "${mentalModel}"
            CORE THEORY: "${theory}"
            
            USER'S CODE SNIPPET:
            \`\`\`typescript
            ${userCode}
            \`\`\`
            
            TASK:
            Explain how the MENTAL MODEL above directly applies to the USER'S CODE. 
            
            RULES:
            1. Do NOT invent new facts about the concept. Use the provided CORE THEORY.
            2. Be extremely specific to the lines in the code snippet.
            3. Use a professional, peer-to-peer tone.
            
            STRUCTURE:
            Return a JSON object with:
            {
                "mentalModelMatch": "How the mental model (e.g. 'a waiter in a restaurant') maps to specific variables/functions in their code.",
                "codeAnalysis": "Technical breakdown of why their code behaves this way based on the concept.",
                "suggestion": "One specific, actionable tip to improve the code using this concept."
            }
            Return ONLY the JSON.
        `;

        const { text } = await generateText({
            model: bedrock("mistral.mistral-large-2402-v1:0"),
            prompt: prompt
        });

        // Parse JSON from LLM output
        const cleanedText = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanedText) as ContextualExplanation;
        
    } catch (error: any) {
        console.error('Error in getContextExplainer:', error.message);
        return null;
    }
}
