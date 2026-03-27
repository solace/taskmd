import useSWR from "swr";
import { fetcher } from "../api/client.ts";
import type { GraphData } from "../api/types.ts";

export function useGraph(phase?: string | null, project?: string | null) {
  const params = new URLSearchParams();
  if (phase) params.set("phase", phase);
  if (project) params.set("project", project);
  const qs = params.toString();
  return useSWR<GraphData>(`/api/graph${qs ? `?${qs}` : ""}`, fetcher);
}
