import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "./use-theme.ts";

beforeEach(() => {
  // Reset DOM and localStorage
  document.documentElement.classList.remove("dark");
  localStorage.clear();
});

afterEach(() => {
  document.documentElement.classList.remove("dark");
  localStorage.clear();
});

describe("useTheme", () => {
  it("returns light theme by default when system prefers light", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
  });

  it("returns dark theme when dark class is on documentElement", () => {
    document.documentElement.classList.add("dark");
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });

  it("toggles from light to dark and persists to localStorage", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");

    act(() => {
      result.current.toggle();
    });

    expect(result.current.theme).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles from dark to light", () => {
    document.documentElement.classList.add("dark");
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");

    act(() => {
      result.current.toggle();
    });

    expect(result.current.theme).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("cleans up matchMedia listener on unmount", () => {
    const removeEventListener = vi.fn();
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener,
    } as unknown as MediaQueryList);

    const { unmount } = renderHook(() => useTheme());
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("responds to OS theme change when no stored preference", () => {
    let changeHandler: (() => void) | undefined;
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      addEventListener: (_event: string, handler: () => void) => {
        changeHandler = handler;
      },
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");

    // Simulate OS switching to dark
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    act(() => {
      changeHandler?.();
    });

    expect(result.current.theme).toBe("dark");
  });

  it("ignores OS theme change when stored preference exists", () => {
    localStorage.setItem("theme", "light");

    let changeHandler: (() => void) | undefined;
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      addEventListener: (_event: string, handler: () => void) => {
        changeHandler = handler;
      },
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");

    // Simulate OS switching to dark - should be ignored
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);

    act(() => {
      changeHandler?.();
    });

    // Should remain light because stored preference overrides
    expect(result.current.theme).toBe("light");
  });
});
