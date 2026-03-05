import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock';
import { buildConstellationGraph } from '@/lib/constellation/layout';
import type { ConstellationNodeData } from '@/lib/constellation/astParser';

export const maxDuration = 60;

const bedrock = createAmazonBedrock({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const MODEL = process.env.BEDROCK_NOVA_PRO_ID || 'amazon.nova-pro-v1:0';

// Schema for structured topic map data, tailored for a graph representation
const GraphSchema = z.object({
    nodes: z.array(z.object({
        id: z.string().describe('Unique short identifier for the concept (e.g. "auth_flow", "database")'),
        label: z.string().describe('Human readable name for the concept (max 4 words)'),
        explanation: z.string().describe('A crisp 1-2 sentence explanation defining what this concept means in this context'),
        group: z.enum(['previous', 'current', 'future']).describe('The temporal category of this concept'),
        complexity: z.number().min(1).max(10).describe('Estimated complexity/importance 1-10'),
    })).max(15).describe('The core concepts, prerequisites, and future applications found in the document'),
    edges: z.array(z.object({
        from: z.string().describe('The ID of the source node'),
        to: z.string().describe('The ID of the target node'),
    })).max(20).describe('Directed relationships between concepts (e.g., prerequisite -> current -> future)')
});

export async function POST(req: Request) {
    try {
        const { documentContent } = await req.json();

        if (!documentContent) {
            return NextResponse.json({ error: 'Document content is required' }, { status: 400 });
        }

        console.log('[Tab 2] Bedrock Visual Map (Nova Pro) started...');

        const prompt = `Analyze this document and extract a knowledge graph.
You must identify 3 types of concepts (nodes):
1. "previous": Prerequisite knowledge the reader should already know to understand this document.
2. "current": The core concepts actually explained in this document.
3. "future": What this unlocks, or applications they can build next.

You must also identify the logical flow (edges) between these concepts. For example, a previous concept unlocks a current concept, which points to a future concept.

Rules:
1. Use distinct, short IDs for nodes (no spaces).
2. Keep labels under 5 words.
3. Keep the total node count reasonable (max 15).
4. Edges must only reference valid node IDs.

Document:
${documentContent}`;

        const { object } = await generateObject({
            model: bedrock(MODEL),
            schema: GraphSchema,
            prompt,
            temperature: 0.3,
        });

        // Map the AI-generated schema to our Constellation layout format
        const analysisNodes: ConstellationNodeData[] = object.nodes.map(node => {
            // Assign visual properties based on the group
            let nodeType: ConstellationNodeData['nodeType'] = 'other';
            let solarSystem = 'Knowledge Domain';

            if (node.group === 'previous') {
                nodeType = 'lib'; // Colors it green in layout
                solarSystem = 'Prerequisites';
            } else if (node.group === 'current') {
                nodeType = 'component'; // Colors it blue
                solarSystem = 'Core Subjects';
            } else if (node.group === 'future') {
                nodeType = 'schema'; // Colors it violet
                solarSystem = 'Applications';
            }

            // Calculate mock stats that look good visually
            // Inbound/outbound edges determine "gravity" (size)
            const inboundCount = object.edges.filter(e => e.to === node.id).length;
            const outboundCount = object.edges.filter(e => e.from === node.id).length;
            const gravity = inboundCount + outboundCount;

            const imports = object.edges
                .filter(e => e.from === node.id)
                .map(e => e.to);

            return {
                id: node.id,
                label: node.label,
                explanation: node.explanation,
                filePath: node.id, // using ID as the unique path key for the layout engine
                language: 'concept',
                luminosity: node.complexity / 10, // Scales glow radius
                gravity: gravity,
                nodeType: nodeType,
                lineCount: 100, // Dummy
                importCount: inboundCount,
                exportCount: outboundCount,
                complexity: node.complexity,
                solarSystem: solarSystem,
                imports: imports,
                color: '', // Set by layout engine
                size: 0,   // Set by layout engine
                glowRadius: 0 // Set by layout engine
            };
        });

        const edgePairs = object.edges.map(e => ({ from: e.from, to: e.to }));

        // Run it through the exact same layout engine the codebase explorer uses!
        const graphData = buildConstellationGraph(analysisNodes, edgePairs);

        return NextResponse.json({ graphData });

    } catch (error: any) {
        console.error('[Tab 2] Visual Map Error:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to generate diagram' },
            { status: 500 }
        );
    }
}
