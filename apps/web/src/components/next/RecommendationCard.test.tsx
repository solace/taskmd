import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RecommendationCard } from "./RecommendationCard.tsx";
import { createRecommendation, resetFixtureCounter } from "../../test-utils/fixtures.ts";

function renderCard(
  overrides: Partial<Parameters<typeof createRecommendation>[0]> = {},
  focused = false,
) {
  const rec = createRecommendation(overrides);
  return {
    rec,
    ...render(
      <MemoryRouter>
        <RecommendationCard rec={rec} focused={focused} />
      </MemoryRouter>,
    ),
  };
}

describe("RecommendationCard", () => {
  beforeEach(() => {
    resetFixtureCounter();
  });

  it("renders the rank", () => {
    renderCard({ rank: 3 });
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders the title as a link", () => {
    renderCard({ title: "Fix the bug" });
    const link = screen.getByRole("link", { name: "Fix the bug" });
    expect(link).toBeInTheDocument();
  });

  it("renders the task id", () => {
    renderCard({ id: "042" });
    expect(screen.getByText("042")).toBeInTheDocument();
  });

  it("renders the score", () => {
    renderCard({ score: 72 });
    expect(screen.getByText("72")).toBeInTheDocument();
  });

  it("renders the priority badge", () => {
    renderCard({ priority: "critical" });
    expect(screen.getByText("critical")).toBeInTheDocument();
  });

  it("applies ring-2 class when focused=true", () => {
    const { container } = renderCard({}, true);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("ring-2");
  });

  it("does not apply ring-2 class when focused=false", () => {
    const { container } = renderCard({}, false);
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toContain("ring-2");
  });

  it("shows 'critical path' badge when on_critical_path=true", () => {
    renderCard({ on_critical_path: true });
    expect(screen.getByText("critical path")).toBeInTheDocument();
  });

  it("hides 'critical path' badge when on_critical_path=false", () => {
    renderCard({ on_critical_path: false });
    expect(screen.queryByText("critical path")).not.toBeInTheDocument();
  });

  it("shows 'unblocks N tasks' (plural) when downstream_count > 1", () => {
    renderCard({ downstream_count: 5 });
    expect(screen.getByText(/unblocks 5 tasks/)).toBeInTheDocument();
  });

  it("shows 'unblocks 1 task' (singular) when downstream_count === 1", () => {
    renderCard({ downstream_count: 1 });
    expect(screen.getByText(/unblocks 1 task/)).toBeInTheDocument();
  });

  it("hides unblocks span when downstream_count === 0", () => {
    renderCard({ downstream_count: 0 });
    expect(screen.queryByText(/unblocks/)).not.toBeInTheDocument();
  });

  it("renders each reason as a badge", () => {
    renderCard({ reasons: ["High priority", "No blockers", "Critical path"] });
    expect(screen.getByText("High priority")).toBeInTheDocument();
    expect(screen.getByText("No blockers")).toBeInTheDocument();
    expect(screen.getByText("Critical path")).toBeInTheDocument();
  });

  it("renders no reason badges when reasons is empty", () => {
    renderCard({ reasons: [] });
    // No reason spans should be present
    const reasonBadges = document.querySelectorAll(
      ".bg-gray-100.text-gray-600",
    );
    expect(reasonBadges.length).toBe(0);
  });

  it("link points to /tasks/{id}", () => {
    renderCard({ id: "099", title: "Some task" });
    const link = screen.getByRole("link", { name: "Some task" });
    expect(link).toHaveAttribute("href", "/tasks/099");
  });
});
