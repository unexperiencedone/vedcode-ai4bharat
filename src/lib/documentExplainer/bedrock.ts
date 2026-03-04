import { BedrockRuntimeClient, ConverseCommand, ConverseStreamCommand, Message, ContentBlock } from "@aws-sdk/client-bedrock-runtime";

// Model IDs from Bedrock Console
export const NOVA_2_PRO_ID = process.env.BEDROCK_NOVA_PRO_ID || "amazon.nova-pro-v1:0";
export const MISTRAL_LARGE_2_ID = process.env.BEDROCK_MISTRAL_LARGE_ID || "mistral.mistral-large-2407-v1:0";
export const LLAMA_3_2_ID = process.env.BEDROCK_LLAMA_3_2_ID || "meta.llama3-2-3b-instruct-v1:0";

// AWS Configuration
const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Standard Converse API caller for Bedrock.
 */
export async function converse(
  modelId: string,
  messages: Message[],
  systemPrompt?: string,
  temperature: number = 0.4
) {
  try {
    const system = systemPrompt ? [{ text: systemPrompt }] : [];
    
    const command = new ConverseCommand({
      modelId,
      messages,
      system,
      inferenceConfig: {
        maxTokens: 4096,
        temperature,
        topP: 0.9,
      },
    });

    const response = await client.send(command);

    if (!response.output?.message?.content) {
       throw new Error("Empty response from Bedrock");
    }

    const text = response.output.message.content
      .filter((block: ContentBlock) => block.text)
      .map((block: ContentBlock) => block.text)
      .join("\n");

    return text;
  } catch (error: any) {
    console.error(`[Bedrock Converse Error] Model: ${modelId}`, error);
    throw error;
  }
}

/**
 * Streaming Converse API caller for Bedrock.
 * Returns an async generator that yields text chunks.
 */
export async function* streamConverse(
  modelId: string,
  messages: Message[],
  systemPrompt?: string,
  temperature: number = 0.4
) {
  try {
    const system = systemPrompt ? [{ text: systemPrompt }] : [];
    
    const command = new ConverseStreamCommand({
      modelId,
      messages,
      system,
      inferenceConfig: {
        maxTokens: 4096,
        temperature,
        topP: 0.9,
      },
    });

    const response = await client.send(command);

    if (!response.stream) {
      throw new Error("Stream not available in Bedrock response");
    }

    for await (const chunk of response.stream) {
      if (chunk.contentBlockDelta?.delta?.text) {
        yield chunk.contentBlockDelta.delta.text;
      }
    }
  } catch (error: any) {
    console.error(`[Bedrock Stream Error] Model: ${modelId}`, error);
    throw error;
  }
}

/**
 * Helper to convert UI Messages to Bedrock Messages
 * Handles both standard content strings and AI SDK 'parts'
 */
export function convertToBedrockMessages(messages: any[]): Message[] {
  return messages.map((msg) => {
    let text = "";
    
    // 1. Handle standard 'content' string
    if (typeof msg.content === "string") {
      text = msg.content;
    } 
    // 2. Handle AI SDK 'parts' array (v3/v4)
    else if (msg.parts && Array.isArray(msg.parts)) {
      text = msg.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("");
    }
    // 3. Fallback to stringified content if it's an object/array
    else if (msg.content) {
      text = typeof msg.content === "object" ? JSON.stringify(msg.content) : String(msg.content);
    }

    return {
      role: msg.role === "user" ? "user" : "assistant",
      content: [{ text: text || " " }], // Ensure text is never empty and NEVER undefined
    };
  });
}
