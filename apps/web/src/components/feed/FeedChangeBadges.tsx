import type { FeedFieldChange, FeedSubtaskChange } from "../../api/types.ts";

export function FieldChangeBadge({ change }: { change: FeedFieldChange }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px]">
      <span className="font-medium text-gray-600 dark:text-gray-300">
        {change.field}
      </span>
      <span className="text-gray-400 dark:text-gray-500">
        {change.oldValue || "(none)"}
      </span>
      <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
      <span className="text-gray-700 dark:text-gray-200">
        {change.newValue || "(none)"}
      </span>
    </span>
  );
}

export function SubtaskChangeBadge({ change }: { change: FeedSubtaskChange }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
        change.done
          ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
          : "bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
      }`}
    >
      <span>{change.done ? "\u2611" : "\u2610"}</span>
      <span className="truncate max-w-[200px]">{change.text}</span>
    </span>
  );
}
