import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

let mockKey: string | undefined;
vi.mock("swr", () => ({
  default: (key: string, _fetcher: unknown, options?: any) => {
    mockKey = key;
    return {
      data: options?.fallbackData ?? undefined,
    };
  },
}));

vi.mock("../api/client.ts", () => ({
  fetcher: vi.fn(),
}));

import { useConfig } from "./use-config.ts";

describe("useConfig", () => {
  it("calls SWR with /api/config when no project", () => {
    renderHook(() => useConfig());
    expect(mockKey).toBe("/api/config");
  });

  it("includes project in query string", () => {
    renderHook(() => useConfig("myproject"));
    expect(mockKey).toBe("/api/config?project=myproject");
  });

  it("returns defaults when data is undefined", () => {
    const { result } = renderHook(() => useConfig());
    expect(result.current.readonly).toBe(false);
    expect(result.current.version).toBe("");
    expect(result.current.phases).toEqual([]);
  });
});
