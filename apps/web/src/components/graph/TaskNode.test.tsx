import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("@xyflow/react", () => ({
  Handle: ({ type, position }: { type: string; position: string }) => (
    <div data-testid={`handle-${type}`} data-position={position} />
  ),
  Position: { Top: "top", Bottom: "bottom" },
  memo: (fn: unknown) => fn,
}));

import { TaskNode } from "./TaskNode.tsx";

describe("TaskNode", () => {
  it("renders task ID and label", () => {
    render(
      <TaskNode
        data={{ taskId: "042", label: "Implement feature", status: "pending" }}
      />,
    );

    expect(screen.getByText("042")).toBeInTheDocument();
    expect(screen.getByText("Implement feature")).toBeInTheDocument();
  });

  it("renders target and source handles", () => {
    render(
      <TaskNode
        data={{ taskId: "001", label: "Task", status: "pending" }}
      />,
    );

    const target = screen.getByTestId("handle-target");
    const source = screen.getByTestId("handle-source");

    expect(target).toHaveAttribute("data-position", "top");
    expect(source).toHaveAttribute("data-position", "bottom");
  });

  it("applies highlight ring when highlighted", () => {
    const { container } = render(
      <TaskNode
        data={{ taskId: "001", label: "Task", status: "pending", highlighted: true }}
      />,
    );

    const node = container.querySelector(".relative");
    expect(node).toHaveStyle({ boxShadow: "0 0 0 2px #3b82f6" });
  });

  it("applies dimmed opacity when dimmed", () => {
    const { container } = render(
      <TaskNode
        data={{ taskId: "001", label: "Task", status: "pending", dimmed: true }}
      />,
    );

    const node = container.querySelector(".opacity-40");
    expect(node).toBeInTheDocument();
  });

  it("shows priority ring for critical priority", () => {
    const { container } = render(
      <TaskNode
        data={{ taskId: "001", label: "Task", status: "pending", priority: "critical" }}
      />,
    );

    const node = container.querySelector(".relative");
    expect(node).toHaveStyle({ boxShadow: "0 0 0 2px #ef4444" });
  });
});
