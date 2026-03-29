import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { CellContext, Row } from "@tanstack/react-table";
import { createTaskColumns } from "./columns.tsx";
import type { Task } from "../../../api/types.ts";
import { createTask, resetFixtureCounter } from "../../../test-utils/fixtures.ts";

vi.mock("./Badges.tsx", () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
  PriorityBadge: ({ priority }: { priority: string }) => (
    <span data-testid="priority-badge">{priority}</span>
  ),
  TypeBadge: ({ type }: { type: string }) => (
    <span data-testid="type-badge">{type}</span>
  ),
  PhaseBadge: ({ phase }: { phase: string }) => (
    <span data-testid="phase-badge">{phase}</span>
  ),
  BlockedStatusBadge: ({ dependencies }: { dependencies: string[] | null }) => (
    <span data-testid="blocked-badge">{dependencies?.join(",") ?? "none"}</span>
  ),
}));

/**
 * Build a minimal CellContext for a given task and accessor value.
 * This avoids needing a full TanStack table instance.
 */
function makeCellContext<K extends keyof Task>(
  task: Task,
  key: K,
): CellContext<Task, Task[K]> {
  return {
    getValue: () => task[key],
    row: { original: task } as Row<Task>,
    column: {} as never,
    cell: {} as never,
    table: {} as never,
    renderValue: () => task[key],
  } as unknown as CellContext<Task, Task[K]>;
}

function renderCell(node: React.ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>);
}

