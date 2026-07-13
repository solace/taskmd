import { describe, it, expect } from "vitest";
import { classifyNodes } from "./cluster.ts";
import type { GraphNode } from "../../../api/types.ts";

describe("classifyNodes", () => {
  it("returns empty groups for empty candidates", () => {
    const { groupMap, topLevel } = classifyNodes([]);
    expect(groupMap.size).toBe(0);
    expect(topLevel).toHaveLength(0);
  });

  it("puts task with group into groupMap", () => {
    const node: GraphNode = { id: "a", title: "A", status: "pending", group: "cli" };
    const { groupMap, topLevel } = classifyNodes([node]);
    expect(groupMap.get("cli")).toEqual(["a"]);
    expect(topLevel).toHaveLength(0);
  });

  it("puts task with no group into topLevel", () => {
    const node: GraphNode = { id: "a", title: "A", status: "pending" };
    const { topLevel } = classifyNodes([node]);
    expect(topLevel).toEqual(["a"]);
  });

  it("groups multiple tasks with the same group together", () => {
    const a: GraphNode = { id: "a", title: "A", status: "pending", group: "cli" };
    const b: GraphNode = { id: "b", title: "B", status: "pending", group: "cli" };
    const { groupMap } = classifyNodes([a, b]);
    expect(groupMap.get("cli")).toEqual(["a", "b"]);
  });

  it("creates separate entries for different groups", () => {
    const a: GraphNode = { id: "a", title: "A", status: "pending", group: "cli" };
    const b: GraphNode = { id: "b", title: "B", status: "pending", group: "web" };
    const { groupMap } = classifyNodes([a, b]);
    expect(groupMap.get("cli")).toEqual(["a"]);
    expect(groupMap.get("web")).toEqual(["b"]);
  });

  it("handles group with subgroup separator", () => {
    const a: GraphNode = { id: "a", title: "A", status: "pending", group: "cli/graph" };
    const b: GraphNode = { id: "b", title: "B", status: "pending", group: "cli/output" };
    const { groupMap } = classifyNodes([a, b]);
    expect(groupMap.get("cli/graph")).toEqual(["a"]);
    expect(groupMap.get("cli/output")).toEqual(["b"]);
  });

  it("groups tasks with deps into their group regardless of connectivity", () => {
    const a: GraphNode = { id: "a", title: "A", status: "pending", group: "cli" };
    const b: GraphNode = { id: "b", title: "B", status: "pending", group: "cli" };
    // Even if a→b dependency exists, both go into the group cluster
    const { groupMap, topLevel } = classifyNodes([a, b]);
    expect(groupMap.get("cli")).toContain("a");
    expect(groupMap.get("cli")).toContain("b");
    expect(topLevel).toHaveLength(0);
  });
});
