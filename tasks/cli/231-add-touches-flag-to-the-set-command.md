---
title: "Add --touches flag to the set command"
id: "231"
status: pending
priority: medium
effort: small
type: feature
tags: ["cli", "set"]
created: "2026-02-28"
---

# Add --touches flag to the set command

## Objective

Allow users to set or modify the `touches` frontmatter field via `taskmd set`, following the same patterns as existing array flags like `--add-tag`/`--remove-tag`. This enables managing scope identifiers from the command line without manually editing task files.

## Tasks

- [ ] Add `--add-touches` repeatable string flag to the set command (appends scope identifiers)
- [ ] Add `--remove-touches` repeatable string flag to the set command (removes scope identifiers)
- [ ] Implement the frontmatter update logic for the `touches` array (deduplicate, preserve order)
- [ ] Support `--dry-run` for touches changes
- [ ] Add tests covering add, remove, deduplication, and edge cases (empty array, removing non-existent value)
- [ ] Update set command help text with `--add-touches`/`--remove-touches` examples

## Acceptance Criteria

- `taskmd set <id> --add-touches cli/graph --add-touches cli/output` adds scope identifiers to the `touches` array
- `taskmd set <id> --remove-touches cli/graph` removes the specified scope identifier
- Duplicate values are not added
- Removing a non-existent value is a no-op (no error)
- `--dry-run` previews touches changes without writing
- Existing set command tests continue to pass
