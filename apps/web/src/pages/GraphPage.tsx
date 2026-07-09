import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import { useGraph } from "../hooks/use-graph.ts";
import { usePhase } from "../hooks/use-phase.tsx";
import { useProject } from "../hooks/use-project.ts";
import { useConfig } from "../hooks/use-config.ts";
import { GraphView } from "../components/graph/GraphView.tsx";
import { GraphFilters } from "../components/graph/GraphFilters.tsx";
import { GraphStats } from "../components/graph/GraphStats.tsx";
import { GraphSearch } from "../components/graph/GraphSearch.tsx";
import { GraphLegend } from "../components/graph/GraphLegend.tsx";
import { GraphOverlayToggles } from "../components/graph/GraphOverlayToggles.tsx";
import { GraphColorBy } from "../components/graph/GraphColorBy.tsx";
import { GraphPresetSelector } from "../components/graph/GraphPresetSelector.tsx";
import { GraphFocusControls } from "../components/graph/GraphFocusControls.tsx";
import { useElkLayout } from "../components/graph/hooks/useElkLayout.ts";
import { useGraphState } from "../components/graph/hooks/useGraphState.ts";
import { buildOverlayEdges } from "../components/graph/layout/elk-layout.ts";
import { bfsSubgraph } from "../components/graph/layout/focus.ts";
import { findMatchedNodeIds, filterGraphByStatus } from "../components/graph/graph-utils.ts";
import { scopeColor } from "../components/graph/graph-colors.ts";
import { LoadingState } from "../components/shared/LoadingState.tsx";
import { ErrorState } from "../components/shared/ErrorState.tsx";
import type { Viewport, Node, Edge } from "@xyflow/react";

// Persist graph state across navigations (module-level, survives unmount)
const savedState = {
  statuses: new Set<string>(),
  viewport: undefined as Viewport | undefined,
};

// Overlay edges are hidden below this zoom level to reduce visual noise
const LOD_OVERLAY_THRESHOLD = 0.5;

