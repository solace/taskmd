import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSearch } from "./use-search.ts";

vi.mock("swr", () => ({
  default: vi.fn((key: string | null) => ({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn(), key })),
}));

import useSWR from "swr";
const mockUseSWR = vi.mocked(useSWR);

describe("useSearch", () => {
  it("passes null key when query is empty", () => {
    renderHook(() => useSearch(""));
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.objectContaining({ keepPreviousData: true }));
  });

  it("includes query param when query is provided", () => {
    renderHook(() => useSearch("fix bug"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/search?q=fix+bug", expect.any(Function), expect.objectContaining({ keepPreviousData: true }));
  });

  it("includes project param", () => {
    renderHook(() => useSearch("test", "proj"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/search?q=test&project=proj", expect.any(Function), expect.objectContaining({ keepPreviousData: true }));
  });
});
