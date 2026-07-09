import type { GraphData } from "../../api/types.ts";

export function findMatchedNodeIds(data: GraphData, query: string): Set<string> {
  if (query === "") return new Set();
  const q = query.toLowerCase();
  return new Set(
    data.nodes
      .filter((n) => n.id.toLowerCase().includes(q) || n.title.toLowerCase().includes(q))
      .map((n) => n.id),
  );
}

export function filterGraphByStatus(data: GraphData, selectedStatuses: Set<string>): GraphData {
  if (selectedStatuses.size === 0) return data;

  const visibleNodes = data.nodes.filter((n) => selectedStatuses.has(n.status));
  const visibleIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = data.edges.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to));
  const visibleRelated = (data.relatedEdges ?? []).filter(
    (e) => visibleIds.has(e.a) && visibleIds.has(e.b),
  );
  const visibleSpawnedBy = (data.spawnedByEdges ?? []).filter(
    (e) => visibleIds.has(e.child) && visibleIds.has(e.source),
  );

  return {
    nodes: visibleNodes,
    edges: visibleEdges,
    relatedEdges: visibleRelated,
    spawnedByEdges: visibleSpawnedBy,
    cycles: data.cycles,
  };
}
