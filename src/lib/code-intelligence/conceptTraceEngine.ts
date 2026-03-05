import { SourceFile, Node, SyntaxKind } from "ts-morph";
import { conceptRules } from "./conceptRules";
import { conceptPatterns } from "./conceptPatterns";
import { db } from "../db";
import { conceptCards, conceptUsage } from "../../db/schema";
import { eq } from "drizzle-orm";

export interface ConceptMatch {
    conceptSlug: string;
    confidence: number;
    lineStart: number;
    lineEnd: number;
    snippet: string;
}

/**
 * Concept Trace Engine
 * Orchestrates the detection of learning concepts within code.
 */
export class ConceptTraceEngine {
    private conceptMap: Map<string, string> = new Map(); // slug -> id

    async initialize() {
        const cards = await db.select({ id: conceptCards.id, slug: conceptCards.slug }).from(conceptCards);
        cards.forEach((card: { id: string; slug: string }) => this.conceptMap.set(card.slug, card.id));
    }

    async extractConcepts(sourceFile: SourceFile): Promise<ConceptMatch[]> {
        const matches: ConceptMatch[] = [];

        // Layer 1: Deterministic Rules (AST Walk)
        sourceFile.forEachDescendant(node => {
            for (const rule of conceptRules) {
                if (node.getKindName() === rule.nodeType && rule.match(node)) {
                    matches.push({
                        conceptSlug: rule.conceptSlug,
                        confidence: rule.confidence,
                        lineStart: node.getStartLineNumber(),
                        lineEnd: node.getEndLineNumber(),
                        snippet: node.getText().slice(0, 500) // Truncate for DB
                    });
                }
            }
        });

        // Layer 2: Pattern Inference
        for (const pattern of conceptPatterns) {
            const patternMatches = pattern.match(sourceFile);
            patternMatches.forEach(pm => {
                matches.push({
                    conceptSlug: pattern.conceptSlug,
                    confidence: pm.confidence,
                    lineStart: pm.node.getStartLineNumber(),
                    lineEnd: pm.node.getEndLineNumber(),
                    snippet: pm.node.getText().slice(0, 500)
                });
            });
        }

        // Deduplicate matches (one concept per line range/symbol)
        const uniqueMatches = this.deduplicate(matches);
        return uniqueMatches;
    }

    async traceFile(sourceFile: SourceFile, fileId: string): Promise<number> {
        const uniqueMatches = await this.extractConcepts(sourceFile);

        // Store in DB
        let count = 0;
        for (const match of uniqueMatches) {
            const conceptId = this.conceptMap.get(match.conceptSlug);
            if (conceptId) {
                await db.insert(conceptUsage).values({
                    fileId,
                    conceptId,
                    confidence: match.confidence,
                    contextSnippet: match.snippet,
                    lineStart: match.lineStart,
                    lineEnd: match.lineEnd,
                }).onConflictDoNothing(); // Prevent duplicates on re-index
                count++;
            }
        }

        return count;
    }

    private deduplicate(matches: ConceptMatch[]): ConceptMatch[] {
        const seen = new Set<string>();
        return matches.filter(m => {
            const key = `${m.conceptSlug}-${m.lineStart}-${m.lineEnd}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
}
