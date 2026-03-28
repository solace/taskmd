import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStats } from "./use-stats.ts";

vi.mock("swr", () => ({
  default: vi.fn((key: string) => ({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn(), key })),
}));

import useSWR from "swr";
const mockUseSWR = vi.mocked(useSWR);

describe("useStats", () => {
  it("calls /api/stats with no params by default", () => {
    renderHook(() => useStats());
    expect(mockUseSWR).toHaveBeenCalledWith("/api/stats", expect.any(Function));
  });

  it("includes phase param", () => {
    renderHook(() => useStats("mvp"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/stats?phase=mvp", expect.any(Function));
  });

  it("includes project param", () => {
    renderHook(() => useStats(null, "proj"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/stats?project=proj", expect.any(Function));
  });
});
