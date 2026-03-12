import useSWR from "swr";
import { fetcher } from "../api/client.ts";
import type { BoardGroup } from "../api/types.ts";

export function useBoard(groupBy: string = "status", phase?: string | null) {
  const params = new URLSearchParams();
  params.set("groupBy", groupBy);
  if (phase) params.set("phase", phase);
  return useSWR<BoardGroup[]>(`/api/board?${params}`, fetcher);
}
