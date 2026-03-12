import useSWR from "swr";
import { fetcher } from "../api/client.ts";
import type { TracksResult } from "../api/types.ts";

export function useTracks(limit: number = 0, phase?: string | null) {
  const params = new URLSearchParams();
  if (limit > 0) params.set("limit", String(limit));
  if (phase) params.set("phase", phase);
  const qs = params.toString();
  return useSWR<TracksResult>(`/api/tracks${qs ? `?${qs}` : ""}`, fetcher);
}
