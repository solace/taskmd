/** Required fields that must be present and non-empty. */
export const REQUIRED_FIELDS = ["id", "title"] as const;

/** Enum fields with their allowed values. Empty string is always allowed. */
export const ENUM_FIELDS: Record<string, readonly string[]> = {
  status: ["pending", "in-progress", "completed", "in-review", "blocked", "cancelled"],
  priority: ["low", "medium", "high", "critical"],
  effort: ["small", "medium", "large"],
  type: ["feature", "bug", "improvement", "chore", "docs"],
};

/** Fields that must be arrays of strings when present. */
export const STRING_ARRAY_FIELDS = [
  "dependencies",
  "tags",
  "touches",
  "context",
  "pr",
] as const;

/** Fields that must be plain strings when present. */
export const STRING_FIELDS = [
  "id",
  "title",
  "group",
  "owner",
  "parent",
  "external_id",
] as const;

/** Fields that must be dates in YYYY-MM-DD format. */
export const DATE_FIELDS = ["created"] as const;

/** All known frontmatter field names. */
export const KNOWN_FIELDS = new Set([
  ...REQUIRED_FIELDS,
  ...Object.keys(ENUM_FIELDS),
  ...STRING_ARRAY_FIELDS,
  ...STRING_FIELDS,
  ...DATE_FIELDS,
  "verify",
]);
