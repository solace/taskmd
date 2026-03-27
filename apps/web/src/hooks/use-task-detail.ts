import useSWR from "swr";
import { fetcher } from "../api/client.ts";
import type { Task } from "../api/types.ts";

export function useTaskDetail(taskId: string | undefined, project?: string | null) {
  const params = new URLSearchParams();
  if (project) params.set("project", project);
  const qs = params.toString();
  return useSWR<Task>(taskId ? `/api/tasks/${taskId}${qs ? `?${qs}` : ""}` : null, fetcher);
}
