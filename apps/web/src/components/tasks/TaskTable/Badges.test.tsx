import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, PriorityBadge, TypeBadge, PhaseBadge, BlockedStatusBadge } from "./Badges.tsx";
import { STATUS_COLORS, PRIORITY_COLORS, TYPE_COLORS, getPhaseColor } from "./constants.ts";

describe("StatusBadge", () => {
  it.each(Object.keys(STATUS_COLORS))("renders '%s' with correct color classes", (status) => {
    const { container } = render(<StatusBadge status={status} />);
    const badge = container.querySelector("span")!;
    expect(badge).toHaveTextContent(status);
    for (const cls of STATUS_COLORS[status].split(" ")) {
      expect(badge.className).toContain(cls);
    }
  });

  it("falls back to gray for unknown status", () => {
    const { container } = render(<StatusBadge status="unknown" />);
    const badge = container.querySelector("span")!;
    expect(badge).toHaveTextContent("unknown");
    expect(badge.className).toContain("bg-gray-100");
  });
});

describe("PriorityBadge", () => {
  it.each(Object.keys(PRIORITY_COLORS))("renders '%s' with correct color classes", (priority) => {
    const { container } = render(<PriorityBadge priority={priority} />);
    const badge = container.querySelector("span")!;
    expect(badge).toHaveTextContent(priority);
    for (const cls of PRIORITY_COLORS[priority].split(" ")) {
      expect(badge.className).toContain(cls);
    }
  });

  it("falls back to gray for unknown priority", () => {
    const { container } = render(<PriorityBadge priority="unknown" />);
    const badge = container.querySelector("span")!;
    expect(badge.className).toContain("bg-gray-100");
  });
});

describe("TypeBadge", () => {
  it.each(Object.keys(TYPE_COLORS))("renders '%s' with correct color classes", (type) => {
    const { container } = render(<TypeBadge type={type} />);
    const badge = container.querySelector("span")!;
    expect(badge).toHaveTextContent(type);
    for (const cls of TYPE_COLORS[type].split(" ")) {
      expect(badge.className).toContain(cls);
    }
  });

  it("falls back to gray for unknown type", () => {
    const { container } = render(<TypeBadge type="unknown" />);
    const badge = container.querySelector("span")!;
    expect(badge.className).toContain("bg-gray-100");
  });
});

describe("PhaseBadge", () => {
  it("renders the phase name", () => {
    render(<PhaseBadge phase="alpha" />);
    expect(screen.getByText("alpha")).toBeInTheDocument();
  });

  it("applies color classes from getPhaseColor", () => {
    const { container } = render(<PhaseBadge phase="beta" />);
    const badge = container.querySelector("span")!;
    const expectedColor = getPhaseColor("beta");
    for (const cls of expectedColor.split(" ")) {
      expect(badge.className).toContain(cls);
    }
  });

  it("assigns different colors to different phases", () => {
    const color1 = getPhaseColor("alpha");
    const color2 = getPhaseColor("beta");
    const color3 = getPhaseColor("gamma");
    // At least two of the three should differ (hash collision is theoretically possible but unlikely)
    const unique = new Set([color1, color2, color3]);
    expect(unique.size).toBeGreaterThanOrEqual(2);
  });

  it("assigns the same color to the same phase consistently", () => {
    expect(getPhaseColor("release-1")).toBe(getPhaseColor("release-1"));
  });
});

describe("BlockedStatusBadge", () => {
  it("renders Ready badge when dependencies is null", () => {
    render(<BlockedStatusBadge dependencies={null} />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.getByLabelText("Task is ready to work on")).toBeInTheDocument();
  });

  it("renders Ready badge when dependencies is empty array", () => {
    render(<BlockedStatusBadge dependencies={[]} />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("renders Blocked badge with count for single dependency", () => {
    render(<BlockedStatusBadge dependencies={["005"]} />);
    expect(screen.getByText("(1)")).toBeInTheDocument();
    expect(screen.getByText("⚠")).toBeInTheDocument();
  });

  it("renders Blocked badge with count for multiple dependencies", () => {
    render(<BlockedStatusBadge dependencies={["005", "010", "015"]} />);
    expect(screen.getByText("(3)")).toBeInTheDocument();
  });

  it("shows tooltip with blocked-by IDs", () => {
    render(<BlockedStatusBadge dependencies={["005", "010"]} />);
    const badge = screen.getByLabelText("Blocked by: 005, 010");
    expect(badge).toHaveAttribute("title", "Blocked by: 005, 010");
  });

  it("applies green styling for Ready state", () => {
    const { container } = render(<BlockedStatusBadge dependencies={null} />);
    const badge = container.querySelector("span")!;
    expect(badge.className).toContain("bg-green-100");
  });

  it("applies amber styling for Blocked state", () => {
    const { container } = render(<BlockedStatusBadge dependencies={["001"]} />);
    const badge = container.querySelector("span")!;
    expect(badge.className).toContain("bg-amber-100");
  });

  it("shows Ready when all dependencies are completed", () => {
    const statusMap = new Map([["005", "completed"], ["010", "completed"]]);
    render(<BlockedStatusBadge dependencies={["005", "010"]} taskStatusMap={statusMap} />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("shows Blocked only for unmet dependencies", () => {
    const statusMap = new Map([["005", "completed"], ["010", "pending"]]);
    render(<BlockedStatusBadge dependencies={["005", "010"]} taskStatusMap={statusMap} />);
    expect(screen.getByText("(1)")).toBeInTheDocument();
    expect(screen.getByLabelText("Blocked by: 010")).toBeInTheDocument();
  });

  it("treats missing tasks in statusMap as unmet", () => {
    const statusMap = new Map([["005", "completed"]]);
    render(<BlockedStatusBadge dependencies={["005", "999"]} taskStatusMap={statusMap} />);
    expect(screen.getByText("(1)")).toBeInTheDocument();
    expect(screen.getByLabelText("Blocked by: 999")).toBeInTheDocument();
  });
});
