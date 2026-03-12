import useSWR from "swr";
import { fetcher } from "../api/client.ts";
import type { ValidationResult } from "../api/types.ts";

export function useValidate(phase?: string | null) {
  const params = new URLSearchParams();
  if (phase) params.set("phase", phase);
  const qs = params.toString();
  return useSWR<ValidationResult>(`/api/validate${qs ? `?${qs}` : ""}`, fetcher);
}
