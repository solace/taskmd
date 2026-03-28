import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useWorklog } from "./use-worklog.ts";

vi.mock("swr", () => ({
  default: vi.fn((key: string | null) => ({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn(), key })),
}));

import useSWR from "swr";
const mockUseSWR = vi.mocked(useSWR);

describe("useWorklog", () => {
  it("passes null key when taskId is undefined", () => {
    renderHook(() => useWorklog(undefined));
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function));
  });

  it("builds correct URL for a task ID", () => {
    renderHook(() => useWorklog("042"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/tasks/042/worklog", expect.any(Function));
  });

  it("includes project param", () => {
    renderHook(() => useWorklog("042", "proj"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/tasks/042/worklog?project=proj", expect.any(Function));
  });
});
