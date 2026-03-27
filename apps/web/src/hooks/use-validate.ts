import useSWR from "swr";
import { fetcher } from "../api/client.ts";
import type { ValidationResult } from "../api/types.ts";

export function useValidate(phase?: string | null, project?: string | null) {
  const params = new URLSearchParams();
  if (phase) params.set("phase", phase);
  if (project) params.set("project", project);
  const qs = params.toString();
  return useSWR<ValidationResult>(`/api/validate${qs ? `?${qs}` : ""}`, fetcher);
}
