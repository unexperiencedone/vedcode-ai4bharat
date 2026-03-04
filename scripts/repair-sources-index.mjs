/**
 * repair-sources-index.mjs
 * Backfills SOURCES_INDEX entries for all existing SOURCE_META items.
 * Run: node scripts/repair-sources-index.mjs
 */

import { readFileSync } from 'fs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

// ── Load .env.local manually ────────────────────────────────────────────────
try {
    const envFile = readFileSync('.env', 'utf-8');
    for (const line of envFile.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx === -1) continue;
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
    }
    console.log('Loaded .env.local');
} catch { console.log('No .env.local found — using existing environment variables'); }

const TABLE  = process.env.DYNAMODB_TABLE_NAME || 'VedcodeTable';
const REGION = process.env.AWS_REGION           || 'us-east-1';

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('\n❌ AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY not set.\n');
    process.exit(1);
}

const client = new DynamoDBClient({
    region: REGION,
    credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const docClient = DynamoDBDocumentClient.from(client);

async function run() {
    console.log(`\nTable: ${TABLE}  Region: ${REGION}\n`);

    // Paginated scan for all SOURCE_META items
    let items = [];
    let lastKey;
    do {
        const res = await docClient.send(new ScanCommand({
            TableName: TABLE,
            FilterExpression: '#t = :t',
            ExpressionAttributeNames: { '#t': 'type' },
            ExpressionAttributeValues: { ':t': 'SOURCE_META' },
            ...(lastKey && { ExclusiveStartKey: lastKey }),
        }));
        items.push(...(res.Items || []));
        lastKey = res.LastEvaluatedKey;
    } while (lastKey);

    if (items.length === 0) {
        console.log('No SOURCE_META items found. Are credentials correct?');
        return;
    }

    console.log(`Found ${items.length} source(s):\n`);

    for (const item of items) {
        const { sourceId, name, url, ingestedAt } = item;
        console.log(`  → ${sourceId}  "${name || '(no label)'}"`);

        await docClient.send(new PutCommand({
            TableName: TABLE,
            Item: {
                pk: 'SOURCES_INDEX',
                sk: `SOURCE#${sourceId}`,
                type: 'SOURCE_INDEX',
                sourceId,
                name:       name       || sourceId,
                url:        url        || '',
                ingestedAt: ingestedAt || new Date().toISOString(),
            },
        }));
    }

    console.log(`\n✅ Done — SOURCES_INDEX backfilled for ${items.length} source(s).`);
    console.log('   Refresh Encyclopedia Reader / Galaxy Map to see them.\n');
}

run().catch(err => {
    console.error('\n❌', err.message || err);
    process.exit(1);
});
