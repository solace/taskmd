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

function buildPhaseCompounds(
  phaseMap: Map<string, string[]>,
  nodeMap: Map<string, GraphNode>,
): ElkNode[] {
  return [...phaseMap.entries()].map(([phase, memberIds]) => {
    const grouped = new Map<string, string[]>();
    const ungrouped: string[] = [];
    for (const id of memberIds) {
      const g = nodeMap.get(id)?.group;
      if (g) {
        const arr = grouped.get(g) ?? [];
        arr.push(id);
        grouped.set(g, arr);
      } else {
        ungrouped.push(id);
      }
    }
    const children: ElkNode[] = [
      ...ungrouped.map(makeTaskElkNode),
      ...[...grouped.entries()].map(([g, ids]) => ({
        id: `__phasegrp_${phase}/${g}`,
        layoutOptions: { "elk.padding": CONTAINER_PADDING },
        children: ids.map(makeTaskElkNode),
      })),
    ];
    return { id: `__phase_${phase}`, layoutOptions: { "elk.padding": CONTAINER_PADDING }, children };
  });
}

function buildGroupCompounds(groupMap: Map<string, string[]>): ElkNode[] {
  const topMap = new Map<string, { flat: string[]; subs: Map<string, string[]> }>();
  for (const [group, ids] of groupMap) {
    const slashIdx = group.indexOf("/");
    if (slashIdx === -1) {
      const entry = topMap.get(group) ?? { flat: [] as string[], subs: new Map<string, string[]>() };
      entry.flat.push(...ids);
      topMap.set(group, entry);
    } else {
      const top = group.slice(0, slashIdx);
      const sub = group.slice(slashIdx + 1);
      const entry = topMap.get(top) ?? { flat: [] as string[], subs: new Map<string, string[]>() };
      const subArr = entry.subs.get(sub) ?? ([] as string[]);
      subArr.push(...ids);
      entry.subs.set(sub, subArr);
      topMap.set(top, entry);
    }
  }
  return [...topMap.entries()].map(([top, { flat, subs }]) => ({
    id: `__grp_${top}`,
    layoutOptions: { "elk.padding": CONTAINER_PADDING },
    children: [
      ...flat.map(makeTaskElkNode),
      ...[...subs.entries()].map(([sub, ids]) => ({
        id: `__grp_${top}/${sub}`,
        layoutOptions: { "elk.padding": CONTAINER_PADDING },
        children: ids.map(makeTaskElkNode),
      })),
    ],
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

  const { groupMap, topLevel } = classifyNodes(nonPhaseTasks);

  // When clustering is off, group-clustered tasks fall to top level
  const groupFlat = clustering ? [] : [...groupMap.values()].flat();
  const elkChildren: ElkNode[] = [
    ...buildPhaseCompounds(phaseMap, nodeMap),
    ...(clustering ? buildGroupCompounds(groupMap) : []),
    ...[...topLevel, ...groupFlat].map(makeTaskElkNode),
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

  if (id.startsWith("__phase_") || id.startsWith("__phasegrp_") || id.startsWith("__grp_")) {
    const isPhase = id.startsWith("__phase_");
    let label: string;
    let variant: string;
    if (isPhase) {
      label = id.slice("__phase_".length);
      variant = "phase";
    } else if (id.startsWith("__phasegrp_")) {
      // __phasegrp_{phase}/{group} — label is the group part after the first /
      const val = id.slice("__phasegrp_".length);
      label = val.slice(val.indexOf("/") + 1);
      variant = "group";
    } else {
      // __grp_{top} or __grp_{top}/{sub} — label is the last path segment
      const val = id.slice("__grp_".length);
      const slashIdx = val.lastIndexOf("/");
      label = slashIdx === -1 ? val : val.slice(slashIdx + 1);
      variant = "group";
    }
    const containerNode: Node = {
      id,
      type: "container",
      position: { x, y },
      style: { width: elkNode.width ?? 0, height: elkNode.height ?? 0 },
      data: { label, variant },
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
