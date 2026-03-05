import { Project } from "ts-morph";
import { ConceptTraceEngine, ConceptMatch } from "./conceptTraceEngine";
import { db } from "../db";
import { conceptCards, conceptChangeLog } from "../../db/schema";
import { eq, inArray } from "drizzle-orm";

export interface FileSnapshot {
    profileId: string;
    commitHash?: string;
    fileId: string;
    beforeCode: string;
    afterCode: string;
}

export class ConceptDiffEngine {
    private traceEngine: ConceptTraceEngine;
    private conceptMap: Map<string, string> = new Map(); // slug -> format id

    constructor() {
        this.traceEngine = new ConceptTraceEngine();
    }

    async initialize() {
        await this.traceEngine.initialize();
        const cards = await db.select({ id: conceptCards.id, slug: conceptCards.slug }).from(conceptCards);
        cards.forEach((card: { id: string; slug: string }) => this.conceptMap.set(card.slug, card.id));
    }

    async processDiff(snapshot: FileSnapshot) {
        const project = new Project({ useInMemoryFileSystem: true });
        
        // 1. Trace Before
        const beforeFile = project.createSourceFile("before.ts", snapshot.beforeCode);
        const beforeConcepts = await this.traceEngine.extractConcepts(beforeFile);

        // 2. Trace After
        const afterFile = project.createSourceFile("after.ts", snapshot.afterCode);
        const afterConcepts = await this.traceEngine.extractConcepts(afterFile);

        // 3. Diff the Concepts
        const beforeMap = new Map(beforeConcepts.map(c => [c.conceptSlug, c]));
        const afterMap = new Map(afterConcepts.map(c => [c.conceptSlug, c]));

        const logsToInsert: any[] = [];

        // Check for 'introduced' or 'modified'
        for (const [slug, afterConcept] of afterMap.entries()) {
            const conceptId = this.conceptMap.get(slug);
            if (!conceptId) continue;

            const beforeConcept = beforeMap.get(slug);

            if (!beforeConcept) {
                // Concept was introduced
                logsToInsert.push({
                    profileId: snapshot.profileId,
                    commitHash: snapshot.commitHash || null,
                    fileId: snapshot.fileId,
                    conceptId: conceptId,
                    changeType: 'introduced',
                    confidence: afterConcept.confidence,
                    beforeContext: null,
                    afterContext: afterConcept.snippet,
                });
            } else if (beforeConcept.snippet !== afterConcept.snippet) {
                // Concept was modified
                logsToInsert.push({
                    profileId: snapshot.profileId,
                    commitHash: snapshot.commitHash || null,
                    fileId: snapshot.fileId,
                    conceptId: conceptId,
                    changeType: 'modified',
                    confidence: afterConcept.confidence,
                    beforeContext: beforeConcept.snippet,
                    afterContext: afterConcept.snippet,
                });
            }
        }

        // Check for 'removed'
        for (const [slug, beforeConcept] of beforeMap.entries()) {
            const conceptId = this.conceptMap.get(slug);
            if (!conceptId) continue;

            if (!afterMap.has(slug)) {
                // Concept was removed
                logsToInsert.push({
                    profileId: snapshot.profileId,
                    commitHash: snapshot.commitHash || null,
                    fileId: snapshot.fileId,
                    conceptId: conceptId,
                    changeType: 'removed',
                    confidence: beforeConcept.confidence,
                    beforeContext: beforeConcept.snippet,
                    afterContext: null,
                });
            }
        }

        // 4. Save to concept_change_log
        if (logsToInsert.length > 0) {
            await db.insert(conceptChangeLog).values(logsToInsert);
        }

        return logsToInsert;
    }
}
