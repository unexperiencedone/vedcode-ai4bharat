/**
 * Shared in-memory constellation cache.
 * Keyed by constellation-session cookie value.
 *
 * Stored on `globalThis` rather than as a plain module-level `const`: Next.js dev-mode
 * Fast Refresh re-evaluates a module — and everything that (transitively) imports it —
 * whenever a file in its dependency graph changes. A plain module-level Map gets silently
 * recreated empty on that re-evaluation, orphaning every session cached so far: the upload
 * that populated it genuinely succeeded, but the next read 404s with "No project loaded"
 * because it's talking to a brand-new, empty Map. `globalThis` persists across module
 * re-evaluation within the same Node process, so this cache now only resets on an actual
 * server restart — which is the behavior the rest of this feature already assumes.
 */

export interface ConstellationStats {
    fileCount: number;
    edgeCount: number;
    solarSystems: string[];
    mostComplex: string;
    repo: string;
    branch: string;
    /** True when the repo had more eligible code files than the analysis cap allows. */
    truncated: boolean;
    /** Count of eligible code files before the cap was applied. */
    eligibleCount: number;
}

export interface ConstellationCache {
    nodes: object[];
    edges: object[];
    stats: ConstellationStats;
}

declare global {
    var __vedcodeConstellationCache: Map<string, ConstellationCache> | undefined;
    var __vedcodeFileContentCache: Map<string, Map<string, string>> | undefined;
}

/** Constellation graph cache: sessionId → { nodes, edges, stats } */
export const constellationCache =
    globalThis.__vedcodeConstellationCache ??
    (globalThis.__vedcodeConstellationCache = new Map<string, ConstellationCache>());

/**
 * Raw file content cache: sessionId → Map<filePath, fileContent>
 * Stored separately so it doesn't bloat serialisation of graph data.
 */
export const fileContentCache =
    globalThis.__vedcodeFileContentCache ??
    (globalThis.__vedcodeFileContentCache = new Map<string, Map<string, string>>());
