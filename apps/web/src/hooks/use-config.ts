import useSWR from "swr";
import { fetcher } from "../api/client.ts";

export interface PhaseInfo {
  id: string;
  name: string;
  description: string;
}

interface AppConfig {
  readonly: boolean;
  version: string;
  phases: PhaseInfo[];
  scopes: string[];
}

declare global {
  interface Window {
    __TASKMD_CONFIG__?: AppConfig;
  }
}

// Read config injected by the Go server into the HTML at build time.
// Available immediately on first render — no async fetch needed for the default config.
const injectedConfig: AppConfig | undefined = window.__TASKMD_CONFIG__;

export function useConfig(project?: string | null) {
  const params = new URLSearchParams();
  if (project) params.set("project", project);
  const qs = params.toString();
  const isDefault = !project;
  const { data } = useSWR<AppConfig>(`/api/config${qs ? `?${qs}` : ""}`, fetcher, {
    revalidateOnFocus: false,
    fallbackData: isDefault ? injectedConfig : undefined,
  });
  return {
    readonly: data?.readonly ?? false,
    version: data?.version ?? "",
    phases: data?.phases ?? [],
    scopes: data?.scopes ?? [],
  };
}
