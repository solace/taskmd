export const STATUSES = ["pending", "in-progress", "completed", "blocked", "cancelled"];
export const PRIORITIES = ["critical", "high", "medium", "low"];
export const EFFORTS = ["small", "medium", "large"];
export const TYPES = ["feature", "bug", "improvement", "chore", "docs"];

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 font-medium ring-1 ring-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:ring-yellow-700",
  "in-progress": "bg-blue-100 text-blue-800 font-medium ring-1 ring-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-700",
  completed: "bg-green-100 text-green-800 font-medium ring-1 ring-green-300 dark:bg-green-900/30 dark:text-green-300 dark:ring-green-700",
  blocked: "bg-red-100 text-red-800 font-medium ring-1 ring-red-300 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-700",
  cancelled: "bg-gray-100 text-gray-600 font-medium ring-1 ring-gray-300 dark:bg-gray-700/50 dark:text-gray-400 dark:ring-gray-600",
};

export const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-600 font-medium ring-1 ring-red-300 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-700",
  high: "bg-orange-100 text-orange-600 font-medium ring-1 ring-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:ring-orange-700",
  medium: "bg-indigo-100 text-indigo-600 font-medium ring-1 ring-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400 dark:ring-indigo-700",
  low: "bg-sky-50 text-sky-500 font-medium ring-1 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:ring-sky-700",
};

export const EFFORT_COLORS: Record<string, string> = {
  small: "bg-emerald-100 text-emerald-700 font-medium ring-1 ring-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-700",
  medium: "bg-amber-100 text-amber-700 font-medium ring-1 ring-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-700",
  large: "bg-purple-100 text-purple-700 font-medium ring-1 ring-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:ring-purple-700",
};

export const TYPE_COLORS: Record<string, string> = {
  feature: "bg-violet-100 text-violet-700 font-medium ring-1 ring-violet-300 dark:bg-violet-900/30 dark:text-violet-400 dark:ring-violet-700",
  bug: "bg-red-100 text-red-700 font-medium ring-1 ring-red-300 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-700",
  improvement: "bg-cyan-100 text-cyan-700 font-medium ring-1 ring-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-400 dark:ring-cyan-700",
  chore: "bg-slate-100 text-slate-600 font-medium ring-1 ring-slate-300 dark:bg-slate-900/30 dark:text-slate-400 dark:ring-slate-600",
  docs: "bg-indigo-100 text-indigo-700 font-medium ring-1 ring-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400 dark:ring-indigo-700",
};
