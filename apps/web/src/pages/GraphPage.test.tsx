import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createGraphData } from "../test-utils/fixtures.ts";

vi.mock("../hooks/use-graph.ts", () => ({ useGraph: vi.fn() }));
vi.mock("../hooks/use-phase.tsx", () => ({ usePhase: () => ({ phase: null }) }));
vi.mock("../hooks/use-project.ts", () => ({ useProject: () => ({ project: null }) }));
vi.mock("../components/graph/useGraphLayout.ts", () => ({
  useGraphLayout: (data: any) => ({
    nodes: data?.nodes?.map((n: any) => ({ id: n.id, data: n })) ?? [],
    edges: data?.edges ?? [],
  }),
}));
vi.mock("@xyflow/react", () => ({
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

let capturedGraphViewProps: any = {};
vi.mock("../components/graph/GraphView.tsx", () => ({
  GraphView: (props: any) => {
    capturedGraphViewProps = props;
    return <div data-testid="graph-view">GraphView</div>;
  },
}));

let capturedFiltersProps: any = {};
vi.mock("../components/graph/GraphFilters.tsx", () => ({
  GraphFilters: (props: any) => {
    capturedFiltersProps = props;
    return <div data-testid="graph-filters">Filters</div>;
  },
}));
vi.mock("../components/graph/GraphStats.tsx", () => ({
  GraphStats: () => <div data-testid="graph-stats">Stats</div>,
}));
vi.mock("../components/graph/GraphSearch.tsx", () => ({
  GraphSearch: () => <div data-testid="graph-search">Search</div>,
}));
vi.mock("../components/graph/GraphLegend.tsx", () => ({
  GraphLegend: () => <div data-testid="graph-legend">Legend</div>,
}));
vi.mock("../components/graph/graph-utils.ts", () => ({
  findMatchedNodeIds: () => new Set(),
  filterGraphByStatus: (_data: any, _statuses: Set<string>) => _data,
}));

import { useGraph } from "../hooks/use-graph.ts";
const mockUseGraph = vi.mocked(useGraph);

import { GraphPage } from "./GraphPage.tsx";

describe("GraphPage", () => {
  it("renders loading state", () => {
    mockUseGraph.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
      isValidating: false,
    });
    const { container } = render(<GraphPage />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders error state", () => {
    mockUseGraph.mockReturnValue({
      data: undefined,
      error: new Error("fail"),
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    });
    render(<GraphPage />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders empty state when no nodes", () => {
    mockUseGraph.mockReturnValue({
      data: createGraphData({ nodes: [], edges: [] }),
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    });
    render(<GraphPage />);
    expect(screen.getByText("No dependencies to display.")).toBeInTheDocument();
  });

  it("renders graph components when data is available", () => {
    mockUseGraph.mockReturnValue({
      data: createGraphData(),
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    });
    render(<GraphPage />);
    expect(screen.getByTestId("graph-view")).toBeInTheDocument();
    expect(screen.getByTestId("graph-filters")).toBeInTheDocument();
    expect(screen.getByTestId("graph-stats")).toBeInTheDocument();
    expect(screen.getByTestId("graph-search")).toBeInTheDocument();
    expect(screen.getByTestId("graph-legend")).toBeInTheDocument();
  });

  it("calls mutate when retry is clicked in error state", () => {
    const mockMutate = vi.fn();
    mockUseGraph.mockReturnValue({
      data: undefined,
      error: new Error("fail"),
      isLoading: false,
      mutate: mockMutate,
      isValidating: false,
    });
    render(<GraphPage />);
    fireEvent.click(screen.getByText("Retry"));
    expect(mockMutate).toHaveBeenCalled();
  });

  it("toggleStatus adds and removes statuses", () => {
    mockUseGraph.mockReturnValue({
      data: createGraphData(),
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    });
    render(<GraphPage />);

    // Initially no filters selected
    expect(capturedFiltersProps.selectedStatuses.size).toBe(0);

    // Toggle a status on
    capturedFiltersProps.onToggleStatus("pending");
    render(<GraphPage />);
    expect(capturedFiltersProps.selectedStatuses.has("pending")).toBe(true);

    // Toggle it off
    capturedFiltersProps.onToggleStatus("pending");
    render(<GraphPage />);
    expect(capturedFiltersProps.selectedStatuses.has("pending")).toBe(false);
  });

  it("clearFilters resets selected statuses", () => {
    mockUseGraph.mockReturnValue({
      data: createGraphData(),
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    });
    render(<GraphPage />);

    // Add a filter first
    capturedFiltersProps.onToggleStatus("pending");
    render(<GraphPage />);
    expect(capturedFiltersProps.selectedStatuses.size).toBe(1);

    // Clear filters
    capturedFiltersProps.onClearFilters();
    render(<GraphPage />);
    expect(capturedFiltersProps.selectedStatuses.size).toBe(0);
  });

  it("onViewportChange persists viewport", () => {
    mockUseGraph.mockReturnValue({
      data: createGraphData(),
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    });
    render(<GraphPage />);

    const viewport = { x: 100, y: 200, zoom: 1.5 };
    capturedGraphViewProps.onViewportChange(viewport);
    // Re-render to check the viewport is passed back
    render(<GraphPage />);
    expect(capturedGraphViewProps.defaultViewport).toEqual(viewport);
  });
});
