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
}

export function useConfig() {
  const { data } = useSWR<AppConfig>("/api/config", fetcher, {
    revalidateOnFocus: false,
  });
  return {
    readonly: data?.readonly ?? false,
    version: data?.version ?? "",
    phases: data?.phases ?? [],
  };
}
