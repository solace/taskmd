import { PhaseProgressBar } from "./PhaseProgressBar.tsx";
import type { PhaseProgress } from "./PhaseProgressBar.tsx";

interface PhaseProgressListProps {
  phases: PhaseProgress[];
}

export function PhaseProgressList({ phases }: PhaseProgressListProps) {
  if (phases.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
        Phase Progress
      </h3>
      <div className="space-y-3">
        {phases.map((phase) => (
          <PhaseProgressBar key={phase.id} phase={phase} />
        ))}
      </div>
    </div>
  );
}
