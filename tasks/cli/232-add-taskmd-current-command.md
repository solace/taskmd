---
title: "Add taskmd current command"
id: "232"
status: completed
priority: medium
type: feature
tags: []
created: "2026-02-28"
---

# Add taskmd current command

## Objective

Add a `taskmd current` command that outputs the current in-progress task in a compact, pre-formatted string (e.g. `#135 Windows installation support`). This makes statusline integrations trivial — users don't need jq or JSON parsing, just `$(taskmd current)` in their script.

## Tasks

- [x] Create `internal/cli/current.go` with the `current` command
- [x] Filter tasks by `status=in-progress`, pick the first result
- [x] Output format: `#<ID> <title>` (truncate title to 30 chars with `...`)
- [x] Output nothing (empty string, exit 0) if no task is in-progress
- [x] Add tests in `internal/cli/current_test.go`
- [x] Update statusline script to use `taskmd current` instead of JSON parsing

## Acceptance Criteria

- `taskmd current` outputs `#<ID> <title>` when a task is in-progress
- `taskmd current` outputs nothing and exits 0 when no task is in-progress
- Title is truncated to 30 characters with `...` suffix if longer
- Command has no required flags
- Tests cover: in-progress task found, no in-progress task, long title truncation
