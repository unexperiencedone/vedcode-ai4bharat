/**
 * VedaCode Encyclopedia Processor
 * Pre-digests ingested pages into:
 *   - PAGE#<n>#EXPLAIN  → Nova Pro deep insight + keywords + intuition tip
 *   - BRIDGE#<n>#<n+1>  → Mistral Large transition explanation
 *
 * Runs once during ingest, stored permanently. Always served from store.
 */
import { docClient } from './dynamodb';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { converse } from '@/lib/documentExplainer/bedrock';

const TABLE  = process.env.DYNAMODB_TABLE_NAME || 'VedcodeTable';
const NOVA   = process.env.BEDROCK_NOVA_PRO_ID    || 'amazon.nova-pro-v1:0';
const MISTRAL = process.env.BEDROCK_MISTRAL_LARGE_ID || 'mistral.mistral-large-2407-v1:0';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PageSection {
    pageTitle: string;
    parentHeader: string;
    text: string;
    url: string;
}

export interface PageExplanation {
    sourceId: string;
    pageIndex: number;
    pageTitle: string;
    parentHeader: string;
    url: string;
    summary: string;
    deepInsight: string;
    keywords: Record<string, string>;
    intuitionTip: string;
}

export interface BridgeExplanation {
    sourceId: string;
    fromPage: number;
    toPage: number;
    fromHeader: string;
    toHeader: string;
    bridgeText: string;
}

// ─── JSON Sanitizer ──────────────────────────────────────────────────────────
// Nova Pro sometimes returns literal control characters (real \n, \t, etc.)
// inside JSON string values which breaks JSON.parse. Replace them with their
// escaped equivalents. We only touch bytes < 0x20 so JSON structure is safe.
function sanitizeJson(raw: string): string {
    return raw.replace(/[\x00-\x1F]/g, c => {
        switch (c) {
            case '\n': return '\\n';
            case '\r': return '\\r';
            case '\t': return '\\t';
            case '\b': return '\\b';
            case '\f': return '\\f';
            default:   return '';   // strip other control chars
        }
    });
}


export async function generatePageExplanation(
    sourceId: string,
    pageIndex: number,
    section: PageSection
): Promise<PageExplanation> {
    const prompt = `You are an expert technical educator writing for developers. Analyze this documentation section and generate a learning-optimized explanation.

**Section:** ${section.parentHeader}
**Content:**
${section.text.slice(0, 3000)}

Return a JSON object (no markdown fencing around the JSON) with these exact keys:
{
  "summary": "2-sentence plain English summary of what this section teaches",
  "deepInsight": "3-5 paragraph markdown explanation. CRITICAL RULES: (1) Preserve ALL code examples from the source using fenced code blocks with correct language tags. (2) Explain the WHY behind each concept, not just the what. (3) Use backticks for inline code references. (4) If the section has CLI commands, API calls, or config snippets — include them verbatim. Developers need the code.",
  "keywords": {"term": "one-sentence definition", ...} (6-12 most important technical terms, functions, or concepts),
  "intuitionTip": "One memorable analogy or mental model that makes this concept immediately intuitive for a developer"
}`;

    try {
        const raw = await converse(
            NOVA,
            [{ role: 'user', content: [{ text: prompt }] }],
            'You are a master technical educator who turns dense documentation into intuitive insights. Always return valid JSON.',
            0.4
        );

        // Extract JSON — sanitize control chars Nova Pro embeds in multi-line strings
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON in response');
        const parsed = JSON.parse(sanitizeJson(jsonMatch[0]));

        return {
            sourceId,
            pageIndex,
            pageTitle: section.pageTitle,
            parentHeader: section.parentHeader,
            url: section.url,
            summary: parsed.summary || '',
            deepInsight: parsed.deepInsight || section.text.slice(0, 500),
            keywords: parsed.keywords || {},
            intuitionTip: parsed.intuitionTip || '',
        };
    } catch (err) {
        console.error(`[Encyclopedia] Page ${pageIndex} explanation failed:`, err);
        // Graceful fallback — still useful content
        return {
            sourceId, pageIndex,
            pageTitle: section.pageTitle,
            parentHeader: section.parentHeader,
            url: section.url,
            summary: section.text.slice(0, 200),
            deepInsight: section.text,
            keywords: {},
            intuitionTip: '',
        };
    }
}

// ─── Bridge Generator ─────────────────────────────────────────────────────────

