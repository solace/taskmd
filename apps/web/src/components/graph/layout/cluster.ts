import type { GraphData, GraphNode } from "../../../api/types.ts";

export interface NodeClassification {
  scopeGroups: Map<string, string[]>;  // scope → isolated task IDs (grouped by first touches)
  topLevel: string[];                   // has deps, is a child, or has no scope/phase
}

export function classifyNodes(data: GraphData, candidates: GraphNode[]): NodeClassification {
  const nodeIds = new Set(data.nodes.map((n) => n.id));

  const nodesWithDeps = new Set<string>();
  for (const edge of data.edges) {
    if (nodeIds.has(edge.from) && nodeIds.has(edge.to)) {
      nodesWithDeps.add(edge.from);
      nodesWithDeps.add(edge.to);
    }
  }

  const childNodes = new Set(
    data.nodes.filter((n) => n.parent && nodeIds.has(n.parent)).map((n) => n.id),
  );

  const scopeGroups = new Map<string, string[]>();
  const topLevel: string[] = [];

  for (const node of candidates) {
    const isolated = !nodesWithDeps.has(node.id) && !childNodes.has(node.id);
    if (isolated && node.touches && node.touches.length > 0) {
      const scope = node.touches[0];
      const members = scopeGroups.get(scope) ?? [];
      members.push(node.id);
      scopeGroups.set(scope, members);
    } else {
      topLevel.push(node.id);
    }
  }

  return { scopeGroups, topLevel };
}
