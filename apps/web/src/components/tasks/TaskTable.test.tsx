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

const tasks: Task[] = [
  makeTask({ id: "001", status: "pending", priority: "high", type: "feature", tags: ["api"] }),
  makeTask({ id: "002", status: "in-progress", priority: "medium", type: "bug", tags: ["web"] }),
  makeTask({ id: "003", status: "completed", priority: "low", type: "chore", tags: ["docs"] }),
];

function renderWithRouter(
  ui: React.ReactElement,
  { initialEntries = ["/"] }: { initialEntries?: string[] } = {},
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>,
  );
}

describe("TaskTable URL sync", () => {
  it("initializes filters from URL search params", () => {
    renderWithRouter(
      <TaskTable
        tasks={tasks}
        initialStatuses={["pending"]}
        initialPriorities={["high"]}
      />,
    );
    // Only task 001 matches pending + high
    expect(screen.getByText("Showing 1 of 3 tasks")).toBeInTheDocument();
  });

  it("initializes tag filters from props", () => {
    renderWithRouter(
      <TaskTable tasks={tasks} initialTags={["api"]} />,
    );
    // Only task 001 has the "api" tag
    expect(screen.getByText("Showing 1 of 3 tasks")).toBeInTheDocument();
  });

  it("initializes effort filters from props", () => {
    const tasksWithEffort = [
      makeTask({ id: "001", status: "pending", effort: "small" }),
      makeTask({ id: "002", status: "pending", effort: "large" }),
    ];
    renderWithRouter(
      <TaskTable tasks={tasksWithEffort} initialEffort={["small"]} />,
    );
    expect(screen.getByText("Showing 1 of 2 tasks")).toBeInTheDocument();
  });

  it("initializes type filters from props", () => {
    renderWithRouter(
      <TaskTable tasks={tasks} initialTypes={["bug"]} />,
    );
    // Only task 002 has type "bug"
    expect(screen.getByText("Showing 1 of 3 tasks")).toBeInTheDocument();
  });

  it("shows all tasks with no initial filters", () => {
    renderWithRouter(<TaskTable tasks={tasks} />);
    expect(screen.getByText("Showing 3 of 3 tasks")).toBeInTheDocument();
  });
});

describe("TaskTable clearFilters", () => {
  it("shows Clear filters button when filters are active", () => {
    renderWithRouter(
      <TaskTable tasks={tasks} initialStatuses={["pending"]} />,
    );
    expect(screen.getByText("Clear filters")).toBeInTheDocument();
  });

  it("does not show Clear filters button with default filters", () => {
    renderWithRouter(<TaskTable tasks={tasks} />);
    expect(screen.queryByText("Clear filters")).not.toBeInTheDocument();
  });

  it("resets all filters when Clear filters is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <TaskTable tasks={tasks} initialStatuses={["pending"]} />,
    );
    // Initially filtered to 1 task
    expect(screen.getByText("Showing 1 of 3 tasks")).toBeInTheDocument();

    await user.click(screen.getByText("Clear filters"));

    // After clearing, all tasks are shown
    expect(screen.getByText("Showing 3 of 3 tasks")).toBeInTheDocument();
    // Clear filters button should disappear
    expect(screen.queryByText("Clear filters")).not.toBeInTheDocument();
  });
});

describe("TaskTable status toggle", () => {
  it("toggles status filter when clicking a status button", async () => {
    const user = userEvent.setup();
    renderWithRouter(<TaskTable tasks={tasks} />);
    expect(screen.getByText("Showing 3 of 3 tasks")).toBeInTheDocument();

    // Open the filters panel first
    await user.click(screen.getByRole("button", { name: /Filters/ }));

    // Click "pending" to deselect it
    await user.click(screen.getByRole("button", { name: "pending" }));
    // Tasks 002 (in-progress) and 003 (completed) remain
    expect(screen.getByText("Showing 2 of 3 tasks")).toBeInTheDocument();

    // Click "pending" again to re-select it
    await user.click(screen.getByRole("button", { name: "pending" }));
    expect(screen.getByText("Showing 3 of 3 tasks")).toBeInTheDocument();
  });
});

describe("TaskTable priority toggle", () => {
  it("toggles priority filter when clicking a priority button", async () => {
    const user = userEvent.setup();
    renderWithRouter(<TaskTable tasks={tasks} />);

    // Open the filters panel first
    await user.click(screen.getByRole("button", { name: /Filters/ }));

    // Click "high" to deselect it - task 001 has high priority
    await user.click(screen.getByRole("button", { name: "high" }));
    expect(screen.getByText("Showing 2 of 3 tasks")).toBeInTheDocument();
  });
});

