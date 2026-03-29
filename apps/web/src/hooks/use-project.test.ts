import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProject } from "./use-project.ts";

beforeEach(() => {
  localStorage.clear();
});

describe("useProject", () => {
  it("returns null when no project is stored", () => {
    const { result } = renderHook(() => useProject());
    expect(result.current.project).toBeNull();
  });

  it("setProject stores and returns the project", () => {
    const { result } = renderHook(() => useProject());

    act(() => {
      result.current.setProject("/path/to/project");
    });

    expect(result.current.project).toBe("/path/to/project");
    expect(localStorage.getItem("taskmd:selected-project")).toBe("/path/to/project");
  });

  it("setProject with null clears the project", () => {
    localStorage.setItem("taskmd:selected-project", "/some/project");
    const { result } = renderHook(() => useProject());
    expect(result.current.project).toBe("/some/project");

    act(() => {
      result.current.setProject(null);
    });

    expect(result.current.project).toBeNull();
    expect(localStorage.getItem("taskmd:selected-project")).toBeNull();
  });

  it("notifies multiple hook instances when project changes", () => {
    const { result: result1 } = renderHook(() => useProject());
    const { result: result2 } = renderHook(() => useProject());

    act(() => {
      result1.current.setProject("/new/project");
    });

    expect(result2.current.project).toBe("/new/project");
  });
});
