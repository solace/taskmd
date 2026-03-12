import { useStats } from "../hooks/use-stats.ts";
import { usePhase } from "../hooks/use-phase.tsx";
import { StatsView } from "../components/stats/StatsView.tsx";
import { LoadingState } from "../components/shared/LoadingState.tsx";
import { ErrorState } from "../components/shared/ErrorState.tsx";

export function StatsPage() {
  const { phase } = usePhase();
  const { data, error, isLoading, mutate } = useStats(phase);

  if (isLoading) return <LoadingState variant="cards" />;
  if (error) return <ErrorState error={error} onRetry={() => mutate()} />;
  if (!data) return null;

  if (data.total_tasks === 0) {
    return (
      <p className="text-sm text-gray-500 py-8 text-center">
        No tasks found to show statistics.
      </p>
    );
  }

  return <StatsView stats={data} />;
}
