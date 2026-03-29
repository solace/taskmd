import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TaskDetailPage } from "./TaskDetailPage.tsx";
import { ApiRequestError } from "../api/client.ts";
import type { Task } from "../api/types.ts";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "042",
    title: "Test task",
    status: "pending",
    priority: "high",
    effort: "medium",
    type: "feature",
    dependencies: null,
    tags: ["backend"],
    phase: "mvp",
    group: "cli",
    owner: "",
    parent: "",
    created: "2026-01-01",
    body: "Task body content",
    file_path: "tasks/042-test.md",
    ...overrides,
  };
}

let mockTask: Task | undefined = makeTask();
let mockError: Error | undefined;
let mockLoading = false;
const mockMutate = vi.fn();
const mockUpdateTask = vi.fn();

vi.mock("../hooks/use-task-detail.ts", () => ({
  useTaskDetail: () => ({
    data: mockTask,
    error: mockError,
    isLoading: mockLoading,
    mutate: mockMutate,
  }),
}));

let mockWorklogData: import("../api/types.ts").WorklogEntry[] | undefined;

vi.mock("../hooks/use-worklog.ts", () => ({
  useWorklog: () => ({
    data: mockWorklogData,
  }),
}));

let mockReadonly = false;

vi.mock("../hooks/use-config.ts", () => ({
  useConfig: () => ({ readonly: mockReadonly }),
}));

vi.mock("../hooks/use-project.ts", () => ({
  useProject: () => ({ project: null }),
}));

