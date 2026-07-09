import { SCOPE_PALETTE } from "./graph-colors.ts";

interface GraphColorByProps {
  scopes: string[];
  colorBy: string | null;
  onColorByChange: (scope: string | null) => void;
}

export function GraphColorBy({ scopes, colorBy, onColorByChange }: GraphColorByProps) {
  if (scopes.length === 0) return null;

  const sorted = [...scopes].sort();

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400 dark:text-gray-500">Color by:</span>
      <div className="relative">
        <select
          value={colorBy ?? ""}
          onChange={(e) => onColorByChange(e.target.value || null)}
          className="appearance-none text-xs border rounded px-2 py-1 pr-5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400"
        >
          <option value="">None</option>
          {sorted.map((scope) => (
            <option key={scope} value={scope}>
              {scope}
            </option>
          ))}
        </select>
        {colorBy && (
          <span
            className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{ backgroundColor: SCOPE_PALETTE[sorted.indexOf(colorBy) % SCOPE_PALETTE.length] }}
          />
        )}
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▾</span>
      </div>
    </div>
  );
}
