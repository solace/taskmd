import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { Row } from "@tanstack/react-table";
import { MobileCardList } from "./MobileCardList.tsx";
import type { Task } from "../../../api/types.ts";
import { createTask, resetFixtureCounter } from "../../../test-utils/fixtures.ts";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("./Badges.tsx", () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
  PriorityBadge: ({ priority }: { priority: string }) => (
    <span data-testid="priority-badge">{priority}</span>
  ),
  PhaseBadge: ({ phase }: { phase: string }) => (
    <span data-testid="phase-badge">{phase}</span>
  ),
}));

function createMockRow(task: Task): Row<Task> {
  return {
    id: `row-${task.id}`,
    original: task,
  } as unknown as Row<Task>;
}

function renderMobileCardList({
  rows = [] as Row<Task>[],
  onClearFilters = vi.fn(),
  showPhase = true,
} = {}) {
  return render(
    <MemoryRouter>
      <MobileCardList rows={rows} onClearFilters={onClearFilters} showPhase={showPhase} />
    </MemoryRouter>,
  );
}

describe("MobileCardList", () => {
  beforeEach(() => {
    resetFixtureCounter();
    mockNavigate.mockClear();
  });

  it("shows empty state message when rows is empty", () => {
    renderMobileCardList({ rows: [] });
    expect(screen.getByText("No tasks match your filters.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
  });

  it("calls onClearFilters when Clear filters button is clicked", () => {
    const onClearFilters = vi.fn();
    renderMobileCardList({ rows: [], onClearFilters });
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onClearFilters).toHaveBeenCalledOnce();
  });

  it("renders task id and title in card", () => {
    const task = createTask({ id: "042", title: "Build the thing" });
    renderMobileCardList({ rows: [createMockRow(task)] });
    expect(screen.getByText("042")).toBeInTheDocument();
    expect(screen.getByText("Build the thing")).toBeInTheDocument();
  });

  it("renders StatusBadge for each task", () => {
    const task = createTask({ status: "in-progress" });
    renderMobileCardList({ rows: [createMockRow(task)] });
    expect(screen.getByTestId("status-badge")).toHaveTextContent("in-progress");
  });

  it("renders PriorityBadge when task has priority", () => {
    const task = createTask({ priority: "high" });
    renderMobileCardList({ rows: [createMockRow(task)] });
    expect(screen.getByTestId("priority-badge")).toHaveTextContent("high");
  });

  it("does not render PriorityBadge when task priority is empty", () => {
    const task = createTask({ priority: "" });
    renderMobileCardList({ rows: [createMockRow(task)] });
    expect(screen.queryByTestId("priority-badge")).not.toBeInTheDocument();
  });

  it("renders PhaseBadge when showPhase=true and task has phase", () => {
    const task = createTask({ phase: "alpha" });
    renderMobileCardList({ rows: [createMockRow(task)], showPhase: true });
    expect(screen.getByTestId("phase-badge")).toHaveTextContent("alpha");
  });

  it("hides PhaseBadge when showPhase=false even if task has phase", () => {
    const task = createTask({ phase: "alpha" });
    renderMobileCardList({ rows: [createMockRow(task)], showPhase: false });
    expect(screen.queryByTestId("phase-badge")).not.toBeInTheDocument();
  });

  it("hides PhaseBadge when showPhase=true but task.phase is empty", () => {
    const task = createTask({ phase: "" });
    renderMobileCardList({ rows: [createMockRow(task)], showPhase: true });
    expect(screen.queryByTestId("phase-badge")).not.toBeInTheDocument();
  });

  it("renders a link to the task detail page", () => {
    const task = createTask({ id: "099" });
    renderMobileCardList({ rows: [createMockRow(task)] });
    const link = screen.getByRole("listitem");
    expect(link).toHaveAttribute("href", "/tasks/099");
  });

  it("renders multiple task cards when multiple rows are provided", () => {
    const tasks = [createTask(), createTask(), createTask()];
    renderMobileCardList({ rows: tasks.map(createMockRow) });
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