export function GraphPage() {
  const navigate = useNavigate();
  const { phase } = usePhase();
  const { project } = useProject();
  const { data, error, isLoading, mutate } = useGraph(phase, project);
  const { scopes } = useConfig(project);
  const { state, dispatch } = useGraphState();
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(savedState.statuses);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isZoomedOut, setIsZoomedOut] = useState(
    () => (savedState.viewport?.zoom ?? 1) < LOD_OVERLAY_THRESHOLD,
  );

  const matchedNodeIds = useMemo(
    () => (!data ? new Set<string>() : findMatchedNodeIds(data, searchQuery)),
    [data, searchQuery],
  );

  const filteredData = useMemo(
    () => (!data ? undefined : filterGraphByStatus(data, selectedStatuses)),
    [data, selectedStatuses],
  );

  // Focus mode: narrow the graph to the BFS neighbourhood of the focus node
  const focusedData = useMemo(() => {
    if (state.preset !== "focus" || !state.focusNodeId || !filteredData) return filteredData;
    return bfsSubgraph(filteredData, state.focusNodeId, state.focusDepth);
  }, [filteredData, state.preset, state.focusNodeId, state.focusDepth]);

  const { nodes: layoutNodes, edges: structuralEdges, isLayouting } = useElkLayout(
    focusedData,
    state.clustering,
    state.showParentEdges,
  );

  const visibleTaskCount = useMemo(
    () => layoutNodes.filter((n) => n.type === "task").length,
    [layoutNodes],
  );

  // Adjacency for hover dim — structural edges only (dep + parent)
  const adjacentIds = useMemo((): Set<string> => {
    if (!hoveredNodeId) return new Set();
    const adj = new Set<string>();
    for (const edge of structuralEdges) {
      if (edge.source === hoveredNodeId) adj.add(edge.target as string);
      if (edge.target === hoveredNodeId) adj.add(edge.source as string);
    }
    return adj;
  }, [hoveredNodeId, structuralEdges]);

  // Full decoration chain: scope tint → search highlight → hover dim
  const nodes = useMemo((): Node[] => {
    let result = layoutNodes;

    if (state.colorBy) {
      const tint = scopeColor(state.colorBy, scopes);
      result = result.map((node) => {
        if (node.type !== "task") return node;
        const hasTint = (node.data as { touches?: string[] }).touches?.includes(state.colorBy!);
        return { ...node, data: { ...node.data, scopeTint: hasTint ? tint : undefined } };
      });
    }

    const searchActive = searchQuery !== "";
    if (searchActive && matchedNodeIds.size > 0) {
      return result.map((node) => ({
        ...node,
        data: { ...node.data, highlighted: matchedNodeIds.has(node.id), dimmed: !matchedNodeIds.has(node.id) },
      }));
    }

    if (hoveredNodeId) {
      return result.map((node) => {
        if (node.type !== "task") return node;
        const adjacent = node.id === hoveredNodeId || adjacentIds.has(node.id);
        return { ...node, data: { ...node.data, dimmed: !adjacent } };
      });
    }

    return result;
  }, [layoutNodes, state.colorBy, scopes, searchQuery, matchedNodeIds, hoveredNodeId, adjacentIds]);

  const edges = useMemo((): Edge[] => {
    if (!focusedData || isZoomedOut) return structuralEdges;
    const overlays = buildOverlayEdges(focusedData, state.overlays.related, state.overlays.spawnedBy);
    return overlays.length === 0 ? structuralEdges : [...structuralEdges, ...overlays];
  }, [structuralEdges, focusedData, state.overlays.related, state.overlays.spawnedBy, isZoomedOut]);

  const toggleStatus = useCallback((status: string) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) { next.delete(status); } else { next.add(status); }
      savedState.statuses = next;
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    savedState.statuses = new Set();
    setSelectedStatuses(savedState.statuses);
  }, []);

  const onViewportChange = useCallback((viewport: Viewport) => {
    savedState.viewport = viewport;
    setIsZoomedOut(viewport.zoom < LOD_OVERLAY_THRESHOLD);
  }, []);

  const onTaskClick = useCallback((taskId: string) => {
    if (state.preset === "focus") {
      dispatch({ type: "SET_FOCUS", nodeId: taskId });
    } else {
      navigate(`/tasks/${taskId}`);
    }
  }, [state.preset, dispatch, navigate]);

  if (isLoading) return <LoadingState variant="graph" />;
  if (error) return <ErrorState error={error} onRetry={() => mutate()} />;
  if (!data) return null;

  if (data.nodes.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
        No dependencies to display.
      </p>
    );
  }

  if (isLayouting && nodes.length === 0) return <LoadingState variant="graph" />;

  const showOverlayToggles = state.preset === "default" || state.preset === "focus";

  return (
    <div className="flex flex-col h-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-2 pb-3">
        <div className="flex items-center gap-4 flex-wrap">
          <GraphFilters
            selectedStatuses={selectedStatuses}
            onToggleStatus={toggleStatus}
            onClearFilters={clearFilters}
          />
          <GraphPresetSelector
            preset={state.preset}
            onChange={(preset) => dispatch({ type: "SET_PRESET", preset })}
          />
          {showOverlayToggles && (
            <GraphOverlayToggles
              showRelated={state.overlays.related}
              showSpawnedBy={state.overlays.spawnedBy}
              onToggleRelated={() => dispatch({ type: "TOGGLE_RELATED" })}
              onToggleSpawnedBy={() => dispatch({ type: "TOGGLE_SPAWNED_BY" })}
              lodHidden={isZoomedOut}
            />
          )}
          {state.preset === "focus" && (
            <GraphFocusControls
              focusNodeId={state.focusNodeId}
              focusDepth={state.focusDepth}
              onDepthChange={(depth) => dispatch({ type: "SET_FOCUS_DEPTH", depth })}
              onExit={() => dispatch({ type: "EXIT_FOCUS" })}
            />
          )}
          <GraphColorBy
            scopes={scopes}
            colorBy={state.colorBy}
            onColorByChange={(scope) => dispatch({ type: "SET_COLOR_BY", scope })}
          />
          <GraphStats data={data} visibleCount={visibleTaskCount} />
        </div>
      </div>
      <ReactFlowProvider>
        <div className="relative flex-1 min-h-0 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="absolute top-2 left-2 right-2 sm:right-auto sm:left-3 sm:top-3 z-10">
            <GraphSearch
              query={searchQuery}
              onQueryChange={setSearchQuery}
              matchedNodeIds={matchedNodeIds}
            />
          </div>
          <GraphLegend />
          <GraphView
            nodes={nodes}
            edges={edges}
            defaultViewport={savedState.viewport}
            onViewportChange={onViewportChange}
            onTaskClick={onTaskClick}
            onNodeHover={setHoveredNodeId}
          />
        </div>
      </ReactFlowProvider>
    </div>
  );
}
