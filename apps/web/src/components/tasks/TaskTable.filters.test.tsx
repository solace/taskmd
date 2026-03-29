import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { Task } from "../../api/types.ts";
import { TaskTable } from "./TaskTable.tsx";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "001",
    title: "Test task",
    status: "pending",
    priority: "medium",
    effort: "small",
    type: "feature",
    dependencies: null,
    tags: null,
    phase: "",
    group: "",
    owner: "",
    parent: "",
    created: "2026-01-01",
    body: "",
    file_path: "tasks/001-test.md",
    ...overrides,
  };
}

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("TaskTable phase toggle", () => {
  it("toggles phase filter when clicking a phase button", async () => {
    const tasksWithPhase = [
      makeTask({ id: "001", status: "pending", phase: "mvp" }),
      makeTask({ id: "002", status: "pending", phase: "v2" }),
      makeTask({ id: "003", status: "pending", phase: "" }),
    ];
    const user = userEvent.setup();
    renderWithRouter(<TaskTable tasks={tasksWithPhase} />);
    expect(screen.getByText("Showing 3 of 3 tasks")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Filters/ }));
    await user.click(screen.getByRole("button", { name: "mvp" }));
    expect(screen.getByText("Showing 1 of 3 tasks")).toBeInTheDocument();
  });
});
