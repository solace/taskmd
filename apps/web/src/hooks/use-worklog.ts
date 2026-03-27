import useSWR from "swr";
import { fetcher } from "../api/client.ts";
import type { WorklogEntry } from "../api/types.ts";

export function useWorklog(taskId: string | undefined, project?: string | null) {
  const params = new URLSearchParams();
  if (project) params.set("project", project);
  const qs = params.toString();
  return useSWR<WorklogEntry[]>(
    taskId ? `/api/tasks/${taskId}/worklog${qs ? `?${qs}` : ""}` : null,
    fetcher,
  );
}
