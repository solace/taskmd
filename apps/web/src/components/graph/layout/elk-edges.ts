import type { Edge } from "@xyflow/react";
import type { GraphData } from "../../../api/types.ts";

export interface LayoutOptions {
  clustering?: boolean;
  showParentEdges?: boolean;
}

export function buildStructuralEdges(data: GraphData, options: LayoutOptions = {}): Edge[] {
  const { showParentEdges = true } = options;
  const nodeIds = new Set(data.nodes.map((n) => n.id));
  const edges: Edge[] = [];

  for (const [i, edge] of data.edges.entries()) {
    edges.push({
      id: `dep-${i}`,
      source: edge.from,
      target: edge.to,
      type: "smoothstep",
      markerEnd: { type: "arrowclosed" as const },
      zIndex: 2,
    });
  }

  if (!showParentEdges) return edges;

  for (const node of data.nodes) {
    if (node.parent && nodeIds.has(node.parent)) {
      edges.push({
        id: `par-${node.id}`,
        source: node.parent,
        target: node.id,
        type: "smoothstep",
        style: { stroke: "#6366f1", strokeWidth: 1.5 },
        markerStart: "url(#rf-diamond-filled)",
        zIndex: 2,
      });
    }
  }

  return edges;
}

export function buildOverlayEdges(
  data: GraphData,
  showRelated: boolean,
  showSpawnedBy: boolean,
): Edge[] {
  const edges: Edge[] = [];

  if (showRelated) {
    for (const [i, rel] of (data.relatedEdges ?? []).entries()) {
      edges.push({
        id: `rel-${i}`,
        source: rel.a,
        target: rel.b,
        type: "straight",
        style: { strokeDasharray: "5 4", stroke: "#a855f7", strokeWidth: 1.5, opacity: 0.65 },
        zIndex: 1,
      });
    }
  }

  if (showSpawnedBy) {
    for (const [i, sp] of (data.spawnedByEdges ?? []).entries()) {
      edges.push({
        id: `spawn-${i}`,
        source: sp.child,
        target: sp.source,
        type: "smoothstep",
        style: { strokeDasharray: "2 3", stroke: "#8b5cf6", strokeWidth: 1.5, opacity: 0.65 },
        markerEnd: { type: "arrow" as const },
        zIndex: 1,
      });
    }
  }

  return edges;
}
