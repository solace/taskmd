import { useReducer, useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { GraphData } from "../../../api/types.ts";
import { runElkLayout } from "../layout/elk-layout.ts";

type LayoutState = { nodes: Node[]; edges: Edge[]; isLayouting: boolean };

const IDLE: LayoutState = { nodes: [], edges: [], isLayouting: false };

function reduce(_: LayoutState, next: LayoutState): LayoutState {
  return next;
}

export function useElkLayout(
  data: GraphData | undefined,
  clustering: boolean,
  showParentEdges: boolean,
): LayoutState {
  const [state, dispatch] = useReducer(reduce, IDLE);

  useEffect(() => {
    if (!data || data.nodes.length === 0) {
      dispatch(IDLE);
      return;
    }

    dispatch({ ...IDLE, isLayouting: true });

    let cancelled = false;

    runElkLayout(data, { clustering, showParentEdges }).then(({ nodes, edges }) => {
      if (!cancelled) dispatch({ nodes, edges, isLayouting: false });
    });

    return () => { cancelled = true; };
  }, [data, clustering, showParentEdges]);

  return state;
}
