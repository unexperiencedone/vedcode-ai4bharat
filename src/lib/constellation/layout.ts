/**
 * Solar-System radial layout engine for ProjectConstellation.
 *
 * Groups files by their depth-1 folder ("Solar System").
 * Each Solar System clusters around its own center point,
 * and all Solar Systems orbit a shared canvas center.
 */

import type { Node, Edge } from '@xyflow/react';
import type { ConstellationNodeData } from './astParser';

export const NODE_TYPE_COLORS: Record<string, string> = {
    component: '#3b82f6', // blue
    api: '#f59e0b', // amber
    lib: '#10b981', // green
    schema: '#8b5cf6', // violet
    other: '#6b7280', // slate
};

export function buildConstellationGraph(
    analysisNodes: ConstellationNodeData[],
    edgePairs: { from: string; to: string }[]
): { nodes: Node[]; edges: Edge[] } {
    if (analysisNodes.length === 0) return { nodes: [], edges: [] };

    // ── Group into Solar Systems ──────────────────────────────────────────────
    const solarSystems = new Map<string, ConstellationNodeData[]>();
    for (const node of analysisNodes) {
        const sys = node.solarSystem;
        if (!solarSystems.has(sys)) solarSystems.set(sys, []);
        solarSystems.get(sys)!.push(node);
    }

    const systemList = [...solarSystems.keys()];
    const numSystems = systemList.length;

    // Distance between solar system centers
    const OUTER_RADIUS = Math.max(500, numSystems * 180);
    // Orbit radius of files within a solar system
    const BASE_INNER_RADIUS = 130;

    const posMap = new Map<string, { x: number; y: number }>();

    systemList.forEach((system, sysIdx) => {
        const sysAngle = (sysIdx / numSystems) * 2 * Math.PI - Math.PI / 2;
        const sysCX = Math.cos(sysAngle) * OUTER_RADIUS;
        const sysCY = Math.sin(sysAngle) * OUTER_RADIUS;

        const systemNodes = solarSystems.get(system)!;
        const innerRadius = BASE_INNER_RADIUS + systemNodes.length * 8;

        systemNodes.forEach((node, nodeIdx) => {
            const nodeAngle = (nodeIdx / Math.max(systemNodes.length, 1)) * 2 * Math.PI;
            // Hub files (high gravity) push out to wider orbit
            const r = innerRadius + node.gravity * 15;
            posMap.set(node.filePath, {
                x: sysCX + Math.cos(nodeAngle) * r,
                y: sysCY + Math.sin(nodeAngle) * r,
            });
        });
    });

    // ── Build React Flow nodes ────────────────────────────────────────────────
    const rfNodes: Node[] = analysisNodes.map((n) => {
        const pos = posMap.get(n.filePath) ?? { x: 0, y: 0 };
        const color = NODE_TYPE_COLORS[n.nodeType];
        // Node size: base + gravity bonus + complexity bonus
        const size = Math.min(10 + n.gravity * 5 + Math.floor(n.complexity * 0.5), 40);
        const glowRadius = 4 + Math.round(n.luminosity * 16); // 4-20px
        const label = n.filePath.split('/').pop() ?? n.filePath;

        return {
            id: n.filePath,
            type: 'constellation',
            position: pos,
            data: {
                label,
                filePath: n.filePath,
                luminosity: n.luminosity,
                gravity: n.gravity,
                nodeType: n.nodeType,
                lineCount: n.lineCount,
                importCount: n.importCount,
                exportCount: n.exportCount,
                complexity: n.complexity,
                solarSystem: n.solarSystem,
                color,
                size,
                glowRadius,
                explanation: n.explanation,
            },
        };
    });

    // ── Build React Flow edges (deduplicated) ─────────────────────────────────
    const edgeSet = new Set<string>();
    const rfEdges: Edge[] = [];

    for (const { from, to } of edgePairs) {
        const key = `${from}→${to}`;
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);

        const sourceNode = analysisNodes.find((n) => n.filePath === from);
        const color = sourceNode ? NODE_TYPE_COLORS[sourceNode.nodeType] : '#6b7280';

        rfEdges.push({
            id: key,
            source: from,
            target: to,
            animated: false,
            style: { stroke: color, strokeWidth: 1, opacity: 0.4 },
        });
    }

    return { nodes: rfNodes, edges: rfEdges };
}
