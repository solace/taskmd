import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGraph } from "./use-graph.ts";

vi.mock("swr", () => ({
  default: vi.fn((key: string) => ({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn(), key })),
}));

import useSWR from "swr";
const mockUseSWR = vi.mocked(useSWR);

describe("useGraph", () => {
  it("calls /api/graph with no params by default", () => {
    renderHook(() => useGraph());
    expect(mockUseSWR).toHaveBeenCalledWith("/api/graph", expect.any(Function));
  });

  it("includes phase param", () => {
    renderHook(() => useGraph("mvp"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/graph?phase=mvp", expect.any(Function));
  });

  it("includes project param", () => {
    renderHook(() => useGraph(null, "proj"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/graph?project=proj", expect.any(Function));
  });

  it("includes both phase and project", () => {
    renderHook(() => useGraph("v2", "proj"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/graph?phase=v2&project=proj", expect.any(Function));
  });
});
