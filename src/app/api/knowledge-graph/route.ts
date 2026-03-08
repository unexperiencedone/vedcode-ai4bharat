import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conceptCards, conceptRelationships, technologies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const techSlug = searchParams.get('tech');

        let conceptQuery = db.select({
            id: conceptCards.id,
            name: conceptCards.name,
            slug: conceptCards.slug,
            technologyId: conceptCards.technologyId,
            section: conceptCards.section,
            techName: technologies.name,
            techSlug: technologies.slug,
        })
        .from(conceptCards)
        .leftJoin(technologies, eq(conceptCards.technologyId, technologies.id));

        const concepts = await conceptQuery;

        // If techSlug provided, filter the concepts
        let filteredConcepts = concepts;
        if (techSlug) {
            filteredConcepts = filteredConcepts.filter(c => c.techSlug === techSlug);
        }

        const validConceptIds = new Set(filteredConcepts.map(c => c.id));

        const edges = await db.select().from(conceptRelationships);

        // Filter edges to only include those where BOTH source and target are in our node list
        const filteredEdges = edges.filter(e => validConceptIds.has(e.sourceConceptId) && validConceptIds.has(e.targetConceptId));

        // Format for React Flow
        const rfNodes = filteredConcepts.map((c, i) => ({
            id: c.id,
            position: { x: Math.random() * 800, y: Math.random() * 800 }, // Initial random, can be styled or laid out later
            data: {
                label: c.name,
                slug: c.slug,
                techSlug: c.techSlug,
                section: c.section
            },
            type: 'conceptNode' // Custom node type if we want
        }));

        const rfEdges = filteredEdges.map(e => ({
            id: e.id,
            source: e.sourceConceptId,
            target: e.targetConceptId,
            label: e.relationType,
            type: 'smoothstep',
            animated: e.relationType === 'depends_on',
            style: { stroke: e.relationType === 'depends_on' ? '#f59e0b' : '#3b82f6', strokeWidth: 2 }
        }));

        return NextResponse.json({
            nodes: rfNodes,
            edges: rfEdges
        });

    } catch (error: any) {
        console.error("[KNOWLEDGE_GRAPH_API]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
