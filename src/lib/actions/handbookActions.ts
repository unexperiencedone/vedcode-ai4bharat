"use server";
import { db } from '@/lib/db';
import { conceptCards, technologies } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export interface HandbookSection {
    name: string;
    concepts: {
        name: string;
        slug: string;
        orderIndex?: number | null;
    }[];
}

export async function getHandbookSections(techSlug: string): Promise<HandbookSection[]> {
    const tech = await db.query.technologies.findFirst({
        where: eq(technologies.slug, techSlug)
    });

    if (!tech) return [];

    const cards = await db.query.conceptCards.findMany({
        where: eq(conceptCards.technologyId, tech.id),
        orderBy: [asc(conceptCards.orderIndex)]
    });

    const sectionMap = new Map<string, typeof cards>();
    
    // Group by section
    for (const card of cards) {
        const sectionName = card.section || "Core Concepts";
        if (!sectionMap.has(sectionName)) {
            sectionMap.set(sectionName, []);
        }
        sectionMap.get(sectionName)!.push(card);
    }

    const sections: HandbookSection[] = [];
    sectionMap.forEach((concepts, name) => {
        sections.push({
            name,
            concepts: concepts.map(c => ({
                name: c.name,
                slug: c.slug,
                orderIndex: c.orderIndex
            }))
        });
    });

    return sections;
}

export async function getConceptCardBySlug(slug: string) {
     return await db.query.conceptCards.findFirst({
         where: eq(conceptCards.slug, slug),
         with: {
             examples: true
         }
     });
}
