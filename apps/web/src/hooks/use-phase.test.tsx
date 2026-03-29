import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { usePhase } from "./use-phase.tsx";

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe("usePhase", () => {
  it("returns null phase by default", () => {
    const { result } = renderHook(() => usePhase(), { wrapper });
    expect(result.current.phase).toBeNull();
  });

  it("setPhase updates the phase value", () => {
    const { result } = renderHook(() => usePhase(), { wrapper });

    act(() => {
      result.current.setPhase("web-ui");
    });

    expect(result.current.phase).toBe("web-ui");
  });

  it("setPhase with null clears the phase", () => {
    const { result } = renderHook(() => usePhase(), { wrapper });

    act(() => {
      result.current.setPhase("web-ui");
    });
    expect(result.current.phase).toBe("web-ui");

    act(() => {
      result.current.setPhase(null);
    });
    expect(result.current.phase).toBeNull();
  });
});
