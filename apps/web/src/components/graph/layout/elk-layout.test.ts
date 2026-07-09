import { describe, it, expect } from "vitest";
import { buildElkGraph } from "./elk-layout.ts";
import type { GraphData } from "../../../api/types.ts";

describe("buildElkGraph", () => {
  it("returns empty root for empty data", () => {
    const root = buildElkGraph({ nodes: [], edges: [] });
    expect(root.children).toHaveLength(0);
    expect(root.edges).toHaveLength(0);
  });

  it("places a single task with no phase at the top level", () => {
    const data: GraphData = {
      nodes: [{ id: "1", title: "Task 1", status: "pending" }],
      edges: [],
    };
    const root = buildElkGraph(data);
    expect(root.children).toHaveLength(1);
    expect(root.children![0].id).toBe("1");
  });

  it("puts phase tasks inside __phase compound", () => {
    const data: GraphData = {
      nodes: [
        { id: "a", title: "A", status: "pending", phase: "v1.0" },
        { id: "b", title: "B", status: "pending", phase: "v1.0" },
      ],
      edges: [],
    };
    const root = buildElkGraph(data);
    expect(root.children).toHaveLength(1);
    const phase = root.children![0];
    expect(phase.id).toBe("__phase_v1.0");
    expect(phase.children).toHaveLength(2);
  });

  it("places parent and child as flat task nodes (not compound)", () => {
    const data: GraphData = {
      nodes: [
        { id: "p", title: "Parent", status: "pending" },
        { id: "c", title: "Child", status: "pending", parent: "p" },
      ],
      edges: [],
    };
    const root = buildElkGraph(data);
    // Both are top-level flat nodes — no __parent_ compound
    expect(root.children).toHaveLength(2);
    expect(root.children!.map((n) => n.id)).toEqual(expect.arrayContaining(["p", "c"]));
    expect(root.children!.every((n) => !n.id.startsWith("__parent_"))).toBe(true);
  });

  it("adds parent→child edge to ELK for layout ranking", () => {
    const data: GraphData = {
      nodes: [
        { id: "p", title: "Parent", status: "pending" },
        { id: "c", title: "Child", status: "pending", parent: "p" },
      ],
      edges: [],
    };
    const root = buildElkGraph(data);
    const parentEdge = root.edges!.find((e) => e.sources[0] === "p" && e.targets[0] === "c");
    expect(parentEdge).toBeDefined();
  });

  it("puts isolated tasks with touches into __scope compound", () => {
    const data: GraphData = {
      nodes: [
        { id: "a", title: "A", status: "pending", touches: ["api"] },
        { id: "b", title: "B", status: "pending", touches: ["api"] },
      ],
      edges: [],
    };
    const root = buildElkGraph(data);
    expect(root.children).toHaveLength(1);
    const scope = root.children![0];
    expect(scope.id).toBe("__scope_api");
    expect(scope.children).toHaveLength(2);
  });

  it("leaves isolated task with no touches at top level", () => {
    const data: GraphData = {
      nodes: [{ id: "a", title: "A", status: "pending" }],
      edges: [],
    };
    const root = buildElkGraph(data);
    expect(root.children![0].id).toBe("a");
  });

  it("only includes valid dependency edges in elk graph", () => {
    const data: GraphData = {
      nodes: [
        { id: "a", title: "A", status: "pending" },
        { id: "b", title: "B", status: "pending" },
      ],
      edges: [
        { from: "a", to: "b" },
        { from: "a", to: "missing" },
      ],
    };
    const root = buildElkGraph(data);
    const depEdges = root.edges!.filter((e) => e.id.startsWith("elk-dep-"));
    expect(depEdges).toHaveLength(1);
    expect(depEdges[0]).toMatchObject({ sources: ["a"], targets: ["b"] });
  });
});

