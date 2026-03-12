import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PhaseProgressBar } from "./PhaseProgressBar.tsx";
import type { PhaseProgress } from "./PhaseProgressBar.tsx";

function makePhase(overrides: Partial<PhaseProgress> = {}): PhaseProgress {
  return {
    id: "phase-1",
    name: "Phase One",
    total: 10,
    completed: 5,
    ...overrides,
  };
}

describe("PhaseProgressBar", () => {
  it("renders phase name and task count label", () => {
    render(<PhaseProgressBar phase={makePhase()} />);
    expect(screen.getByText("Phase One")).toBeInTheDocument();
    expect(screen.getByText("5 / 10 tasks (50%)")).toBeInTheDocument();
  });

  it("renders 0% for a phase with zero tasks", () => {
    render(<PhaseProgressBar phase={makePhase({ total: 0, completed: 0 })} />);
    expect(screen.getByText("0 / 0 tasks (0%)")).toBeInTheDocument();
  });

  it("renders 100% for fully completed phase", () => {
    render(<PhaseProgressBar phase={makePhase({ total: 8, completed: 8 })} />);
    expect(screen.getByText("8 / 8 tasks (100%)")).toBeInTheDocument();
  });

  it("applies green color for high completion (>=75%)", () => {
    const { container } = render(
      <PhaseProgressBar phase={makePhase({ total: 4, completed: 3 })} />,
    );
    const bar = container.querySelector("[style]");
    expect(bar?.className).toContain("bg-green-500");
    expect(bar?.getAttribute("style")).toBe("width: 75%;");
  });

  it("applies yellow color for mid completion (25-74%)", () => {
    const { container } = render(
      <PhaseProgressBar phase={makePhase({ total: 10, completed: 5 })} />,
    );
    const bar = container.querySelector("[style]");
    expect(bar?.className).toContain("bg-yellow-500");
  });

  it("applies gray color for low completion (<25%)", () => {
    const { container } = render(
      <PhaseProgressBar phase={makePhase({ total: 10, completed: 1 })} />,
    );
    const bar = container.querySelector("[style]");
    expect(bar?.className).toContain("bg-gray-400");
  });

  it("sets bar width proportional to completion", () => {
    const { container } = render(
      <PhaseProgressBar phase={makePhase({ total: 10, completed: 3 })} />,
    );
    const bar = container.querySelector("[style]");
    expect(bar?.getAttribute("style")).toBe("width: 30%;");
  });
});
