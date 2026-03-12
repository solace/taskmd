import useSWR from "swr";
import { fetcher } from "../api/client.ts";
import type { Stats } from "../api/types.ts";

export function useStats(phase?: string | null) {
  const params = new URLSearchParams();
  if (phase) params.set("phase", phase);
  const qs = params.toString();
  return useSWR<Stats>(`/api/stats${qs ? `?${qs}` : ""}`, fetcher);
}
