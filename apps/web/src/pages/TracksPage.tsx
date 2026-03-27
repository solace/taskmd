import { useState } from "react";
import { useTracks } from "../hooks/use-tracks.ts";
import { usePhase } from "../hooks/use-phase.tsx";
import { useProject } from "../hooks/use-project.ts";
import { TracksView } from "../components/tracks/TracksView.tsx";
import { LoadingState } from "../components/shared/LoadingState.tsx";
import { ErrorState } from "../components/shared/ErrorState.tsx";

export function TracksPage() {
  const [limit, setLimit] = useState(0);
  const { phase } = usePhase();
  const { project } = useProject();
  const { data, error, isLoading, mutate } = useTracks(limit, phase, project);

  if (isLoading) return <LoadingState variant="board" />;
  if (error) return <ErrorState error={error} onRetry={() => mutate()} />;
  if (!data) return null;

  return <TracksView data={data} limit={limit} onLimitChange={setLimit} />;
}
