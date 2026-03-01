---
title: "Support wildcard patterns in --scope flag"
id: "01kjmk5q3"
status: completed
priority: medium
type: feature
tags: []
created: "2026-03-01"
---

# Support wildcard patterns in --scope flag

## Objective

Update the `--scope` flag across CLI commands (`next`, `status`, `feed`, `tracks`) to support wildcard/glob patterns instead of requiring exact matches. Users should be able to use patterns like `web/*`, `*web*`, or `cli*` to match multiple scopes at once.

Currently, scope matching uses exact string comparison (e.g. `touchesScope()` in `sdk/go/next/next.go`, `group=` filter in `status`). This task adds glob-style pattern matching so that `--scope "web/*"` matches scopes like `web/graph`, `web/ui`, etc.

## Tasks

- [ ] Add a shared `matchScope(pattern, scope string) bool` utility function using `filepath.Match` or equivalent glob matching
- [ ] Update `touchesScope()` and `filterByScope()` in `sdk/go/next/next.go` to use glob matching
- [ ] Update `filterByScopeExpanded()` in `sdk/go/next/next.go` to use glob matching
- [ ] Update `status` command's `group=` filter to support wildcard patterns when used via `--scope`
- [ ] Update `feed` command's scope path filtering to support wildcards
- [ ] Update `tracks` command's scope filtering to support wildcards
- [ ] Add unit tests for the shared `matchScope` function (exact, prefix `web/*`, suffix `*/graph`, contains `*web*`, no-wildcard backward compat)
- [ ] Add tests for each command verifying wildcard `--scope` behavior
- [ ] Update `--scope` flag help text to mention wildcard support

## Acceptance Criteria

- `--scope "web/*"` matches scopes like `web/graph`, `web/ui` but not `web` or `cli`
- `--scope "*web*"` matches any scope containing "web" (e.g. `web`, `web/graph`, `frontend-web`)
- `--scope "cli"` (no wildcard) continues to work as an exact match for backward compatibility
- All commands that accept `--scope` (`next`, `status`, `feed`, `tracks`) support the same wildcard syntax
- Wildcard matching uses `filepath.Match` semantics (or equivalent)
