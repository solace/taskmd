import { Link } from "react-router-dom";
import type { Row } from "@tanstack/react-table";
import type { Task } from "../../../api/types.ts";
import { StatusBadge, PriorityBadge } from "./Badges.tsx";

interface MobileCardListProps {
  rows: Row<Task>[];
  onClearFilters: () => void;
}

export function MobileCardList({ rows, onClearFilters }: MobileCardListProps) {
  return (
    <div className="sm:hidden space-y-2">
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          No tasks match your filters.{" "}
          <button
            onClick={onClearFilters}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Clear filters
          </button>
        </p>
      ) : (
        rows.map((row) => {
          const task = row.original;
          return (
            <Link
              key={row.id}
              to={`/tasks/${task.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-3 active:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:active:bg-gray-700"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-xs text-gray-400">{task.id}</span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={task.status} />
                  {task.priority && <PriorityBadge priority={task.priority} />}
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                {task.title}
              </p>
            </Link>
          );
        })
      )}
    </div>
  );
}
