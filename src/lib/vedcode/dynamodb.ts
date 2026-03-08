/**
 * VedCode DynamoDB Client
 * Single-table design: pk = SOURCE#<sourceId>, sk = CHUNK#<chunkId>
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    UpdateCommand,
    GetCommand,
    ScanCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const docClient = DynamoDBDocumentClient.from(client);
const TABLE = process.env.DYNAMODB_TABLE_NAME || 'VedcodeTable';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DocChunk {
    sourceId: string;       // e.g. "nextjs-app-router"
    chunkId: string;        // e.g. "0042"
    pageTitle: string;      // e.g. "Next.js App Router Docs"
    parentHeader: string;   // e.g. "Installation > System Requirements"
    text: string;           // raw chunk text
    embedding: number[];    // 512-dim Titan vector
    url: string;            // original page URL
    ingestedAt: string;     // ISO timestamp
}

export interface SourceMeta {
    sourceId: string;
    name: string;           // human-friendly label
    url: string;            // root URL
    status: 'ingesting' | 'embedding' | 'graphing' | 'page-insights' | 'bridges' | 'done' | 'error';
    chunkCount: number;
    conceptGraph?: ConceptNode[];
    ingestedAt: string;
    error?: string;
}

export interface ConceptNode {
    concept: string;
    prerequisite?: string;
    unlocks?: string[];
    related?: string[];
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function putChunk(chunk: DocChunk): Promise<void> {
    await docClient.send(new PutCommand({
        TableName: TABLE,
        Item: {
            pk: `SOURCE#${chunk.sourceId}`,
            sk: `CHUNK#${chunk.chunkId.padStart(6, '0')}`,
            type: 'CHUNK',
            ...chunk,
        },
    }));
}

export async function putSourceMeta(meta: SourceMeta): Promise<void> {
    // Main meta entry
    await docClient.send(new PutCommand({
        TableName: TABLE,
        Item: {
            pk: `SOURCE#${meta.sourceId}`,
            sk: 'META',
            type: 'SOURCE_META',
            ...meta,
        },
    }));
    // Lightweight index entry — lets listAllSources use Query instead of Scan
    await docClient.send(new PutCommand({
        TableName: TABLE,
        Item: {
            pk: 'SOURCES_INDEX',
            sk: `SOURCE#${meta.sourceId}`,
            type: 'SOURCE_INDEX',
            sourceId: meta.sourceId,
            name: meta.name,
            url: meta.url,
            ingestedAt: meta.ingestedAt,
        },
    }));
}

export async function updateSourceStatus(
    sourceId: string,
    status: SourceMeta['status'],
    extra?: Partial<SourceMeta>
): Promise<void> {
    const updates: string[] = ['#st = :status'];
    const names: Record<string, string> = { '#st': 'status' };
    const values: Record<string, any> = { ':status': status };

    if (extra?.chunkCount !== undefined) {
        updates.push('chunkCount = :cc');
        values[':cc'] = extra.chunkCount;
    }
    if (extra?.conceptGraph !== undefined) {
        updates.push('conceptGraph = :cg');
        values[':cg'] = extra.conceptGraph;
    }
    if (extra?.error !== undefined) {
        updates.push('#err = :err');
        names['#err'] = 'error';
        values[':err'] = extra.error;
    }

    await docClient.send(new UpdateCommand({
        TableName: TABLE,
        Key: { pk: `SOURCE#${sourceId}`, sk: 'META' },
        UpdateExpression: `SET ${updates.join(', ')}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
    }));
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getSourceMeta(sourceId: string): Promise<SourceMeta | null> {
    const result = await docClient.send(new GetCommand({
        TableName: TABLE,
        Key: { pk: `SOURCE#${sourceId}`, sk: 'META' },
    }));
    return result.Item ? (result.Item as SourceMeta) : null;
}

export async function queryChunks(sourceId: string): Promise<DocChunk[]> {
    const result = await docClient.send(new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
        ExpressionAttributeValues: {
            ':pk': `SOURCE#${sourceId}`,
            ':prefix': 'CHUNK#',
        },
    }));
    return (result.Items || []) as DocChunk[];
}

export async function listAllSources(): Promise<SourceMeta[]> {
    // Primary path: Query the SOURCES_INDEX partition (only needs dynamodb:Query)
    const indexResult = await docClient.send(new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
        ExpressionAttributeValues: {
            ':pk': 'SOURCES_INDEX',
            ':prefix': 'SOURCE#',
        },
    }));

    const indexItems = indexResult.Items || [];

    if (indexItems.length > 0) {
        // Fetch full SourceMeta for each indexed source (parallel GetItem calls)
        const metas = await Promise.all(
            indexItems.map(item => getSourceMeta(item.sourceId as string))
        );
        return metas.filter(Boolean) as SourceMeta[];
    }

    // Fallback: Scan for pre-index data (requires dynamodb:Scan — fine if allowed)
    try {
        const scanResult = await docClient.send(new ScanCommand({
            TableName: TABLE,
            FilterExpression: '#t = :t',
            ExpressionAttributeNames: { '#t': 'type' },
            ExpressionAttributeValues: { ':t': 'SOURCE_META' },
        }));
        return (scanResult.Items || []) as SourceMeta[];
    } catch {
        // Scan not permitted — no index entries yet, return empty
        return [];
    }
}

// ─── Vector Search ────────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

export async function vectorSearch(
    queryEmbedding: number[],
    sourceId: string,
    topK: number = 5
): Promise<Array<DocChunk & { score: number }>> {
    const chunks = await queryChunks(sourceId);

    return chunks
        .map(chunk => ({ ...chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
}
