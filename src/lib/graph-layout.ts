/**
 * Deterministic DAG layering engine for Project Constellation.
 *
 * - Layer 0: files with no local dependencies (schemas, leaf utilities)
 * - Layer N: files whose deepest dependency sits at layer N-1
 *
 * Columns are inverted so "source → consumer" reads left → right.
 * Large layers wrap into sub-columns so no column is a mile-long strip.
 * maxPerCol is adaptive: computed from the actual viewport height so
 * fitToView always has a sensible aspect ratio to compress into.
 */

export type FileNodeType =
  | "data"
  | "lib"
  | "action"
  | "component"
  | "page"
  | "api"
  | "schema"
  | "hook"
  | "config"
  | "other";

export interface FileNode {
  id: string;
  name: string;
  path: string;
  complexity: number;
  type: FileNodeType;
}

export interface GraphEdge {
  from: string; // this file imports…
  to: string;   // …this file
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COL_WIDTH     = 220; // gap between DAG layers
const SUB_COL_WIDTH = 170; // gap between sub-columns within the same layer
const ROW_HEIGHT    = 84;  // vertical step between nodes
const TOP_PAD       = 40;
const LEFT_PAD      = 40;
const NODE_WIDTH    = 160; // card width (used for graphWidth calc)

// ── Main export ───────────────────────────────────────────────────────────────

export function computeLayers(
  nodes: FileNode[],
  edges: GraphEdge[],
  /** Actual container height in px — used to derive adaptive maxPerCol. */
  viewportHeight = 600
) {
  if (nodes.length === 0) {
    return { positions: new Map<string, { x: number; y: number }>(), layer: new Map<string, number>(), graphWidth: 0, graphHeight: 0 };
  }

  // ── 1. Build import adjacency ──────────────────────────────────────────────
  const layer = new Map<string, number>();
  const importsOf = new Map<string, string[]>();
  nodes.forEach((n) => importsOf.set(n.id, []));
  edges.forEach((e) => {
    const list = importsOf.get(e.from);
    if (list) list.push(e.to);
  });

  // ── 2. Longest-path layering (cycle-safe) ─────────────────────────────────
  function resolve(id: string, seen = new Set<string>()): number {
    if (layer.has(id)) return layer.get(id)!;
    if (seen.has(id)) return 0; // cycle → treat as leaf
    seen.add(id);
    const deps = importsOf.get(id) ?? [];
    const l =
      deps.length === 0
        ? 0
        : 1 + Math.max(...deps.map((d) => resolve(d, new Set(seen))));
    layer.set(id, l);
    return l;
  }
  nodes.forEach((n) => resolve(n.id));

  // ── 3. Group by layer ─────────────────────────────────────────────────────
  const byLayer = new Map<number, FileNode[]>();
  nodes.forEach((n) => {
    const l = layer.get(n.id) ?? 0;
    if (!byLayer.has(l)) byLayer.set(l, []);
    byLayer.get(l)!.push(n);
  });

  const maxLayer = Math.max(...layer.values(), 0);

  // ── 4. Adaptive rows-per-column ───────────────────────────────────────────
  // Clamped 3–10: never so cramped it's unreadable, never so tall Fit can't help.
  const maxPerCol = Math.min(10, Math.max(3, Math.floor((viewportHeight - TOP_PAD) / ROW_HEIGHT)));

  // ── 5. Assign positions ───────────────────────────────────────────────────
  const positions = new Map<string, { x: number; y: number }>();

  // Track the right-edge of each (layer, subCol) group so columns don't collide
  const layerColStart = new Map<number, number>(); // layer → x-start of its first sub-column

  // First pass: compute x-start per layer using a running cursor
  let cursor = LEFT_PAD;
  [...Array(maxLayer + 1).keys()].reverse().forEach((l) => {
    // inverted: layer 0 (leaves) → rightmost
    const col = maxLayer - l;
    layerColStart.set(col, cursor);
    const group = byLayer.get(l) ?? [];
    const subCols = Math.ceil(group.length / maxPerCol);
    cursor += subCols * SUB_COL_WIDTH + (COL_WIDTH - SUB_COL_WIDTH);
  });

  [...byLayer.entries()].forEach(([l, group]) => {
    const col = maxLayer - l;
    const xStart = layerColStart.get(col) ?? LEFT_PAD;
    group.forEach((n, i) => {
      const subCol = Math.floor(i / maxPerCol);
      const row = i % maxPerCol;
      positions.set(n.id, {
        x: xStart + subCol * SUB_COL_WIDTH,
        y: row * ROW_HEIGHT + TOP_PAD,
      });
    });
  });

  // ── 6. Canvas bounds ──────────────────────────────────────────────────────
  const allX = [...positions.values()].map((p) => p.x);
  const allY = [...positions.values()].map((p) => p.y);
  const graphWidth  = Math.max(...allX) + NODE_WIDTH + 60;
  const graphHeight = Math.max(...allY) + ROW_HEIGHT + 40;

  return { positions, layer, graphWidth, graphHeight };
}
