import { describe, it, expect } from "vitest";
import { classifyNodes } from "./cluster.ts";
import type { GraphData } from "../../../api/types.ts";

describe("classifyNodes", () => {
  it("returns empty groups for empty candidates", () => {
    const { scopeGroups, topLevel } = classifyNodes({ nodes: [], edges: [] }, []);
    expect(scopeGroups.size).toBe(0);
    expect(topLevel).toHaveLength(0);
  });

  it("puts isolated task with touches into scope group", () => {
    const node = { id: "a", title: "A", status: "pending", touches: ["api"] };
    const data: GraphData = { nodes: [node], edges: [] };
    const { scopeGroups, topLevel } = classifyNodes(data, [node]);
    expect(scopeGroups.get("api")).toEqual(["a"]);
    expect(topLevel).toHaveLength(0);
  });

  it("uses first touches scope for multi-scope tasks", () => {
    const node = { id: "a", title: "A", status: "pending", touches: ["web", "api"] };
    const data: GraphData = { nodes: [node], edges: [] };
    const { scopeGroups } = classifyNodes(data, [node]);
    expect(scopeGroups.get("web")).toEqual(["a"]);
    expect(scopeGroups.has("api")).toBe(false);
  });

  it("puts isolated task with no touches into topLevel", () => {
    const node = { id: "a", title: "A", status: "pending" };
    const data: GraphData = { nodes: [node], edges: [] };
    const { topLevel } = classifyNodes(data, [node]);
    expect(topLevel).toEqual(["a"]);
  });

  it("puts nodes with dep edges into topLevel even if they have touches", () => {
    const a = { id: "a", title: "A", status: "pending", touches: ["api"] };
    const b = { id: "b", title: "B", status: "pending", touches: ["api"] };
    const data: GraphData = { nodes: [a, b], edges: [{ from: "a", to: "b" }] };
    const { scopeGroups, topLevel } = classifyNodes(data, [a, b]);
    expect(scopeGroups.size).toBe(0);
    expect(topLevel).toContain("a");
    expect(topLevel).toContain("b");
  });

  it("puts child node into topLevel even if it has touches", () => {
    const parent = { id: "p", title: "Parent", status: "pending" };
    const child = { id: "c", title: "Child", status: "pending", parent: "p", touches: ["api"] };
    const data: GraphData = { nodes: [parent, child], edges: [] };
    const { topLevel } = classifyNodes(data, [child]);
    expect(topLevel).toContain("c");
  });

  it("groups multiple isolated tasks into same scope", () => {
    const a = { id: "a", title: "A", status: "pending", touches: ["api"] };
    const b = { id: "b", title: "B", status: "pending", touches: ["api"] };
    const data: GraphData = { nodes: [a, b], edges: [] };
    const { scopeGroups } = classifyNodes(data, [a, b]);
    expect(scopeGroups.get("api")).toEqual(["a", "b"]);
  });

  it("creates separate scope groups for different scopes", () => {
    const a = { id: "a", title: "A", status: "pending", touches: ["api"] };
    const b = { id: "b", title: "B", status: "pending", touches: ["web"] };
    const data: GraphData = { nodes: [a, b], edges: [] };
    const { scopeGroups } = classifyNodes(data, [a, b]);
    expect(scopeGroups.get("api")).toEqual(["a"]);
    expect(scopeGroups.get("web")).toEqual(["b"]);
  });

  it("ignores phase nodes — caller should pre-filter them out", () => {
    // classifyNodes receives nonPhaseTasks from buildElkGraph; phase nodes are excluded upstream
    const a = { id: "a", title: "A", status: "pending", touches: ["api"] };
    const data: GraphData = { nodes: [a], edges: [] };
    const { scopeGroups } = classifyNodes(data, [a]);
    expect(scopeGroups.get("api")).toEqual(["a"]);
  });
});
