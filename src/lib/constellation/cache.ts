/**
 * Shared in-memory constellation cache.
 * Keyed by constellation-session cookie value.
 */

export interface ConstellationStats {
    fileCount: number;
    edgeCount: number;
    solarSystems: string[];
    mostComplex: string;
    repo: string;
    branch: string;
}

export interface ConstellationCache {
    nodes: object[];
    edges: object[];
    stats: ConstellationStats;
}

/** Constellation graph cache: sessionId → { nodes, edges, stats } */
export const constellationCache = new Map<string, ConstellationCache>();

/**
 * Raw file content cache: sessionId → Map<filePath, fileContent>
 * Stored separately so it doesn't bloat serialisation of graph data.
 */
export const fileContentCache = new Map<string, Map<string, string>>();
