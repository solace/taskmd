import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useValidate } from "./use-validate.ts";

vi.mock("swr", () => ({
  default: vi.fn((key: string) => ({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn(), key })),
}));

import useSWR from "swr";
const mockUseSWR = vi.mocked(useSWR);

describe("useValidate", () => {
  it("calls /api/validate with no params by default", () => {
    renderHook(() => useValidate());
    expect(mockUseSWR).toHaveBeenCalledWith("/api/validate", expect.any(Function));
  });

  it("includes phase param", () => {
    renderHook(() => useValidate("mvp"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/validate?phase=mvp", expect.any(Function));
  });

  it("includes project param", () => {
    renderHook(() => useValidate(null, "proj"));
    expect(mockUseSWR).toHaveBeenCalledWith("/api/validate?project=proj", expect.any(Function));
  });
});
