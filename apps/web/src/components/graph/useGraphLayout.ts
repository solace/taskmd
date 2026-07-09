import { useMemo } from "react";
import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";
import type { GraphData } from "../../api/types.ts";

export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 60;

/** @deprecated Use useElkLayout from hooks/useElkLayout.ts instead */
export function computeGraphLayout(data: GraphData): { nodes: Node[]; edges: Edge[] } {
  if (data.nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", ranksep: 80, nodesep: 40 });

  const nodeIds = new Set(data.nodes.map((n) => n.id));

  for (const node of data.nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  // Dependency edges: primary ranking signal
  for (const edge of data.edges) {
    g.setEdge(edge.from, edge.to);
  }

  // Parent→child: children rank below their parent
  for (const node of data.nodes) {
    if (node.parent && nodeIds.has(node.parent)) {
      g.setEdge(node.parent, node.id);
    }
  }

  // Spawned-by: source ranks above the task it spawned
  for (const sp of (data.spawnedByEdges ?? [])) {
    if (nodeIds.has(sp.source) && nodeIds.has(sp.child)) {
      g.setEdge(sp.source, sp.child);
    }
  }

  dagre.layout(g);

  const nodes: Node[] = data.nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      id: node.id,
      type: "task",
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      data: { label: node.title, status: node.status, priority: node.priority, taskId: node.id },
    };
  });

  // UML dependency arrows (blocking): solid line, filled arrowhead
  const edges: Edge[] = data.edges.map((edge, i) => ({
    id: `dep-${i}`,
    source: edge.from,
    target: edge.to,
    type: "smoothstep",
    markerEnd: { type: "arrowclosed" as const },
  }));

  // UML composition (parent→child): solid indigo line, filled diamond at parent end.
  // markerStart is at the source (parent); orient="auto-start-reverse" makes it face the node.
  for (const node of data.nodes) {
    if (node.parent && nodeIds.has(node.parent)) {
      edges.push({
        id: `par-${node.id}`,
        source: node.parent,
        target: node.id,
        type: "smoothstep",
        style: { stroke: "#6366f1", strokeWidth: 1.5 },
        markerStart: "url(#rf-diamond-filled)",
        markerEnd: undefined,
      });
    }
  }

  // UML association (related, undirected): dashed purple line, no arrowheads
  for (const [i, rel] of (data.relatedEdges ?? []).entries()) {
    edges.push({
      id: `rel-${i}`,
      source: rel.a,
      target: rel.b,
      type: "straight",
      style: { strokeDasharray: "5 4", stroke: "#a855f7", strokeWidth: 1.5 },
      markerEnd: undefined,
      markerStart: undefined,
    });
  }

  // UML dependency (spawned-by, directed): dotted purple line, open arrowhead
  for (const [i, sp] of (data.spawnedByEdges ?? []).entries()) {
    edges.push({
      id: `spawn-${i}`,
      source: sp.child,
      target: sp.source,
      type: "smoothstep",
      style: { strokeDasharray: "2 3", stroke: "#8b5cf6", strokeWidth: 1.5 },
      markerEnd: { type: "arrow" as const },
    });
  }

  return { nodes, edges };
}

/** @deprecated Use useElkLayout from hooks/useElkLayout.ts instead */
export function useGraphLayout(data: GraphData | undefined) {
  return useMemo(() => {
    if (!data) {
      return { nodes: [] as Node[], edges: [] as Edge[] };
    }
    return computeGraphLayout(data);
  }, [data]);
}
