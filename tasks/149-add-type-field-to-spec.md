---
id: "149"
title: "Add type field to taskmd specification"
status: completed
priority: medium
effort: medium
tags:
  - spec
  - core
  - cli
created: 2026-02-17
type: chore
---

# Add Type Field to taskmd Specification

## Objective

Add an optional `type` enum field to the frontmatter schema to separate work-type classification from tags. Tags currently do double duty encoding both scope (`cli`, `web`) and work type (`bug`, `feature`). A dedicated `type` field makes filtering, reporting, and agent workflows cleaner.

## Enum Values

| Type          | Meaning                                                          |
| ------------- | ---------------------------------------------------------------- |
| `feature`     | New functionality                                                |
| `bug`         | Incorrect behavior that needs fixing                             |
| `improvement` | Enhancing existing functionality (perf, UX, polish, refactoring) |
| `chore`       | Infrastructure, tooling, CI/CD, maintenance                      |
| `docs`        | Documentation creation or updates                                |

## Tasks

- [x]Add `type` field definition to `docs/taskmd_specification.md`
- [x]Run `make sync-spec` to propagate spec to embedded CLI template and docs site
- [x]Add `Type` field to the Go task model struct
- [x]Update the parser to read `type` from frontmatter
- [x]Add enum validation for `type` (warn on unknown values)
- [x]Update `list` command to support `--type` filter flag
- [x]Update `set` command to support setting `type`
- [x] Update `report` command to include type breakdown
- [x]Display `type` in `get` command output
- [x]Add tests for parsing, validation, and CLI filtering
- [x]Update docs site frontmatter reference page

## Acceptance Criteria

- `type` is optional with no default — omitting it is valid
- Only the five enum values are accepted; unknown values produce a validation warning
- `taskmd list --type bug` filters tasks by type
- `taskmd set --task-id 146 --type feature` sets the type field
- Existing task files without `type` continue to work unchanged
- Spec, embedded template, and docs site are all in sync
