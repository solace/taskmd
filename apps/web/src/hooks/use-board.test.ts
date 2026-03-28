import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBoard } from "./use-board.ts";

vi.mock("swr", () => ({
  default: vi.fn((key: string) => ({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn(), key })),
}));

import useSWR from "swr";
const mockUseSWR = vi.mocked(useSWR);

describe("useBoard", () => {
  it("defaults to groupBy=status", () => {
    renderHook(() => useBoard());
    expect(mockUseSWR).toHaveBeenCalledWith("/api/board?groupBy=status", expect.any(Function));
  });

  it("passes custom groupBy", () => {
    renderHook(() => useBoard("priority"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/board?groupBy=priority", expect.any(Function));
  });

  it("includes phase param when provided", () => {
    renderHook(() => useBoard("status", "mvp"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/board?groupBy=status&phase=mvp", expect.any(Function));
  });

  it("includes project param when provided", () => {
    renderHook(() => useBoard("status", null, "my-project"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/board?groupBy=status&project=my-project", expect.any(Function));
  });

  it("includes both phase and project", () => {
    renderHook(() => useBoard("type", "v2", "proj"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/board?groupBy=type&phase=v2&project=proj", expect.any(Function));
  });

  it("omits phase when null", () => {
    renderHook(() => useBoard("status", null));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/board?groupBy=status", expect.any(Function));
  });
});
