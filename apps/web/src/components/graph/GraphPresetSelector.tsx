import type { Preset } from "./hooks/useGraphState.ts";

const PRESETS: { value: Preset; label: string }[] = [
  { value: "default",    label: "Default" },
  { value: "deps-only",  label: "Deps only" },
  { value: "provenance", label: "Provenance" },
  { value: "focus",      label: "Focus" },
];

interface GraphPresetSelectorProps {
  preset: Preset;
  onChange: (preset: Preset) => void;
}

export function GraphPresetSelector({ preset, onChange }: GraphPresetSelectorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400 dark:text-gray-500">View:</span>
      <div className="flex rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
        {PRESETS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            aria-pressed={preset === value}
            className={[
              "px-2.5 py-1 text-xs border-r last:border-r-0 border-gray-200 dark:border-gray-700 transition-colors",
              preset === value
                ? "bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/30 dark:text-indigo-300"
                : "bg-white text-gray-500 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
