import { describe, it, expect } from "vitest";
import { computeGraphLayout, NODE_WIDTH, NODE_HEIGHT } from "./useGraphLayout.ts";
import type { GraphData } from "../../api/types.ts";

describe("computeGraphLayout", () => {
  it("returns empty arrays for empty data", () => {
    const data: GraphData = { nodes: [], edges: [] };
    const result = computeGraphLayout(data);
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });

  it("positions a single node", () => {
    const data: GraphData = {
      nodes: [{ id: "1", title: "Task 1", status: "pending" }],
      edges: [],
    };
    const result = computeGraphLayout(data);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].id).toBe("1");
    expect(result.nodes[0].type).toBe("task");
    expect(result.nodes[0].data).toEqual({
      label: "Task 1",
      status: "pending",
      priority: undefined,
      taskId: "1",
    });
    expect(result.nodes[0].position.x).toBeTypeOf("number");
    expect(result.nodes[0].position.y).toBeTypeOf("number");
  });

  it("lays out multiple nodes with edges", () => {
    const data: GraphData = {
      nodes: [
        { id: "1", title: "Parent", status: "completed" },
        { id: "2", title: "Child A", status: "pending" },
        { id: "3", title: "Child B", status: "pending" },
      ],
      edges: [
        { from: "1", to: "2" },
        { from: "1", to: "3" },
      ],
    };

    const result = computeGraphLayout(data);

    expect(result.nodes).toHaveLength(3);
    expect(result.edges).toHaveLength(2);

    // Parent should be above children (smaller y in TB layout)
    const parent = result.nodes.find((n) => n.id === "1")!;
    const childA = result.nodes.find((n) => n.id === "2")!;
    const childB = result.nodes.find((n) => n.id === "3")!;
    expect(parent.position.y).toBeLessThan(childA.position.y);
    expect(parent.position.y).toBeLessThan(childB.position.y);

    // Children should be at the same y level
    expect(childA.position.y).toBe(childB.position.y);
  });

  it("maps edges with correct source/target and type", () => {
    const data: GraphData = {
      nodes: [
        { id: "a", title: "A", status: "pending" },
        { id: "b", title: "B", status: "pending" },
      ],
      edges: [{ from: "a", to: "b" }],
    };

    const result = computeGraphLayout(data);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]).toMatchObject({
      id: "e-0",
      source: "a",
      target: "b",
      type: "smoothstep",
    });
  });

  it("exports NODE_WIDTH and NODE_HEIGHT constants", () => {
    expect(NODE_WIDTH).toBe(200);
    expect(NODE_HEIGHT).toBe(60);
  });
});
