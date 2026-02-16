---
id: "133"
title: "Validate command should scan archived tasks for dependency resolution"
status: completed
priority: medium
effort: small
tags:
  - cli
  - go
  - bug
created: 2026-02-16
---

# Validate command should scan archived tasks for dependency resolution

## Objective

The `taskmd validate` command reports false-positive "dependency references non-existent task" errors when a task depends on a completed task that has been archived to `tasks/archive/`. Since archived tasks are valid completed dependencies, the validator should include them when checking dependency references.

For example, tasks 085 and 086 depend on archived task 082 (`tasks/archive/cli/082-sync-command-foundation.md`), which currently triggers an error even though the dependency is satisfied.

## Tasks

- [ ] Update the validate command's dependency checking to also scan `tasks/archive/` for task IDs
- [ ] Archived tasks should only be used for dependency existence checks, not subjected to full validation themselves
- [ ] Add test: task depending on an archived task should not produce a "non-existent" error
- [ ] Add test: task depending on a truly non-existent task should still produce the error

## Acceptance Criteria

- `taskmd validate` no longer reports false-positive errors for dependencies on archived tasks
- Dependencies referencing truly non-existent tasks still produce errors
- Archived tasks themselves are not validated (no errors for missing optional fields, etc.)
- Existing validation tests continue to pass
