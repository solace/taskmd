import { useConfig } from "../hooks/use-config.ts";
import { useProject } from "../hooks/use-project.ts";
import { useTasks } from "../hooks/use-tasks.ts";
import { LoadingState } from "../components/shared/LoadingState.tsx";
import { ErrorState } from "../components/shared/ErrorState.tsx";
import { PhasesView } from "../components/phases/PhasesView.tsx";

export function PhasesPage() {
  const { project } = useProject();
  const { phases } = useConfig(project);
  const { data: tasks, error, isLoading, mutate } = useTasks(undefined, project);

  if (isLoading) return <LoadingState variant="cards" />;
  if (error) return <ErrorState error={error} onRetry={() => mutate()} />;
  if (!tasks) return null;

  return <PhasesView phases={phases} tasks={tasks} />;
}
