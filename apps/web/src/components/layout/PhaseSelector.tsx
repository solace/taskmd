import { useMemo } from "react";
import { useConfig, type PhaseInfo } from "../../hooks/use-config.ts";
import { usePhase } from "../../hooks/use-phase.tsx";
import { useTasks } from "../../hooks/use-tasks.ts";

export function PhaseSelector() {
  const { phases } = useConfig();
  const { phase, setPhase } = usePhase();
  const { data: tasks } = useTasks();

  const phaseCounts = useMemo(() => {
    if (!tasks) return new Map<string, number>();
    const counts = new Map<string, number>();
    for (const task of tasks) {
      if (task.phase) {
        counts.set(task.phase, (counts.get(task.phase) ?? 0) + 1);
      }
    }
    return counts;
  }, [tasks]);

  if (phases.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="phase-selector"
        className="text-xs font-medium text-gray-500 dark:text-gray-400"
      >
        Phase:
      </label>
      <select
        id="phase-selector"
        value={phase ?? ""}
        onChange={(e) => setPhase(e.target.value || null)}
        className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
      >
        <option value="">All ({tasks?.length ?? 0})</option>
        {phases.map((p: PhaseInfo) => (
          <option key={p.id} value={p.id}>
            {p.name} ({phaseCounts.get(p.id) ?? 0})
          </option>
        ))}
      </select>
    </div>
  );
}
