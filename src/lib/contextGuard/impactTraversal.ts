import { db } from "../db";
import { symbolNodes, symbolEdges, fileNodes } from "../../db/schema";
import { eq, and, inArray } from "drizzle-orm";

export interface ImpactedSymbol {
    id: string;
    name: string;
    fileName: string;
    type: string;
    depth: number;
}

/**
 * Impact Traversal Engine
 * Walks the symbol graph to find all upstream dependencies.
 */
export class ImpactTraversal {

    /**
     * Finds all symbols that call or depend on the starting symbols.
     */
    async getImpactedSymbols(startingSymbolNames: string[], fileId: string, maxDepth: number = 3): Promise<ImpactedSymbol[]> {
        // 1. Resolve starting symbol IDs
        const roots = await db.select({
            id: symbolNodes.id,
            name: symbolNodes.name,
        })
            .from(symbolNodes)
            .where(and(
                eq(symbolNodes.fileId, fileId),
                inArray(symbolNodes.name, startingSymbolNames)
            ));

        if (roots.length === 0) return [];

        const impacted = new Map<string, ImpactedSymbol>();
        let currentTier = roots.map((r: { id: string; name: string }) => r.id);

        // 2. BFS Reverse Traversal
        for (let depth = 1; depth <= maxDepth; depth++) {
            if (currentTier.length === 0) break;

            const callers = await db.select({
                callerId: symbolEdges.sourceSymbolId,
                callerName: symbolNodes.name,
                fileName: fileNodes.path,
                callerType: symbolNodes.type
            })
                .from(symbolEdges)
                .innerJoin(symbolNodes, eq(symbolEdges.sourceSymbolId, symbolNodes.id))
                .innerJoin(fileNodes, eq(symbolNodes.fileId, fileNodes.id))
                .where(inArray(symbolEdges.targetSymbolId, currentTier));

            const nextTier: string[] = [];
            callers.forEach(c => {
                if (!impacted.has(c.callerId)) {
                    impacted.set(c.callerId, {
                        id: c.callerId,
                        name: c.callerName,
                        fileName: c.fileName,
                        type: c.callerType || "unknown",
                        depth
                    });
                    nextTier.push(c.callerId);
                }
            });

            currentTier = nextTier;
        }

        return Array.from(impacted.values());
    }
}
