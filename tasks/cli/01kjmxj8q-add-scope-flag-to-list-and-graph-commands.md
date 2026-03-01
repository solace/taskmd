---
title: "Add --scope flag to list and graph commands"
id: "01kjmxj8q"
status: completed
priority: medium
type: feature
tags: ["cli", "filtering"]
created: "2026-03-01"
---

# Add --scope flag to list and graph commands

## Objective

Add a `--scope` flag to the `list` and `graph` commands so users can filter tasks by scope, matching the existing behavior in `next` and `tracks` commands. This brings consistent scope-based filtering across all task-viewing commands.

## Tasks

- [ ] Add `--scope` flag to `list` command (`internal/cli/list.go`)
- [ ] Add `--scope` flag to `graph` command (`internal/cli/graph.go`)
- [ ] Reuse existing scope filtering logic (wildcard support, `--exact` flag pattern from `next`)
- [ ] Add tests for `--scope` on `list` command
- [ ] Add tests for `--scope` on `graph` command
- [ ] Add e2e tests covering scope filtering on both commands

## Acceptance Criteria

- `taskmd list --scope cli` filters tasks to only those matching the `cli` scope
- `taskmd graph --scope web` filters the dependency graph to tasks in the `web` scope
- Wildcard patterns work (e.g. `--scope "web*"`) consistent with `next` and `tracks`
- Scope definitions from `.taskmd.yaml` are respected
- Unknown scopes produce warnings when scopes are configured (same as `tracks`)
- Existing tests continue to pass
