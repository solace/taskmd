import { describe, it, expect } from "vitest";
import { buildOverlayEdges, buildStructuralEdges } from "./elk-edges.ts";
import type { GraphData } from "../../../api/types.ts";

const twoNodes: GraphData = {
  nodes: [
    { id: "a", title: "A", status: "pending" },
    { id: "b", title: "B", status: "pending" },
  ],
  edges: [],
  seeAlsoEdges: [{ from: "a", to: "b" }],
  spawnedByEdges: [{ child: "b", source: "a" }],
};

describe("buildOverlayEdges", () => {
  it("returns no edges when both overlays are off", () => {
    expect(buildOverlayEdges(twoNodes, false, false)).toHaveLength(0);
  });

  it("returns see_also edges when showSeeAlso is true", () => {
    const edges = buildOverlayEdges(twoNodes, true, false);
    expect(edges).toHaveLength(1);
    expect(edges[0].id).toBe("see-0");
    expect(edges[0].source).toBe("a");
    expect(edges[0].target).toBe("b");
    expect(edges[0].type).toBe("straight");
  });

  it("returns spawned-by edges when showSpawnedBy is true", () => {
    const edges = buildOverlayEdges(twoNodes, false, true);
    expect(edges).toHaveLength(1);
    expect(edges[0].id).toBe("spawn-0");
    expect(edges[0].source).toBe("b");
    expect(edges[0].target).toBe("a");
  });

  it("returns both overlay types when both are on", () => {
    expect(buildOverlayEdges(twoNodes, true, true)).toHaveLength(2);
  });

  it("handles missing seeAlsoEdges/spawnedByEdges gracefully", () => {
    const data: GraphData = { nodes: [], edges: [] };
    expect(buildOverlayEdges(data, true, true)).toHaveLength(0);
  });
});

describe("buildStructuralEdges", () => {
  it("returns dep edges for all data.edges", () => {
    const data: GraphData = {
      nodes: [
        { id: "a", title: "A", status: "pending" },
        { id: "b", title: "B", status: "pending" },
      ],
      edges: [{ from: "a", to: "b" }],
    };
    const edges = buildStructuralEdges(data);
    const dep = edges.find((e) => e.id === "dep-0");
    expect(dep).toBeDefined();
    expect(dep!.source).toBe("a");
    expect(dep!.target).toBe("b");
    expect(dep!.type).toBe("smoothstep");
  });

  it("includes parent diamond edges when showParentEdges is true", () => {
    const data: GraphData = {
      nodes: [
        { id: "p", title: "Parent", status: "pending" },
        { id: "c", title: "Child", status: "pending", parent: "p" },
      ],
      edges: [],
    };
    const edges = buildStructuralEdges(data, { showParentEdges: true });
    const par = edges.find((e) => e.id === "par-c");
    expect(par).toBeDefined();
    expect(par!.markerStart).toBe("url(#rf-diamond-filled)");
  });

  it("omits parent diamond edges when showParentEdges is false", () => {
    const data: GraphData = {
      nodes: [
        { id: "p", title: "Parent", status: "pending" },
        { id: "c", title: "Child", status: "pending", parent: "p" },
      ],
      edges: [],
    };
    const edges = buildStructuralEdges(data, { showParentEdges: false });
    expect(edges.every((e) => !e.id.startsWith("par-"))).toBe(true);
  });
});
