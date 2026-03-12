import { useMemo } from "react";
import { useStats } from "../hooks/use-stats.ts";
import { useTasks } from "../hooks/use-tasks.ts";
import { usePhase } from "../hooks/use-phase.tsx";
import { useConfig } from "../hooks/use-config.ts";
import { StatsView } from "../components/stats/StatsView.tsx";
import { LoadingState } from "../components/shared/LoadingState.tsx";
import { ErrorState } from "../components/shared/ErrorState.tsx";
import type { PhaseProgress } from "../components/stats/PhaseProgressBar.tsx";

export function StatsPage() {
  const { phase } = usePhase();
  const { data, error, isLoading, mutate } = useStats(phase);
  const { data: tasks } = useTasks(phase);
  const { phases: configuredPhases } = useConfig();

  const phaseProgress = useMemo<PhaseProgress[] | undefined>(() => {
    if (configuredPhases.length === 0) return undefined;
    if (!tasks) return undefined;

    return configuredPhases.map((p) => {
      const phaseTasks = tasks.filter((t) => t.phase === p.id);
      return {
        id: p.id,
        name: p.name,
        total: phaseTasks.length,
        completed: phaseTasks.filter((t) => t.status === "completed").length,
      };
    });
  }, [configuredPhases, tasks]);

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

  return <StatsView stats={data} phaseProgress={phaseProgress} />;
}
