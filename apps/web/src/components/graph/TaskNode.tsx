import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

const STATUS_BG: Record<string, string> = {
  pending: "bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700",
  "in-progress": "bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700",
  "in-review": "bg-purple-50 border-purple-300 dark:bg-purple-900/20 dark:border-purple-700",
  completed: "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700",
  blocked: "bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700",
  cancelled: "bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600",
};

// Priority ring: CSS box-shadow values for inline style (avoids dynamic Tailwind class purging).
const PRIORITY_RING: Record<string, string> = {
  critical: "0 0 0 2px #ef4444",  // red-500
  high: "0 0 0 1.5px #fb923c",    // orange-400
};

interface TaskNodeData {
  label: string;
  status: string;
  priority?: string;
  taskId: string;
  highlighted?: boolean;
  dimmed?: boolean;
  scopeTint?: string;
  touches?: string[];
}

export const TaskNode = memo(function TaskNode({ data }: { data: TaskNodeData }) {
  const bg = STATUS_BG[data.status] ?? "bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600";
  const dim = data.dimmed ? "opacity-40" : "";
  const highlightShadow = data.highlighted ? "0 0 0 2px #3b82f6" : undefined;

  const priorityRing = data.priority ? (PRIORITY_RING[data.priority] ?? undefined) : undefined;
  const boxShadow = highlightShadow ?? priorityRing;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-gray-400 dark:!bg-gray-500 !w-2 !h-2" />
      <div
        className={`relative w-[200px] rounded-md border shadow-sm px-3 py-2 cursor-pointer transition-opacity duration-200 ${bg} ${dim}`}
        style={boxShadow ? { boxShadow } : undefined}
      >
        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{data.taskId}</div>
        <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate" title={data.label}>
          {data.label}
        </div>
        {data.scopeTint && (
          <div
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: data.scopeTint }}
          />
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 dark:!bg-gray-500 !w-2 !h-2" />
    </>
  );
});
