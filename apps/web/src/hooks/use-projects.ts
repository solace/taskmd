import useSWR from "swr";
import { fetcher } from "../api/client.ts";

export interface ProjectInfo {
  id: string;
  name: string;
  path: string;
}

export function useProjects() {
  return useSWR<ProjectInfo[]>("/api/projects", fetcher, {
    revalidateOnFocus: false,
  });
}
