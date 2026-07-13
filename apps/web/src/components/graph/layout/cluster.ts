import type { GraphNode } from "../../../api/types.ts";

export interface NodeClassification {
  groupMap: Map<string, string[]>;  // group → task IDs (all tasks with a group field)
  topLevel: string[];               // tasks with no group (and no phase — phase is handled upstream)
}

export function classifyNodes(candidates: GraphNode[]): NodeClassification {
  const groupMap = new Map<string, string[]>();
  const topLevel: string[] = [];

  for (const node of candidates) {
    if (node.group) {
      const members = groupMap.get(node.group) ?? [];
      members.push(node.id);
      groupMap.set(node.group, members);
    } else {
      topLevel.push(node.id);
    }
  }

  return { groupMap, topLevel };
}
