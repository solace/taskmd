import { describe, it, expect } from "vitest";
import { bfsSubgraph } from "./focus.ts";
import type { GraphData } from "../../../api/types.ts";

const baseData: GraphData = {
  nodes: [
    { id: "a", title: "A", status: "pending" },
    { id: "b", title: "B", status: "pending" },
    { id: "c", title: "C", status: "pending" },
    { id: "d", title: "D", status: "pending" },
  ],
  edges: [
    { from: "a", to: "b" },
    { from: "b", to: "c" },
  ],
};

describe("bfsSubgraph", () => {
  it("returns the full graph when startId is not in the graph", () => {
    const result = bfsSubgraph(baseData, "missing", 2);
    expect(result.nodes).toHaveLength(4);
  });

  it("depth 0 returns only the start node", () => {
    const result = bfsSubgraph(baseData, "a", 0);
    expect(result.nodes.map((n) => n.id)).toEqual(["a"]);
    expect(result.edges).toHaveLength(0);
  });

  it("depth 1 returns start + direct neighbours", () => {
    const result = bfsSubgraph(baseData, "b", 1);
    const ids = result.nodes.map((n) => n.id).sort();
    expect(ids).toEqual(["a", "b", "c"]);
  });

  it("traverses dep edges bidirectionally", () => {
    // b has upstream a and downstream c — both reachable at depth 1
    const result = bfsSubgraph(baseData, "b", 1);
    expect(result.nodes.map((n) => n.id)).toContain("a");
    expect(result.nodes.map((n) => n.id)).toContain("c");
  });

  it("depth 2 chains transitively", () => {
    const result = bfsSubgraph(baseData, "a", 2);
    const ids = result.nodes.map((n) => n.id).sort();
    expect(ids).toEqual(["a", "b", "c"]);
  });

  it("excludes unreachable nodes at given depth", () => {
    // d has no edges — not reachable from a
    const result = bfsSubgraph(baseData, "a", 3);
    expect(result.nodes.map((n) => n.id)).not.toContain("d");
  });

  it("traverses parent edges", () => {
    const data: GraphData = {
      nodes: [
        { id: "p", title: "Parent", status: "pending" },
        { id: "c", title: "Child", status: "pending", parent: "p" },
        { id: "x", title: "Other", status: "pending" },
      ],
      edges: [],
    };
    const result = bfsSubgraph(data, "c", 1);
    const ids = result.nodes.map((n) => n.id);
    expect(ids).toContain("p");
    expect(ids).not.toContain("x");
  });

  it("traverses see_also edges in the declared direction only", () => {
    const data: GraphData = {
      nodes: [
        { id: "a", title: "A", status: "pending" },
        { id: "b", title: "B", status: "pending" },
      ],
      edges: [],
      seeAlsoEdges: [{ from: "a", to: "b" }],
    };
    // a declares b as see_also — b is reachable from a
    expect(bfsSubgraph(data, "a", 1).nodes.map((n) => n.id)).toContain("b");
    // b does not declare a — a is not reachable from b via see_also
    expect(bfsSubgraph(data, "b", 1).nodes.map((n) => n.id)).not.toContain("a");
  });

  it("traverses spawned-by edges bidirectionally", () => {
    const data: GraphData = {
      nodes: [
        { id: "child", title: "Child", status: "pending" },
        { id: "src", title: "Source", status: "pending" },
      ],
      edges: [],
      spawnedByEdges: [{ child: "child", source: "src" }],
    };
    expect(bfsSubgraph(data, "child", 1).nodes.map((n) => n.id)).toContain("src");
    expect(bfsSubgraph(data, "src", 1).nodes.map((n) => n.id)).toContain("child");
  });

  it("filters edges to only those between visited nodes", () => {
    const result = bfsSubgraph(baseData, "b", 1);
    for (const edge of result.edges) {
      const ids = result.nodes.map((n) => n.id);
      expect(ids).toContain(edge.from);
      expect(ids).toContain(edge.to);
    }
  });

  it("stops early if frontier empties before depth is reached", () => {
    // Graph with a single node — BFS frontier empties immediately
    const data: GraphData = { nodes: [{ id: "solo", title: "Solo", status: "pending" }], edges: [] };
    const result = bfsSubgraph(data, "solo", 5);
    expect(result.nodes).toHaveLength(1);
  });
});
