/**
 * VedCode Ingestion Pipeline
 * Crawl → Semantic Chunk → Embed → Store in DynamoDB → Extract Concept Graph
 */
import { putChunk, putSourceMeta, updateSourceStatus, DocChunk, ConceptNode } from './dynamodb';
import { embedBatch } from './embeddings';
import { converse } from '@/lib/documentExplainer/bedrock';
import { processDocumentEcosystem } from './encyclopediaProcessor';

const NOVA_PRO = process.env.BEDROCK_NOVA_PRO_ID || 'amazon.nova-pro-v1:0';

// ─── Section type after crawling ──────────────────────────────────────────────

interface PageSection {
    pageTitle: string;
    parentHeader: string; // "H2 > H3" breadcrumb
    text: string;
    url: string;
}

// ─── 1. Crawler ───────────────────────────────────────────────────────────────

/**
 * Fetch a URL and extract structured sections based on heading boundaries.
 * Returns one entry per heading section—this is our semantic chunking unit.
 */
export async function crawlUrl(url: string): Promise<PageSection[]> {
    const res = await fetch(url, {
        headers: { 'User-Agent': 'VedCode-Bot/1.0 (documentation indexer)' },
    });

    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);

    const html = await res.text();
    return parseHtmlToSections(html, url);
}

function parseHtmlToSections(html: string, url: string): PageSection[] {
    // Extract page title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? decodeHtml(titleMatch[1]) : new URL(url).pathname;

    // Strip scripts, styles, nav, footer, header, aside
    let body = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<aside[\s\S]*?<\/aside>/gi, '');

    // Extract main content if available
    const mainMatch = body.match(/<main[\s\S]*?<\/main>/i) ||
        body.match(/<article[\s\S]*?<\/article>/i) ||
        body.match(/<div[^>]*class="[^"]*(?:content|main|docs)[^"]*"[\s\S]*?<\/div>/i);
    if (mainMatch) body = mainMatch[0];

    // Now split by headings h1/h2/h3
    // We'll build sections by tracking current heading and accumulating text
    const sections: PageSection[] = [];
    const headingRe = /<(h[123])[^>]*>([\s\S]*?)<\/h[123]>/gi;
    const tagRe = /<[^>]+>/g;

    let lastIndex = 0;
    let currentHeader = pageTitle;
    let headerStack: string[] = [];
    let match: RegExpExecArray | null;

    // Collect all heading positions
    const headings: { index: number; level: number; text: string }[] = [];
    let hm: RegExpExecArray | null;
    const hRe = /<(h[123])[^>]*>([\s\S]*?)<\/h[123]>/gi;
    while ((hm = hRe.exec(body)) !== null) {
        const level = parseInt(hm[1][1]);
        const text = decodeHtml(hm[2].replace(tagRe, '').trim());
        if (text) headings.push({ index: hm.index, level, text });
    }

    for (let i = 0; i < headings.length; i++) {
        const h = headings[i];
        const nextIndex = i + 1 < headings.length ? headings[i + 1].index : body.length;

        // Get raw HTML between this heading and the next
        const rawSlice = body.slice(h.index, nextIndex);
        const text = rawSlice.replace(tagRe, ' ').replace(/\s+/g, ' ').trim();

        if (text.length < 50) continue; // skip near-empty sections

        // Build a breadcrumb header
        if (h.level === 1) headerStack = [h.text];
        else if (h.level === 2) headerStack = [headerStack[0] || pageTitle, h.text];
        else headerStack = [headerStack[0] || pageTitle, headerStack[1] || '', h.text].filter(Boolean);

        const parentHeader = headerStack.join(' > ');

        sections.push({ pageTitle, parentHeader, text, url });
    }

    // If no headings found, return the whole body as one chunk
    if (sections.length === 0) {
        const plainText = body.replace(tagRe, ' ').replace(/\s+/g, ' ').trim();
        if (plainText.length > 100) {
            sections.push({ pageTitle, parentHeader: pageTitle, text: plainText, url });
        }
    }

    return sections;
}

