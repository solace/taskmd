import { useState, useMemo, useCallback } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useGraph } from "../hooks/use-graph.ts";
import { usePhase } from "../hooks/use-phase.tsx";
import { useProject } from "../hooks/use-project.ts";
import { GraphView } from "../components/graph/GraphView.tsx";
import { GraphFilters } from "../components/graph/GraphFilters.tsx";
import { GraphStats } from "../components/graph/GraphStats.tsx";
import { GraphSearch } from "../components/graph/GraphSearch.tsx";
import { GraphLegend } from "../components/graph/GraphLegend.tsx";
import { useGraphLayout } from "../components/graph/useGraphLayout.ts";
import { findMatchedNodeIds, filterGraphByStatus } from "../components/graph/graph-utils.ts";
import { LoadingState } from "../components/shared/LoadingState.tsx";
import { ErrorState } from "../components/shared/ErrorState.tsx";
import type { Viewport } from "@xyflow/react";

// Persist graph state across navigations (module-level, survives unmount)
const savedState = {
  statuses: new Set<string>(),
  viewport: undefined as Viewport | undefined,
};

export function GraphPage() {
  const { phase } = usePhase();
  const { project } = useProject();
  const { data, error, isLoading, mutate } = useGraph(phase, project);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(savedState.statuses);
  const [searchQuery, setSearchQuery] = useState("");

  const matchedNodeIds = useMemo(
    () => (!data ? new Set<string>() : findMatchedNodeIds(data, searchQuery)),
    [data, searchQuery],
  );

  const filteredData = useMemo(
    () => (!data ? undefined : filterGraphByStatus(data, selectedStatuses)),
    [data, selectedStatuses],
  );

  const { nodes, edges } = useGraphLayout(filteredData);

  const toggleStatus = useCallback((status: string) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      savedState.statuses = next;
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    const empty = new Set<string>();
    savedState.statuses = empty;
    setSelectedStatuses(empty);
  }, []);

  const onViewportChange = useCallback((viewport: Viewport) => {
    savedState.viewport = viewport;
  }, []);

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

  return (
    <div className="flex flex-col h-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-2 pb-3">
        <div className="flex items-center gap-4 flex-wrap">
          <GraphFilters
            selectedStatuses={selectedStatuses}
            onToggleStatus={toggleStatus}
            onClearFilters={clearFilters}
          />
          <GraphStats data={data} visibleCount={nodes.length} />
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
            matchedNodeIds={matchedNodeIds}
            searchActive={searchQuery !== ""}
          />
        </div>
      </ReactFlowProvider>
    </div>
  );
}
