import { useValidate } from "../hooks/use-validate.ts";
import { usePhase } from "../hooks/use-phase.tsx";
import { useProject } from "../hooks/use-project.ts";
import { ValidateView } from "../components/validate/ValidateView.tsx";
import { LoadingState } from "../components/shared/LoadingState.tsx";
import { ErrorState } from "../components/shared/ErrorState.tsx";

export function ValidatePage() {
  const { phase } = usePhase();
  const { project } = useProject();
  const { data, error, isLoading, mutate } = useValidate(phase, project);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={() => mutate()} />;
  if (!data) return null;

  return <ValidateView result={data} />;
}