function decodeHtml(str: string): string {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

// ─── 2. Smart Chunker ─────────────────────────────────────────────────────────

/**
 * Split oversized sections into ≤500 token (~2000 char) chunks with 50-token overlap.
 * Each chunk inherits the section's pageTitle and parentHeader.
 */
export function chunkSections(sections: PageSection[]): PageSection[] {
    const MAX_CHARS = 2000;
    const OVERLAP_CHARS = 200;
    const result: PageSection[] = [];

    for (const section of sections) {
        if (section.text.length <= MAX_CHARS) {
            result.push(section);
            continue;
        }

        // Split by sentences (. ! ?) then group greedily
        const sentences = section.text.match(/[^.!?]+[.!?]+\s*/g) || [section.text];
        let current = '';
        let prev = '';

        for (const sentence of sentences) {
            if ((current + sentence).length > MAX_CHARS && current) {
                result.push({ ...section, text: (prev.slice(-OVERLAP_CHARS) + current).trim() });
                prev = current;
                current = sentence;
            } else {
                current += sentence;
            }
        }

        if (current.trim()) {
            result.push({ ...section, text: (prev.slice(-OVERLAP_CHARS) + current).trim() });
        }
    }

    return result;
}

// ─── 3. Concept Graph Extractor ───────────────────────────────────────────────

export async function extractConceptGraph(
    chunks: PageSection[],
    sourceId: string
): Promise<ConceptNode[]> {
    // Summarize first 15 chunks to stay under token limit
    const sample = chunks
        .slice(0, 15)
        .map(c => `[${c.parentHeader}]: ${c.text.slice(0, 300)}`)
        .join('\n\n');

    const prompt = `You are a knowledge graph architect. Given these documentation excerpts, extract 8-15 key concepts and their relationships.

Return ONLY a valid JSON array. No markdown, no explanation.
Format: [{"concept":"X","prerequisite":"Y","unlocks":["Z"],"related":["A","B"]}]

Documentation:
${sample}`;

    try {
        const response = await converse(
            NOVA_PRO,
            [{ role: 'user', content: [{ text: prompt }] }],
            'Extract a concept relationship graph from the documentation.',
            0.1
        );

        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) return [];
        return JSON.parse(jsonMatch[0]) as ConceptNode[];
    } catch (err) {
        console.error('[ConceptGraph] Extraction failed:', err);
        return [];
    }
}

// ─── 4. Orchestrator ──────────────────────────────────────────────────────────

export interface IngestProgress {
    stage: 'crawling' | 'chunking' | 'embedding' | 'storing' | 'graphing' | 'page-insights' | 'bridges' | 'done' | 'error';
    chunksTotal: number;
    chunksEmbedded: number;
    error?: string;
}

export async function ingestSource(
    sourceId: string,
    url: string,
    name: string,
    onProgress?: (p: IngestProgress) => void
): Promise<void> {
    const report = (p: IngestProgress) => {
        console.log(`[Ingest:${sourceId}] ${p.stage} ${p.chunksEmbedded}/${p.chunksTotal}`);
        onProgress?.(p);
    };

    try {
        // Write initial meta
        await putSourceMeta({
            sourceId, name, url,
            status: 'ingesting',
            chunkCount: 0,
            ingestedAt: new Date().toISOString(),
        });

        // Stage 1: Crawl
        report({ stage: 'crawling', chunksTotal: 0, chunksEmbedded: 0 });
        const sections = await crawlUrl(url);

        // Stage 2: Chunk
        report({ stage: 'chunking', chunksTotal: sections.length, chunksEmbedded: 0 });
        const chunks = chunkSections(sections);
        await updateSourceStatus(sourceId, 'ingesting', { chunkCount: chunks.length });

        // Stage 3: Embed + Store
        report({ stage: 'embedding', chunksTotal: chunks.length, chunksEmbedded: 0 });
        const BATCH = 5;
        for (let i = 0; i < chunks.length; i += BATCH) {
            const batch = chunks.slice(i, i + BATCH);
            const embeddings = await embedBatch(batch.map(c => c.text));

            for (let j = 0; j < batch.length; j++) {
                const chunk = batch[j];
                const chunkItem: DocChunk = {
                    sourceId,
                    chunkId: String(i + j),
                    pageTitle: chunk.pageTitle,
                    parentHeader: chunk.parentHeader,
                    text: chunk.text,
                    embedding: embeddings[j],
                    url: chunk.url,
                    ingestedAt: new Date().toISOString(),
                };
                await putChunk(chunkItem);
            }

            report({ stage: 'storing', chunksTotal: chunks.length, chunksEmbedded: i + BATCH });
        }

        // Stage 4: Concept Graph
        report({ stage: 'graphing', chunksTotal: chunks.length, chunksEmbedded: chunks.length });
        const conceptGraph = await extractConceptGraph(chunks, sourceId);
        await updateSourceStatus(sourceId, 'done', { chunkCount: chunks.length, conceptGraph });
        report({ stage: 'done', chunksTotal: chunks.length, chunksEmbedded: chunks.length });

        // Stage 5+6: Encyclopedia enrichment — fire in background, don't block.
        // PAGE# and BRIDGE# items are stored asynchronously.
        // The source is already usable for search; reader content appears shortly after.
        processDocumentEcosystem(sourceId, sections).catch(err =>
            console.error(`[Encyclopedia:${sourceId}] Background enrichment failed:`, err)
        );
    } catch (err: any) {
        console.error('[Ingest] Error:', err);
        await updateSourceStatus(sourceId, 'error', { error: err.message });
        report({ stage: 'error', chunksTotal: 0, chunksEmbedded: 0, error: err.message });
        throw err;
    }
}
