interface GraphOverlayTogglesProps {
  showRelated: boolean;
  showSpawnedBy: boolean;
  onToggleRelated: () => void;
  onToggleSpawnedBy: () => void;
  lodHidden?: boolean;
}

export function GraphOverlayToggles({
  showRelated,
  showSpawnedBy,
  onToggleRelated,
  onToggleSpawnedBy,
  lodHidden,
}: GraphOverlayTogglesProps) {
  const anyActive = showRelated || showSpawnedBy;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400 dark:text-gray-500 mr-0.5">Overlays:</span>
      <OverlayButton active={showRelated} onClick={onToggleRelated} label="Related">
        <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true" className="shrink-0">
          <line x1="0" y1="4" x2="20" y2="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>
      </OverlayButton>
      <OverlayButton active={showSpawnedBy} onClick={onToggleSpawnedBy} label="Spawned by">
        <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true" className="shrink-0">
          <line x1="0" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
          <polyline points="12,1 18,4 12,7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </OverlayButton>
      {lodHidden && anyActive && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500 italic">zoom in to see</span>
      )}
    </div>
  );
}

interface OverlayButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}

function OverlayButton({ active, onClick, label, children }: OverlayButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={[
        "flex items-center gap-1.5 px-2 py-1 rounded text-xs border transition-colors",
        active
          ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300",
      ].join(" ")}
    >
      {children}
      {label}
    </button>
  );
}
