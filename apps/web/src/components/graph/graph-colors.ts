// Fixed palette for scope tinting — deterministic assignment by alphabetical scope order.
export const SCOPE_PALETTE = [
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#f59e0b", // amber-500
  "#f43f5e", // rose-500
  "#10b981", // emerald-500
  "#0ea5e9", // sky-500
  "#f97316", // orange-500
  "#d946ef", // fuchsia-500
];

/**
 * Returns the hex color for a given scope, based on its alphabetical position
 * within the full set of configured scopes.
 */
export function scopeColor(scope: string, allScopes: string[]): string {
  const sorted = [...allScopes].sort();
  const index = sorted.indexOf(scope);
  if (index === -1) return SCOPE_PALETTE[0];
  return SCOPE_PALETTE[index % SCOPE_PALETTE.length];
}
