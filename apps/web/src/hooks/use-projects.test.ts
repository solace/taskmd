import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useProjects } from "./use-projects.ts";

vi.mock("swr", () => ({
  default: vi.fn((key: string) => ({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn(), key })),
}));

import useSWR from "swr";
const mockUseSWR = vi.mocked(useSWR);

describe("useProjects", () => {
  it("calls /api/projects with revalidateOnFocus disabled", () => {
    renderHook(() => useProjects());
    expect(mockUseSWR).toHaveBeenCalledWith("/api/projects", expect.any(Function), expect.objectContaining({ revalidateOnFocus: false }));
  });
});
