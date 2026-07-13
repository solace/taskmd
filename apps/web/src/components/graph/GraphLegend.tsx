import { useState } from "react";

const STATUS_ITEMS = [
  { label: "Pending", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-300 dark:border-yellow-700" },
  { label: "In Progress", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-300 dark:border-blue-700" },
  { label: "In Review", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-300 dark:border-purple-700" },
  { label: "Completed", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-300 dark:border-green-700" },
  { label: "Blocked", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-300 dark:border-red-700" },
  { label: "Cancelled", bg: "bg-gray-50 dark:bg-gray-800", border: "border-gray-300 dark:border-gray-600" },
];

const PRIORITY_ITEMS = [
  { label: "Critical", ring: "0 0 0 2px #ef4444" },
  { label: "High", ring: "0 0 0 1.5px #fb923c" },
];

const EDGE_ITEMS = [
  {
    label: "Depends on",
    svg: (
      <svg width="32" height="12" viewBox="0 0 32 12" aria-hidden="true">
        <line x1="0" y1="6" x2="22" y2="6" stroke="#6b7280" strokeWidth="1.5" />
        <polygon points="22,3 30,6 22,9" fill="#6b7280" />
      </svg>
    ),
  },
  {
    label: "Contains (parent)",
    svg: (
      <svg width="32" height="12" viewBox="0 0 32 12" aria-hidden="true">
        <polygon points="0,6 7,2 14,6 7,10" fill="#6366f1" />
        <line x1="14" y1="6" x2="32" y2="6" stroke="#6366f1" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "See also",
    svg: (
      <svg width="32" height="12" viewBox="0 0 32 12" aria-hidden="true">
        <line
          x1="0" y1="6" x2="22" y2="6"
          stroke="#a855f7" strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <polygon points="22,3 30,6 22,9" fill="#a855f7" />
      </svg>
    ),
  },
  {
    label: "Spawned by",
    svg: (
      <svg width="32" height="12" viewBox="0 0 32 12" aria-hidden="true">
        <line
          x1="0" y1="6" x2="22" y2="6"
          stroke="#8b5cf6" strokeWidth="1.5"
          strokeDasharray="2 3"
        />
        {/* open arrowhead */}
        <polyline points="20,3 28,6 20,9" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const GROUP_ITEMS = [
  {
    label: "Phase",
    swatch: (
      <div className="w-8 h-4 rounded-sm border border-dashed border-indigo-300 bg-indigo-50/40 dark:border-indigo-600 dark:bg-indigo-900/10" />
    ),
  },
  {
    label: "Scope (isolated)",
    swatch: (
      <div className="w-8 h-4 rounded-sm border border-dashed border-teal-300 bg-teal-50/40 dark:border-teal-600 dark:bg-teal-900/10" />
    ),
  },
];

export function GraphLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-3 left-3 z-10">
      {open ? (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm p-3 text-xs space-y-3 w-48 dark:bg-gray-800/95 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-200">Legend</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm leading-none"
              aria-label="Close legend"
            >
              &times;
            </button>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
            {STATUS_ITEMS.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`w-4 h-3 rounded-sm border ${s.bg} ${s.border}`} />
                <span className="text-gray-600 dark:text-gray-300">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Priority</span>
            {PRIORITY_ITEMS.map((p) => (
              <div key={p.label} className="flex items-center gap-2">
                <div
                  className="w-4 h-3 rounded-sm border border-gray-200 dark:border-gray-600"
                  style={{ boxShadow: p.ring }}
                />
                <span className="text-gray-600 dark:text-gray-300">{p.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Edges</span>
            {EDGE_ITEMS.map((e) => (
              <div key={e.label} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 flex items-center justify-center">{e.svg}</div>
                <span className="text-gray-600 dark:text-gray-300">{e.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Groups</span>
            {GROUP_ITEMS.map((g) => (
              <div key={g.label} className="flex items-center gap-2">
                <div className="flex-shrink-0">{g.swatch}</div>
                <span className="text-gray-600 dark:text-gray-300">{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors dark:bg-gray-800/95 dark:border-gray-700 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600"
        >
          Legend
        </button>
      )}
    </div>
  );
}
