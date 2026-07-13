import { describe, it, expect } from "vitest";
import { runElkLayout } from "./elk-layout.ts";
import type { GraphData } from "../../../api/types.ts";

describe("runElkLayout", () => {
  it("returns empty arrays for empty data", async () => {
    const result = await runElkLayout({ nodes: [], edges: [] });
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });

  it("positions a single task at numeric x/y", async () => {
    const data: GraphData = {
      nodes: [{ id: "1", title: "Task 1", status: "pending" }],
      edges: [],
    };
    const result = await runElkLayout(data);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].id).toBe("1");
    expect(result.nodes[0].position.x).toBeTypeOf("number");
    expect(result.nodes[0].position.y).toBeTypeOf("number");
  });

  it("places A above B when A→B dependency", async () => {
    const data: GraphData = {
      nodes: [
        { id: "A", title: "A", status: "pending" },
        { id: "B", title: "B", status: "pending" },
      ],
      edges: [{ from: "A", to: "B" }],
    };
    const result = await runElkLayout(data);
    const a = result.nodes.find((n) => n.id === "A")!;
    const b = result.nodes.find((n) => n.id === "B")!;
    expect(a.position.y).toBeLessThan(b.position.y);
  });

  it("places parent above child via parent→child ELK edge", async () => {
    const data: GraphData = {
      nodes: [
        { id: "p", title: "Parent", status: "pending" },
        { id: "c", title: "Child", status: "pending", parent: "p" },
      ],
      edges: [],
    };
    const result = await runElkLayout(data);
    const parent = result.nodes.find((n) => n.id === "p")!;
    const child = result.nodes.find((n) => n.id === "c")!;
    expect(parent.position.y).toBeLessThan(child.position.y);
    expect(result.nodes.every((n) => n.type === "task")).toBe(true);
  });

  it("parent composition edge has id par-{childId}", async () => {
    const data: GraphData = {
      nodes: [
        { id: "p", title: "Parent", status: "pending" },
        { id: "c", title: "Child", status: "pending", parent: "p" },
      ],
      edges: [],
    };
    const result = await runElkLayout(data);
    const parEdge = result.edges.find((e) => e.id === "par-c");
    expect(parEdge).toBeDefined();
    expect(parEdge!.source).toBe("p");
    expect(parEdge!.target).toBe("c");
    expect(parEdge!.markerStart).toBe("url(#rf-diamond-filled)");
  });

  it("phase task has parentId set to __phase_X after layout", async () => {
    const data: GraphData = {
      nodes: [{ id: "a", title: "A", status: "pending", phase: "v1.0" }],
      edges: [],
    };
    const result = await runElkLayout(data);
    const phase = result.nodes.find((n) => n.id === "__phase_v1.0");
    expect(phase).toBeDefined();
    expect(phase!.type).toBe("container");
    const task = result.nodes.find((n) => n.id === "a");
    expect(task!.parentId).toBe("__phase_v1.0");
    expect(result.nodes.indexOf(phase!)).toBeLessThan(result.nodes.indexOf(task!));
  });

  it("group cluster renders as container node with variant group", async () => {
    const data: GraphData = {
      nodes: [{ id: "a", title: "A", status: "pending", group: "cli" }],
      edges: [],
    };
    const result = await runElkLayout(data);
    const grp = result.nodes.find((n) => n.id === "__grp_cli");
    expect(grp).toBeDefined();
    expect(grp!.type).toBe("container");
    expect(grp!.data.variant).toBe("group");
    const task = result.nodes.find((n) => n.id === "a");
    expect(task!.parentId).toBe("__grp_cli");
  });

  it("dependency edges appear with id dep-0", async () => {
    const data: GraphData = {
      nodes: [
        { id: "a", title: "A", status: "pending" },
        { id: "b", title: "B", status: "pending" },
      ],
      edges: [{ from: "a", to: "b" }],
    };
    const result = await runElkLayout(data);
    const depEdge = result.edges.find((e) => e.id === "dep-0");
    expect(depEdge).toBeDefined();
    expect(depEdge!.source).toBe("a");
    expect(depEdge!.target).toBe("b");
    expect(depEdge!.type).toBe("smoothstep");
  });
});
