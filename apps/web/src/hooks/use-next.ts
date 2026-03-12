import useSWR from "swr";
import { fetcher } from "../api/client.ts";
import type { Recommendation } from "../api/types.ts";

export function useNext(limit: number = 5, group?: string, phase?: string | null) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (group) {
    params.set("filter", `group=${group}`);
  }
  if (phase) params.set("phase", phase);
  return useSWR<Recommendation[]>(`/api/next?${params}`, fetcher);
}
