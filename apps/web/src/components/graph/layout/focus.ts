import type { GraphData } from "../../../api/types.ts";

function buildAdjacency(data: GraphData): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  const nodeIds = new Set(data.nodes.map((n) => n.id));

  const link = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  };

  for (const edge of data.edges) {
    if (nodeIds.has(edge.from) && nodeIds.has(edge.to)) link(edge.from, edge.to);
  }
  for (const node of data.nodes) {
    if (node.parent && nodeIds.has(node.parent)) link(node.id, node.parent);
  }
  // see_also is directed: only follow from→to (not reverse)
  for (const sa of data.seeAlsoEdges ?? []) {
    if (!adj.has(sa.from)) adj.set(sa.from, new Set());
    adj.get(sa.from)!.add(sa.to);
  }
  for (const sp of data.spawnedByEdges ?? []) {
    link(sp.child, sp.source);
  }

  return adj;
}

/**
 * Returns a subgraph containing only nodes reachable from `startId`
 * within `depth` hops across all edge types (dep, parent, see_also, spawned-by).
 */
export function bfsSubgraph(data: GraphData, startId: string, depth: number): GraphData {
  const nodeIds = new Set(data.nodes.map((n) => n.id));
  if (!nodeIds.has(startId)) return data;

  const adj = buildAdjacency(data);
  const visited = new Set<string>([startId]);
  let frontier = [startId];

  for (let d = 0; d < depth; d++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const neighbor of adj.get(id) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          next.push(neighbor);
        }
      }
    }
    frontier = next;
    if (frontier.length === 0) break;
  }

  return {
    nodes: data.nodes.filter((n) => visited.has(n.id)),
    edges: data.edges.filter((e) => visited.has(e.from) && visited.has(e.to)),
    seeAlsoEdges: (data.seeAlsoEdges ?? []).filter((e) => visited.has(e.from) && visited.has(e.to)),
    spawnedByEdges: (data.spawnedByEdges ?? []).filter((e) => visited.has(e.child) && visited.has(e.source)),
  };
}