export async function generateBridgeExplanation(
    sourceId: string,
    fromPage: PageExplanation,
    toPage: PageExplanation
): Promise<BridgeExplanation> {
    const prompt = `You are explaining a learning journey through technical documentation.

The reader just finished: **"${fromPage.parentHeader}"**
Summary: ${fromPage.summary}

They are about to read: **"${toPage.parentHeader}"**
Summary: ${toPage.summary}

Write a 2-3 sentence "bridge" that:
1. Affirms what they just learned
2. Explains WHY the next section logically follows
3. Creates anticipation/curiosity for the next page

Be conversational, like a great teacher guiding a student. Do NOT use headers or lists — just flowing prose.`;

    try {
        const bridgeText = await converse(
            MISTRAL,
            [{ role: 'user', content: [{ text: prompt }] }],
            'You are a Socratic guide connecting learning moments. Write bridges that feel like a mentor speaking.',
            0.6
        );

        return {
            sourceId,
            fromPage: fromPage.pageIndex,
            toPage: toPage.pageIndex,
            fromHeader: fromPage.parentHeader,
            toHeader: toPage.parentHeader,
            bridgeText: bridgeText.trim(),
        };
    } catch (err) {
        console.error(`[Encyclopedia] Bridge ${fromPage.pageIndex}→${toPage.pageIndex} failed:`, err);
        return {
            sourceId,
            fromPage: fromPage.pageIndex,
            toPage: toPage.pageIndex,
            fromHeader: fromPage.parentHeader,
            toHeader: toPage.parentHeader,
            bridgeText: `Having understood ${fromPage.parentHeader}, you're ready to explore ${toPage.parentHeader}.`,
        };
    }
}

// ─── DynamoDB Writers ──────────────────────────────────────────────────────────

export async function savePageExplanation(page: PageExplanation): Promise<void> {
    await docClient.send(new PutCommand({
        TableName: TABLE,
        Item: {
            pk: `SOURCE#${page.sourceId}`,
            sk: `PAGE#${String(page.pageIndex).padStart(4, '0')}#EXPLAIN`,
            type: 'PAGE_EXPLANATION',
            ...page,
        },
    }));
}

export async function saveBridgeExplanation(bridge: BridgeExplanation): Promise<void> {
    await docClient.send(new PutCommand({
        TableName: TABLE,
        Item: {
            pk: `SOURCE#${bridge.sourceId}`,
            sk: `BRIDGE#${String(bridge.fromPage).padStart(4, '0')}#${String(bridge.toPage).padStart(4, '0')}`,
            type: 'BRIDGE_EXPLANATION',
            ...bridge,
        },
    }));
}

// ─── Reader Query ─────────────────────────────────────────────────────────────

export async function loadDocumentEcosystem(sourceId: string): Promise<{
    pages: PageExplanation[];
    bridges: BridgeExplanation[];
}> {
    // Query all PAGE# and BRIDGE# items for this source
    const result = await docClient.send(new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'pk = :pk AND (begins_with(sk, :page) OR begins_with(sk, :bridge))',
        ExpressionAttributeValues: {
            ':pk': `SOURCE#${sourceId}`,
            ':page': 'PAGE#',
            ':bridge': 'BRIDGE#',
        },
    })).catch(() => ({ Items: [] }));

    // DynamoDB doesn't support OR in begins_with KeyCondition — use two queries
    const [pagesResult, bridgesResult] = await Promise.all([
        docClient.send(new QueryCommand({
            TableName: TABLE,
            KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
            ExpressionAttributeValues: { ':pk': `SOURCE#${sourceId}`, ':prefix': 'PAGE#' },
        })),
        docClient.send(new QueryCommand({
            TableName: TABLE,
            KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
            ExpressionAttributeValues: { ':pk': `SOURCE#${sourceId}`, ':prefix': 'BRIDGE#' },
        })),
    ]);

    const pages = ((pagesResult.Items || []) as PageExplanation[])
        .sort((a, b) => a.pageIndex - b.pageIndex);
    const bridges = ((bridgesResult.Items || []) as BridgeExplanation[])
        .sort((a, b) => a.fromPage - b.fromPage);

    return { pages, bridges };
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

export async function processDocumentEcosystem(
    sourceId: string,
    sections: PageSection[],
    onProgress?: (stage: string, done: number, total: number) => void
): Promise<void> {
    const report = (stage: string, done: number, total: number) => {
        console.log(`[Encyclopedia:${sourceId}] ${stage} ${done}/${total}`);
        onProgress?.(stage, done, total);
    };

    // Limit to first 20 pages to keep ingest time reasonable
    const pages = sections.slice(0, 20);

    // Stage 1: Generate page explanations sequentially (rate-limit friendly)
    const explanations: PageExplanation[] = [];
    for (let i = 0; i < pages.length; i++) {
        report('page-insights', i, pages.length);
        const explanation = await generatePageExplanation(sourceId, i, pages[i]);
        await savePageExplanation(explanation);
        explanations.push(explanation);
        // Small pause to avoid Bedrock throttling
        await new Promise(r => setTimeout(r, 300));
    }

    report('page-insights', pages.length, pages.length);

    // Stage 2: Generate bridges between consecutive pages
    for (let i = 0; i < explanations.length - 1; i++) {
        report('bridges', i, explanations.length - 1);
        const bridge = await generateBridgeExplanation(sourceId, explanations[i], explanations[i + 1]);
        await saveBridgeExplanation(bridge);
        await new Promise(r => setTimeout(r, 200));
    }

    report('bridges', explanations.length - 1, explanations.length - 1);
    console.log(`[Encyclopedia:${sourceId}] Complete — ${explanations.length} pages, ${explanations.length - 1} bridges`);
}
