import useSWR from "swr";
import { fetcher } from "../api/client.ts";
import type { GraphData } from "../api/types.ts";

export function useGraph(phase?: string | null) {
  const params = new URLSearchParams();
  if (phase) params.set("phase", phase);
  const qs = params.toString();
  return useSWR<GraphData>(`/api/graph${qs ? `?${qs}` : ""}`, fetcher);
}