describe("TaskTable effort toggle", () => {
  it("toggles effort filter when clicking an effort button", async () => {
    const tasksWithEffort = [
      makeTask({ id: "001", status: "pending", effort: "small" }),
      makeTask({ id: "002", status: "pending", effort: "large" }),
      makeTask({ id: "003", status: "pending", effort: "medium" }),
    ];
    const user = userEvent.setup();
    renderWithRouter(<TaskTable tasks={tasksWithEffort} />);

    await user.click(screen.getByRole("button", { name: /Filters/ }));
    await user.click(screen.getByRole("button", { name: "small" }));
    expect(screen.getByText("Showing 2 of 3 tasks")).toBeInTheDocument();
  });

  it("selects all effort when clicking all button", async () => {
    const tasksWithEffort = [
      makeTask({ id: "001", status: "pending", effort: "small" }),
      makeTask({ id: "002", status: "pending", effort: "large" }),
    ];
    const user = userEvent.setup();
    renderWithRouter(<TaskTable tasks={tasksWithEffort} initialEffort={["small"]} />);
    expect(screen.getByText("Showing 1 of 2 tasks")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Filters/ }));
    // Find the "all" button in the Effort row - it's the third "all" button (Status, Priority, Effort)
    const allButtons = screen.getAllByRole("button", { name: "all" });
    await user.click(allButtons[2]); // Effort row all button
    expect(screen.getByText("Showing 2 of 2 tasks")).toBeInTheDocument();
  });
});

describe("TaskTable type toggle", () => {
  it("toggles type filter when clicking a type button", async () => {
    const user = userEvent.setup();
    renderWithRouter(<TaskTable tasks={tasks} />);

    await user.click(screen.getByRole("button", { name: /Filters/ }));
    await user.click(screen.getByRole("button", { name: "feature" }));
    expect(screen.getByText("Showing 2 of 3 tasks")).toBeInTheDocument();
  });

  it("selects all types when clicking all button", async () => {
    const user = userEvent.setup();
    renderWithRouter(<TaskTable tasks={tasks} initialTypes={["bug"]} />);
    expect(screen.getByText("Showing 1 of 3 tasks")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Filters/ }));
    // Type row all button - it's the 4th "all" button (Status, Priority, Effort, Type)
    const allButtons = screen.getAllByRole("button", { name: "all" });
    await user.click(allButtons[3]); // Type row all button
    expect(screen.getByText("Showing 3 of 3 tasks")).toBeInTheDocument();
  });
});

describe("TaskTable selectAll status and priority", () => {
  it("selects all statuses when clicking all button", async () => {
    const user = userEvent.setup();
    renderWithRouter(<TaskTable tasks={tasks} initialStatuses={["pending"]} />);
    expect(screen.getByText("Showing 1 of 3 tasks")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Filters/ }));
    const allButtons = screen.getAllByRole("button", { name: "all" });
    await user.click(allButtons[0]); // Status row all button
    expect(screen.getByText("Showing 3 of 3 tasks")).toBeInTheDocument();
  });

  it("selects all priorities when clicking all button", async () => {
    const user = userEvent.setup();
    renderWithRouter(<TaskTable tasks={tasks} initialPriorities={["high"]} />);
    expect(screen.getByText("Showing 1 of 3 tasks")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Filters/ }));
    const allButtons = screen.getAllByRole("button", { name: "all" });
    await user.click(allButtons[1]); // Priority row all button
    expect(screen.getByText("Showing 3 of 3 tasks")).toBeInTheDocument();
  });
});

describe("TaskTable global filter", () => {
  it("filters tasks by text input", async () => {
    const user = userEvent.setup();
    renderWithRouter(<TaskTable tasks={tasks} />);
    expect(screen.getByText("Showing 3 of 3 tasks")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Filter tasks...");
    await user.type(input, "001");
    // globalFilter should filter the table
    expect(screen.getByText("Showing 1 of 3 tasks")).toBeInTheDocument();
  });
});

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
    // Phase buttons should appear since tasks have phases
    await user.click(screen.getByRole("button", { name: "mvp" }));
    expect(screen.getByText("Showing 1 of 3 tasks")).toBeInTheDocument();
  });
});
