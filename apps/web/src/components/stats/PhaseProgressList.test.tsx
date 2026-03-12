import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PhaseProgressList } from "./PhaseProgressList.tsx";
import type { PhaseProgress } from "./PhaseProgressBar.tsx";

describe("PhaseProgressList", () => {
  it("renders nothing when phases array is empty", () => {
    const { container } = render(<PhaseProgressList phases={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders heading and a bar for each phase", () => {
    const phases: PhaseProgress[] = [
      { id: "alpha", name: "Alpha", total: 10, completed: 7 },
      { id: "beta", name: "Beta", total: 5, completed: 0 },
    ];
    render(<PhaseProgressList phases={phases} />);

    expect(screen.getByText("Phase Progress")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("7 / 10 tasks (70%)")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("0 / 5 tasks (0%)")).toBeInTheDocument();
  });

  it("shows phases with zero tasks as empty bars", () => {
    const phases: PhaseProgress[] = [
      { id: "empty", name: "Empty Phase", total: 0, completed: 0 },
    ];
    render(<PhaseProgressList phases={phases} />);
    expect(screen.getByText("Empty Phase")).toBeInTheDocument();
    expect(screen.getByText("0 / 0 tasks (0%)")).toBeInTheDocument();
  });
});
