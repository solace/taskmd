import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNext } from "./use-next.ts";

vi.mock("swr", () => ({
  default: vi.fn((key: string) => ({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn(), key })),
}));

import useSWR from "swr";
const mockUseSWR = vi.mocked(useSWR);

describe("useNext", () => {
  it("defaults to limit=5 with no group", () => {
    renderHook(() => useNext());
    expect(mockUseSWR).toHaveBeenCalledWith("/api/next?limit=5", expect.any(Function));
  });

  it("passes custom limit", () => {
    renderHook(() => useNext(10));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/next?limit=10", expect.any(Function));
  });

  it("includes filter param for group", () => {
    renderHook(() => useNext(5, "cli"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/next?limit=5&filter=group%3Dcli", expect.any(Function));
  });

  it("includes phase param", () => {
    renderHook(() => useNext(5, undefined, "mvp"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/next?limit=5&phase=mvp", expect.any(Function));
  });

  it("includes project param", () => {
    renderHook(() => useNext(5, undefined, null, "proj"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/next?limit=5&project=proj", expect.any(Function));
  });
});
