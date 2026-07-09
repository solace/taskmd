// TODO: use elk.worker.js?worker in production
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode, ElkExtendedEdge } from "elkjs/lib/elk-api";
import type { Node, Edge } from "@xyflow/react";
import type { GraphData, GraphNode } from "../../../api/types.ts";
import { classifyNodes } from "./cluster.ts";
import { type LayoutOptions, buildStructuralEdges, buildOverlayEdges } from "./elk-edges.ts";

export type { LayoutOptions };
export { buildStructuralEdges, buildOverlayEdges };

export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 60;

const ELK_ROOT_OPTIONS = {
  algorithm: "layered",
  "elk.direction": "DOWN",
  "elk.layered.spacing.nodeNodeBetweenLayers": "80",
  "elk.spacing.nodeNode": "40",
  "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
  "elk.hierarchyHandling": "INCLUDE_CHILDREN",
  "elk.separateConnectedComponents": "true",
  "elk.spacing.componentComponent": "60",
};

const CONTAINER_PADDING = "[top=36,left=12,bottom=16,right=12]";

function makeTaskElkNode(id: string): ElkNode {
  return { id, width: NODE_WIDTH, height: NODE_HEIGHT };
}

function buildPhaseCompounds(phaseMap: Map<string, string[]>): ElkNode[] {
  return [...phaseMap.entries()].map(([phase, memberIds]) => ({
    id: `__phase_${phase}`,
    layoutOptions: { "elk.padding": CONTAINER_PADDING },
    children: memberIds.map(makeTaskElkNode),
  }));
}

function buildScopeCompounds(scopeGroups: Map<string, string[]>): ElkNode[] {
  return [...scopeGroups.entries()].map(([scope, memberIds]) => ({
    id: `__scope_${scope}`,
    layoutOptions: { "elk.padding": CONTAINER_PADDING },
    children: memberIds.map(makeTaskElkNode),
  }));
}

function buildElkEdges(
  data: GraphData,
  nodeMap: Map<string, GraphNode>,
  options: LayoutOptions = {},
): ElkExtendedEdge[] {
  const { showParentEdges = true } = options;

  const depEdges = data.edges
    .filter((e) => nodeMap.has(e.from) && nodeMap.has(e.to))
    .map((e, i) => ({ id: `elk-dep-${i}`, sources: [e.from], targets: [e.to] }));

  if (!showParentEdges) return depEdges;

  const parentEdges: ElkExtendedEdge[] = [];
  let pi = 0;
  for (const node of data.nodes) {
    if (node.parent && nodeMap.has(node.parent)) {
      parentEdges.push({ id: `elk-par-${pi++}`, sources: [node.parent], targets: [node.id] });
    }
  }

  return [...depEdges, ...parentEdges];
}

export function buildElkGraph(data: GraphData, options: LayoutOptions = {}): ElkNode {
  const { clustering = true } = options;

  if (data.nodes.length === 0) {
    return { id: "__root", layoutOptions: ELK_ROOT_OPTIONS, children: [], edges: [] };
  }

  const nodeMap = new Map<string, GraphNode>(data.nodes.map((n) => [n.id, n]));

  const phaseMap = new Map<string, string[]>();
  const nonPhaseTasks: GraphNode[] = [];

  for (const node of data.nodes) {
    if (node.phase) {
      const members = phaseMap.get(node.phase) ?? [];
      members.push(node.id);
      phaseMap.set(node.phase, members);
    } else {
      nonPhaseTasks.push(node);
    }
  }

  const { scopeGroups, topLevel } = classifyNodes(data, nonPhaseTasks);

  // When clustering is off, scope-grouped tasks fall to top level
  const scopeFlat = clustering ? [] : [...scopeGroups.values()].flat();
  const elkChildren: ElkNode[] = [
    ...buildPhaseCompounds(phaseMap),
    ...(clustering ? buildScopeCompounds(scopeGroups) : []),
    ...[...topLevel, ...scopeFlat].map(makeTaskElkNode),
  ];

  return {
    id: "__root",
    layoutOptions: ELK_ROOT_OPTIONS,
    children: elkChildren,
    edges: buildElkEdges(data, nodeMap, options),
  };
}

function collectElkNodes(
  elkNode: ElkNode,
  parentRfId: string | undefined,
  nodeMap: Map<string, GraphNode>,
  result: Node[],
): void {
  const id = elkNode.id;
  const x = elkNode.x ?? 0;
  const y = elkNode.y ?? 0;

  if (id.startsWith("__phase_") || id.startsWith("__scope_")) {
    const isPhase = id.startsWith("__phase_");
    const prefix = isPhase ? "__phase_" : "__scope_";
    const containerNode: Node = {
      id,
      type: "container",
      position: { x, y },
      style: { width: elkNode.width ?? 0, height: elkNode.height ?? 0 },
      data: { label: id.slice(prefix.length), variant: isPhase ? "phase" : "scope" },
      selectable: false,
      draggable: false,
    };
    if (parentRfId !== undefined) containerNode.parentId = parentRfId;
    result.push(containerNode);
    for (const child of elkNode.children ?? []) {
      collectElkNodes(child, id, nodeMap, result);
    }
  } else {
    const graphNode = nodeMap.get(id);
    const taskNode: Node = {
      id,
      type: "task",
      position: { x, y },
      data: {
        label: graphNode?.title ?? id,
        status: graphNode?.status ?? "",
        priority: graphNode?.priority,
        taskId: id,
        touches: graphNode?.touches,
      },
    };
    if (parentRfId !== undefined) taskNode.parentId = parentRfId;
    result.push(taskNode);
  }
}

export function elkNodesToReactFlow(
  elkRoot: ElkNode,
  nodeMap: Map<string, GraphNode>,
): Node[] {
  const result: Node[] = [];
  for (const child of elkRoot.children ?? []) {
    collectElkNodes(child, undefined, nodeMap, result);
  }
  return result;
}

const elk = new ELK();

export async function runElkLayout(
  data: GraphData,
  options: LayoutOptions = {},
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  if (data.nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const elkGraph = buildElkGraph(data, options);
  const laid = await elk.layout(elkGraph);

  const nodeMap = new Map<string, GraphNode>(data.nodes.map((n) => [n.id, n]));
  const nodes = elkNodesToReactFlow(laid as ElkNode, nodeMap);
  const edges = buildStructuralEdges(data, options);

  return { nodes, edges };
}
