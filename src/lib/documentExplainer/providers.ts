import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import { createDeepSeek } from '@ai-sdk/deepseek';

// Claude (Anthropic direct API) — Tab 1 fallback when credits are available
export const anthropic = createAnthropic({
    apiKey: process.env.CLAUDE_API_KEY || '',
});
export const CLAUDE_SONNET = 'claude-3-5-sonnet-20241022';

// Mistral — Tab 2 (Visual Map / Mermaid diagram generation)
export const mistral = createMistral({
    apiKey: process.env.MISTRAL_API_KEY || '',
});
export const MISTRAL_MODEL = 'mistral-large-latest'; // Best structured output from Mistral

// DeepSeek — Tab 3 (Creative code scenarios / code logic explanation)
export const deepseek = createDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY || '',
});
export const DEEPSEEK_MODEL = 'deepseek-chat'; // DeepSeek V3
