/**
 * VedaCode Embeddings — Amazon Titan Embed Text v2
 * Fixed at 512 dimensions: best balance of accuracy and DynamoDB storage size.
 */
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const TITAN_EMBED_MODEL = 'amazon.titan-embed-text-v2:0';
const EMBED_DIMENSIONS = 512;

/**
 * Generate a 512-dimensional embedding for the given text.
 * Titan Embed supports 256, 512, or 1024 dims. 512 is the sweet spot.
 */
export async function embedText(text: string): Promise<number[]> {
    // Titan has a ~8192 token limit — truncate conservatively
    const truncated = text.slice(0, 8000);

    const payload = {
        inputText: truncated,
        dimensions: EMBED_DIMENSIONS,
        normalize: true, // unit-normalized for cleaner cosine similarity
    };

    const command = new InvokeModelCommand({
        modelId: TITAN_EMBED_MODEL,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const body = JSON.parse(new TextDecoder().decode(response.body));

    return body.embedding as number[];
}

/**
 * Embed multiple texts with rate-limit-friendly concurrency (max 3 at once).
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    const batchSize = 3;

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const embeddings = await Promise.all(batch.map(embedText));
        results.push(...embeddings);
        // Small pause between batches to avoid throttling
        if (i + batchSize < texts.length) {
            await new Promise(res => setTimeout(res, 200));
        }
    }

    return results;
}
