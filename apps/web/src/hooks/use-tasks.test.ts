import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

let lastKey: string | undefined;
vi.mock("swr", () => ({
  default: (key: string, _fetcher: unknown) => {
    lastKey = key;
    return {
      data: [],
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    };
  },
}));

vi.mock("../api/client.ts", () => ({
  fetcher: vi.fn(),
}));

import { useTasks } from "./use-tasks.ts";

describe("useTasks", () => {
  it("calls SWR with /api/tasks when no params", () => {
    renderHook(() => useTasks());
    expect(lastKey).toBe("/api/tasks");
  });

  it("includes phase in query string", () => {
    renderHook(() => useTasks("web-ui"));
    expect(lastKey).toBe("/api/tasks?phase=web-ui");
  });

  it("includes project in query string", () => {
    renderHook(() => useTasks(null, "/my/project"));
    expect(lastKey).toBe("/api/tasks?project=%2Fmy%2Fproject");
  });

  it("includes both phase and project in query string", () => {
    renderHook(() => useTasks("web-ui", "/my/project"));
    expect(lastKey).toBe("/api/tasks?phase=web-ui&project=%2Fmy%2Fproject");
  });
});
