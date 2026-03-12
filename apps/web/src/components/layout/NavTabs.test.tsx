import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../hooks/use-config.ts", () => ({
  useConfig: vi.fn(),
}));

import { useConfig } from "../../hooks/use-config.ts";
import { DesktopNav, MobileMenu } from "./NavTabs.tsx";

const mockUseConfig = vi.mocked(useConfig);

const baseTabLabels = ["Tasks", "Next Up", "Board", "Tracks", "Graph", "Stats", "Validate"];

describe("DesktopNav", () => {
  function renderDesktopNav(onSearchOpen = vi.fn()) {
    return {
      onSearchOpen,
      ...render(
        <MemoryRouter initialEntries={["/tasks"]}>
          <DesktopNav onSearchOpen={onSearchOpen} />
        </MemoryRouter>,
      ),
    };
  }

  it("renders all 7 navigation tabs when no phases configured", () => {
    mockUseConfig.mockReturnValue({ phases: [], readonly: false, version: "1.0" });
    renderDesktopNav();
    for (const label of baseTabLabels) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(screen.queryByRole("link", { name: "Phases" })).not.toBeInTheDocument();
  });

  it("renders Phases tab when phases are configured", () => {
    mockUseConfig.mockReturnValue({
      phases: [{ id: "p1", name: "Phase 1", description: "" }],
      readonly: false,
      version: "1.0",
    });
    renderDesktopNav();
    expect(screen.getByRole("link", { name: "Phases" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Phases" })).toHaveAttribute("href", "/phases");
  });

  it("renders tabs with correct paths", () => {
    mockUseConfig.mockReturnValue({ phases: [], readonly: false, version: "1.0" });
    renderDesktopNav();
    expect(screen.getByRole("link", { name: "Tasks" })).toHaveAttribute("href", "/tasks");
    expect(screen.getByRole("link", { name: "Next Up" })).toHaveAttribute("href", "/next");
    expect(screen.getByRole("link", { name: "Board" })).toHaveAttribute("href", "/board");
    expect(screen.getByRole("link", { name: "Graph" })).toHaveAttribute("href", "/graph");
    expect(screen.getByRole("link", { name: "Stats" })).toHaveAttribute("href", "/stats");
    expect(screen.getByRole("link", { name: "Validate" })).toHaveAttribute("href", "/validate");
  });

  it("renders search button with aria-label", () => {
    mockUseConfig.mockReturnValue({ phases: [], readonly: false, version: "1.0" });
    renderDesktopNav();
    expect(screen.getByRole("button", { name: "Search tasks" })).toBeInTheDocument();
  });

  it("calls onSearchOpen when search button is clicked", async () => {
    mockUseConfig.mockReturnValue({ phases: [], readonly: false, version: "1.0" });
    const { onSearchOpen } = renderDesktopNav();
    await userEvent.click(screen.getByRole("button", { name: "Search tasks" }));
    expect(onSearchOpen).toHaveBeenCalledOnce();
  });

  it("renders Docs external link", () => {
    mockUseConfig.mockReturnValue({ phases: [], readonly: false, version: "1.0" });
    renderDesktopNav();
    const docsLink = screen.getByText(/Docs/);
    expect(docsLink).toHaveAttribute("target", "_blank");
    expect(docsLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders GitHub external link with aria-label", () => {
    mockUseConfig.mockReturnValue({ phases: [], readonly: false, version: "1.0" });
    renderDesktopNav();
    const githubLink = screen.getByRole("link", { name: "GitHub repository" });
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("MobileMenu", () => {
  function renderMobileMenu() {
    return render(
      <MemoryRouter initialEntries={["/tasks"]}>
        <MobileMenu />
      </MemoryRouter>,
    );
  }

  it("renders all 7 navigation tabs when no phases configured", () => {
    mockUseConfig.mockReturnValue({ phases: [], readonly: false, version: "1.0" });
    renderMobileMenu();
    for (const label of baseTabLabels) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("renders Phases tab when phases are configured", () => {
    mockUseConfig.mockReturnValue({
      phases: [{ id: "p1", name: "Phase 1", description: "" }],
      readonly: false,
      version: "1.0",
    });
    renderMobileMenu();
    expect(screen.getByRole("link", { name: "Phases" })).toBeInTheDocument();
  });

  it("renders Docs and GitHub external links", () => {
    mockUseConfig.mockReturnValue({ phases: [], readonly: false, version: "1.0" });
    renderMobileMenu();
    expect(screen.getByText(/Docs/)).toBeInTheDocument();
    expect(screen.getByText(/GitHub/)).toBeInTheDocument();
  });
});
