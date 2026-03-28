import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTracks } from "./use-tracks.ts";

vi.mock("swr", () => ({
  default: vi.fn((key: string) => ({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn(), key })),
}));

import useSWR from "swr";
const mockUseSWR = vi.mocked(useSWR);

describe("useTracks", () => {
  it("calls /api/tracks with no params by default (limit=0 omitted)", () => {
    renderHook(() => useTracks());
    expect(mockUseSWR).toHaveBeenCalledWith("/api/tracks", expect.any(Function));
  });

  it("includes limit param when > 0", () => {
    renderHook(() => useTracks(3));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/tracks?limit=3", expect.any(Function));
  });

  it("includes phase param", () => {
    renderHook(() => useTracks(0, "mvp"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/tracks?phase=mvp", expect.any(Function));
  });

  it("includes project param", () => {
    renderHook(() => useTracks(0, null, "proj"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/tracks?project=proj", expect.any(Function));
  });
});