vi.mock("../api/client.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/client.ts")>();
  return {
    ...actual,
    updateTask: (...args: unknown[]) => mockUpdateTask(...args),
  };
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/tasks/042"]}>
      <Routes>
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("TaskDetailPage", () => {
  beforeEach(() => {
    mockTask = makeTask();
    mockError = undefined;
    mockLoading = false;
    mockMutate.mockReset();
    mockUpdateTask.mockReset();
    mockWorklogData = undefined;
    mockReadonly = false;
  });

  it("renders task details", () => {
    renderPage();
    expect(screen.getByText("Test task")).toBeInTheDocument();
    expect(screen.getByText("042")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("shows Edit button when not readonly", () => {
    renderPage();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("shows task not found when task is undefined", () => {
    mockTask = undefined;
    renderPage();
    expect(screen.getByText(/Task not found/)).toBeInTheDocument();
  });

  describe("edit flow", () => {
    it("enters edit mode when Edit is clicked", async () => {
      renderPage();
      await userEvent.click(screen.getByText("Edit"));
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("save handler calls updateTask and mutate on success", async () => {
      const updatedTask = makeTask({ title: "Updated title" });
      mockUpdateTask.mockResolvedValueOnce(updatedTask);

      renderPage();
      await userEvent.click(screen.getByText("Edit"));

      const titleInput = screen.getByDisplayValue("Test task");
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, "Updated title");

      await userEvent.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith("042", { title: "Updated title" });
      });
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(updatedTask, false);
      });
    });

    it("displays ApiRequestError with details", async () => {
      mockUpdateTask.mockRejectedValueOnce(
        new ApiRequestError("Validation failed", ["title is required", "status is invalid"]),
      );

      renderPage();
      await userEvent.click(screen.getByText("Edit"));

      const titleInput = screen.getByDisplayValue("Test task");
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, "X");

      await userEvent.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => {
        expect(screen.getByText("Validation failed: title is required, status is invalid")).toBeInTheDocument();
      });
    });

    it("displays ApiRequestError without details", async () => {
      mockUpdateTask.mockRejectedValueOnce(
        new ApiRequestError("Server error"),
      );

      renderPage();
      await userEvent.click(screen.getByText("Edit"));

      const titleInput = screen.getByDisplayValue("Test task");
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, "Y");

      await userEvent.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => {
        expect(screen.getByText("Server error")).toBeInTheDocument();
      });
    });

    it("displays generic error for non-ApiRequestError", async () => {
      mockUpdateTask.mockRejectedValueOnce(new Error("boom"));

      renderPage();
      await userEvent.click(screen.getByText("Edit"));

      const titleInput = screen.getByDisplayValue("Test task");
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, "Z");

      await userEvent.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => {
        expect(screen.getByText("An unexpected error occurred.")).toBeInTheDocument();
      });
    });

    it("Escape key cancels editing and clears error", async () => {
      mockUpdateTask.mockRejectedValueOnce(new ApiRequestError("Err"));

      renderPage();
      await userEvent.click(screen.getByText("Edit"));

      // Trigger an error first
      const titleInput = screen.getByDisplayValue("Test task");
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, "W");
      await userEvent.click(screen.getByRole("button", { name: "Save" }));

      await waitFor(() => {
        expect(screen.getByText("Err")).toBeInTheDocument();
      });

      // Click Edit again to re-enter edit mode (save exited but error triggered)
      // Actually the error keeps edit mode open — let's press Escape
      await userEvent.keyboard("{Escape}");

      // Should exit edit mode — Edit button should reappear
      await waitFor(() => {
        expect(screen.getByText("Edit")).toBeInTheDocument();
      });
      // Error should be cleared
      expect(screen.queryByText("Err")).not.toBeInTheDocument();
    });
  });

  it("hides Edit button when readonly is true", () => {
    mockReadonly = true;
    renderPage();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockLoading = true;
    mockTask = undefined;
    const { container } = renderPage();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows error state with retry", () => {
    mockError = new Error("Network error");
    mockTask = undefined;
    renderPage();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Retry"));
    expect(mockMutate).toHaveBeenCalled();
  });

  it("renders task dependencies as links", () => {
    mockTask = makeTask({ dependencies: ["010", "020"] });
    renderPage();
    expect(screen.getByText("Dependencies")).toBeInTheDocument();
    const depLinks = screen.getAllByText(/^0[12]0$/);
    expect(depLinks).toHaveLength(2);
    expect(depLinks[0].closest("a")).toHaveAttribute("href", "/tasks/010");
    expect(depLinks[1].closest("a")).toHaveAttribute("href", "/tasks/020");
  });

  it("does not render dependencies section when empty", () => {
    mockTask = makeTask({ dependencies: null });
    renderPage();
    expect(screen.queryByText("Dependencies")).not.toBeInTheDocument();
  });

  it("renders task tags as links", () => {
    mockTask = makeTask({ tags: ["backend", "api"] });
    renderPage();
    expect(screen.getByText("Tags")).toBeInTheDocument();
    expect(screen.getByText("backend")).toBeInTheDocument();
    expect(screen.getByText("api")).toBeInTheDocument();
  });

  it("does not render tags section when empty", () => {
    mockTask = makeTask({ tags: null });
    renderPage();
    expect(screen.queryByText("Tags")).not.toBeInTheDocument();
  });

  it("renders task body as markdown", () => {
    mockTask = makeTask({ body: "**Bold text** content" });
    renderPage();
    expect(screen.getByText("Bold text")).toBeInTheDocument();
  });

  it("does not render body section when empty", () => {
    mockTask = makeTask({ body: "" });
    const { container } = renderPage();
    expect(container.querySelector(".prose")).not.toBeInTheDocument();
  });

  it("renders file_path when present", () => {
    mockTask = makeTask({ file_path: "tasks/042-test.md" });
    renderPage();
    expect(screen.getByText("tasks/042-test.md")).toBeInTheDocument();
  });

  it("renders parent link when present", () => {
    mockTask = makeTask({ parent: "001" });
    renderPage();
    expect(screen.getByText("Parent")).toBeInTheDocument();
    const parentLink = screen.getByText("001");
    expect(parentLink.closest("a")).toHaveAttribute("href", "/tasks/001");
  });

  it("renders effort, phase, owner, group, created fields", () => {
    mockTask = makeTask({ effort: "large", phase: "mvp", owner: "alice", group: "web", created: "2026-03-01" });
    renderPage();
    expect(screen.getByText("large")).toBeInTheDocument();
    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("web")).toBeInTheDocument();
    expect(screen.getByText("2026-03-01")).toBeInTheDocument();
  });

  it("renders worklog section when entries exist", () => {
    mockWorklogData = [
      { timestamp: "2026-01-15T10:30:00Z", content: "Started work" },
    ];
    renderPage();
    expect(screen.getByText("Started work")).toBeInTheDocument();
  });
});
