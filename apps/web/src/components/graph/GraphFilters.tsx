import { STATUSES, STATUS_COLORS } from "../tasks/TaskTable/constants.ts";

interface GraphFiltersProps {
  selectedStatuses: Set<string>;
  onToggleStatus: (status: string) => void;
  onClearFilters: () => void;
}

export function GraphFilters({ selectedStatuses, onToggleStatus, onClearFilters }: GraphFiltersProps) {
  const noFilters = selectedStatuses.size === 0;
  const inactiveStyle = "bg-gray-50 border border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-400";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Status:</span>
      <button
        onClick={onClearFilters}
        className={`min-h-[44px] sm:min-h-0 inline-flex items-center px-2.5 py-1 text-xs rounded-full transition-colors duration-150 ${
          noFilters
            ? "bg-gray-200 text-gray-700 font-medium ring-1 ring-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:ring-gray-500"
            : inactiveStyle
        }`}
      >
        all
      </button>
      {STATUSES.map((s) => {
        const active = selectedStatuses.has(s);
        return (
          <button
            key={s}
            onClick={() => onToggleStatus(s)}
            className={`min-h-[44px] sm:min-h-0 inline-flex items-center px-2.5 py-1 text-xs rounded-full transition-colors duration-150 ${
              active ? STATUS_COLORS[s] : inactiveStyle
            }`}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}