describe("createTaskColumns", () => {
  beforeEach(() => {
    resetFixtureCounter();
  });

  function getColumns(
    selectedTags = new Set<string>(),
    toggleTag = vi.fn(),
    taskStatusMap?: Map<string, string>,
    showPhase = true,
  ) {
    return createTaskColumns(selectedTags, toggleTag, taskStatusMap, showPhase);
  }

  describe("id column", () => {
    it("renders a link to /tasks/{id}", () => {
      const task = createTask({ id: "042" });
      const cols = getColumns();
      const idCol = cols.find((c) => (c as { accessorKey?: string }).accessorKey === "id")!;
      const cellFn = idCol.cell as (ctx: CellContext<Task, string>) => React.ReactNode;
      renderCell(cellFn(makeCellContext(task, "id")));
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/tasks/042");
      expect(link).toHaveTextContent("042");
    });
  });

  describe("title column", () => {
    it("renders a link to /tasks/{id} with title text", () => {
      const task = createTask({ id: "007", title: "Do the thing" });
      const cols = getColumns();
      const titleCol = cols.find((c) => (c as { accessorKey?: string }).accessorKey === "title")!;
      const cellFn = titleCol.cell as (ctx: CellContext<Task, string>) => React.ReactNode;
      renderCell(cellFn(makeCellContext(task, "title")));
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/tasks/007");
      expect(link).toHaveTextContent("Do the thing");
    });
  });

  describe("status column", () => {
    it("renders a StatusBadge with the task status", () => {
      const task = createTask({ status: "in-progress" });
      const cols = getColumns();
      const statusCol = cols.find((c) => (c as { accessorKey?: string }).accessorKey === "status")!;
      const cellFn = statusCol.cell as (ctx: CellContext<Task, string>) => React.ReactNode;
      renderCell(cellFn(makeCellContext(task, "status")));
      expect(screen.getByTestId("status-badge")).toHaveTextContent("in-progress");
    });
  });

  describe("priority column", () => {
    it("renders a PriorityBadge when priority has a value", () => {
      const task = createTask({ priority: "high" });
      const cols = getColumns();
      const priorityCol = cols.find((c) => (c as { accessorKey?: string }).accessorKey === "priority")!;
      const cellFn = priorityCol.cell as (ctx: CellContext<Task, string>) => React.ReactNode;
      renderCell(cellFn(makeCellContext(task, "priority")));
      expect(screen.getByTestId("priority-badge")).toHaveTextContent("high");
    });

    it("renders null when priority is empty string", () => {
      const task = createTask({ priority: "" });
      const cols = getColumns();
      const priorityCol = cols.find((c) => (c as { accessorKey?: string }).accessorKey === "priority")!;
      const cellFn = priorityCol.cell as (ctx: CellContext<Task, string>) => React.ReactNode;
      const { container } = renderCell(cellFn(makeCellContext(task, "priority")));
      expect(container.firstChild).toBeNull();
    });
  });

  describe("effort column", () => {
    it("renders the effort value when present", () => {
      const task = createTask({ effort: "large" });
      const cols = getColumns();
      const effortCol = cols.find((c) => (c as { accessorKey?: string }).accessorKey === "effort")!;
      const cellFn = effortCol.cell as (ctx: CellContext<Task, string>) => React.ReactNode;
      renderCell(cellFn(makeCellContext(task, "effort")));
      expect(screen.getByText("large")).toBeInTheDocument();
    });

    it("renders '-' when effort is empty", () => {
      const task = createTask({ effort: "" });
      const cols = getColumns();
      const effortCol = cols.find((c) => (c as { accessorKey?: string }).accessorKey === "effort")!;
      const cellFn = effortCol.cell as (ctx: CellContext<Task, string>) => React.ReactNode;
      renderCell(cellFn(makeCellContext(task, "effort")));
      expect(screen.getByText("-")).toBeInTheDocument();
    });
  });

  describe("type column", () => {
    it("renders a TypeBadge when type has a value", () => {
      const task = createTask({ type: "bug" });
      const cols = getColumns();
      const typeCol = cols.find((c) => (c as { accessorKey?: string }).accessorKey === "type")!;
      const cellFn = typeCol.cell as (ctx: CellContext<Task, string>) => React.ReactNode;
      renderCell(cellFn(makeCellContext(task, "type")));
      expect(screen.getByTestId("type-badge")).toHaveTextContent("bug");
    });

    it("renders '-' when type is empty/null", () => {
      const task = createTask({ type: "" });
      const cols = getColumns();
      const typeCol = cols.find((c) => (c as { accessorKey?: string }).accessorKey === "type")!;
      const cellFn = typeCol.cell as (ctx: CellContext<Task, string>) => React.ReactNode;
      renderCell(cellFn(makeCellContext(task, "type")));
      expect(screen.getByText("-")).toBeInTheDocument();
    });
  });

  describe("phase column", () => {
    it("renders a PhaseBadge when showPhase=true and phase has a value", () => {
      const task = createTask({ phase: "beta" });
      const cols = getColumns(new Set(), vi.fn(), undefined, true);
      const phaseCol = cols.find((c) => (c as { accessorKey?: string }).accessorKey === "phase")!;
      const cellFn = phaseCol.cell as (ctx: CellContext<Task, string>) => React.ReactNode;
      renderCell(cellFn(makeCellContext(task, "phase")));
      expect(screen.getByTestId("phase-badge")).toHaveTextContent("beta");
    });

    it("renders the phase text (not badge) when showPhase=false", () => {
      const task = createTask({ phase: "beta" });
      const cols = getColumns(new Set(), vi.fn(), undefined, false);
      const phaseCol = cols.find((c) => (c as { accessorKey?: string }).accessorKey === "phase")!;
      const cellFn = phaseCol.cell as (ctx: CellContext<Task, string>) => React.ReactNode;
      renderCell(cellFn(makeCellContext(task, "phase")));
      expect(screen.queryByTestId("phase-badge")).not.toBeInTheDocument();
      expect(screen.getByText("beta")).toBeInTheDocument();
    });

    it("renders '-' when phase is empty/null", () => {
      const task = createTask({ phase: "" });
      const cols = getColumns();
      const phaseCol = cols.find((c) => (c as { accessorKey?: string }).accessorKey === "phase")!;
      const cellFn = phaseCol.cell as (ctx: CellContext<Task, string>) => React.ReactNode;
      renderCell(cellFn(makeCellContext(task, "phase")));
      expect(screen.getByText("-")).toBeInTheDocument();
    });
  });

  describe("owner column", () => {
    it("renders the owner value when present", () => {
      const task = createTask({ owner: "alice" });
      const cols = getColumns();
      const ownerCol = cols.find((c) => (c as { accessorKey?: string }).accessorKey === "owner")!;
      const cellFn = ownerCol.cell as (ctx: CellContext<Task, string>) => React.ReactNode;
      renderCell(cellFn(makeCellContext(task, "owner")));
      expect(screen.getByText("alice")).toBeInTheDocument();
    });

    it("renders '-' when owner is empty", () => {
      const task = createTask({ owner: "" });
      const cols = getColumns();
      const ownerCol = cols.find((c) => (c as { accessorKey?: string }).accessorKey === "owner")!;
      const cellFn = ownerCol.cell as (ctx: CellContext<Task, string>) => React.ReactNode;
      renderCell(cellFn(makeCellContext(task, "owner")));
      expect(screen.getByText("-")).toBeInTheDocument();
    });
  });

});
