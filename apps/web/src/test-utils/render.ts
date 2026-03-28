import { render, type RenderOptions } from "@testing-library/react";
import { createElement, type ReactElement } from "react";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  /** Initial URL entries for MemoryRouter. Defaults to ["/"]. */
  initialEntries?: MemoryRouterProps["initialEntries"];
}

/**
 * Renders a component wrapped in MemoryRouter (and any other providers needed).
 *
 * Usage:
 *   const { user } = renderWithProviders(<MyComponent />, { initialEntries: ["/board"] });
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialEntries = ["/"], ...options }: RenderWithProvidersOptions = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(MemoryRouter, { initialEntries }, children);
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}
