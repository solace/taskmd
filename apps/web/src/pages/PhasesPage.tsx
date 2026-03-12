import { useConfig } from "../hooks/use-config.ts";
import { useTasks } from "../hooks/use-tasks.ts";
import { LoadingState } from "../components/shared/LoadingState.tsx";
import { ErrorState } from "../components/shared/ErrorState.tsx";
import { PhasesView } from "../components/phases/PhasesView.tsx";

export function PhasesPage() {
  const { phases } = useConfig();
  const { data: tasks, error, isLoading, mutate } = useTasks();

  if (isLoading) return <LoadingState variant="cards" />;
  if (error) return <ErrorState error={error} onRetry={() => mutate()} />;
  if (!tasks) return null;

  return <PhasesView phases={phases} tasks={tasks} />;
}
