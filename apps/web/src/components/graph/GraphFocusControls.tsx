interface GraphFocusControlsProps {
  focusNodeId: string | null;
  focusDepth: 1 | 2 | 3;
  onDepthChange: (depth: 1 | 2 | 3) => void;
  onExit: () => void;
}

const DEPTHS: (1 | 2 | 3)[] = [1, 2, 3];

export function GraphFocusControls({
  focusNodeId,
  focusDepth,
  onDepthChange,
  onExit,
}: GraphFocusControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {focusNodeId ? (
            <>Focus: <span className="text-gray-600 dark:text-gray-300 font-mono">{focusNodeId}</span></>
          ) : (
            "Click a node to focus"
          )}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 dark:text-gray-500">Depth:</span>
        <div className="flex rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
          {DEPTHS.map((d) => (
            <button
              key={d}
              onClick={() => onDepthChange(d)}
              aria-pressed={focusDepth === d}
              className={[
                "px-2 py-0.5 text-xs border-r last:border-r-0 border-gray-200 dark:border-gray-700 transition-colors",
                focusDepth === d
                  ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "bg-white text-gray-500 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300",
              ].join(" ")}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={onExit}
        className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600 transition-colors"
      >
        Exit focus
      </button>
    </div>
  );
}
