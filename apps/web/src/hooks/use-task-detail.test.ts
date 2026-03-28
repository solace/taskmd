import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTaskDetail } from "./use-task-detail.ts";

vi.mock("swr", () => ({
  default: vi.fn((key: string | null) => ({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn(), key })),
}));

import useSWR from "swr";
const mockUseSWR = vi.mocked(useSWR);

describe("useTaskDetail", () => {
  it("passes null key when taskId is undefined", () => {
    renderHook(() => useTaskDetail(undefined));
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function));
  });

  it("builds correct URL for a task ID", () => {
    renderHook(() => useTaskDetail("042"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/tasks/042", expect.any(Function));
  });

  it("includes project param", () => {
    renderHook(() => useTaskDetail("042", "proj"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/tasks/042?project=proj", expect.any(Function));
  });
});
