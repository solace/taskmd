import useSWR from "swr";
import { fetcher } from "../api/client.ts";
import type { SearchResult } from "../api/types.ts";

export function useSearch(query: string, project?: string | null) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (project) params.set("project", project);
  const qs = params.toString();
  return useSWR<SearchResult[]>(
    query ? `/api/search?${qs}` : null,
    fetcher,
    { keepPreviousData: true },
  );
}
