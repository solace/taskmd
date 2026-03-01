# Worklog: 01kjmk5q3 - Support wildcard patterns in --scope flag

## 2026-03-01T00:00:00Z - Completed

Implemented glob-style wildcard support for the `--scope` flag across all CLI commands.

### Changes made:
- Created `sdk/go/filter/scope.go` with `MatchScope(pattern, scope)` using `filepath.Match` for wildcards, exact equality otherwise
- Updated `sdk/go/next/next.go` — `filterByScope`, `filterByScopeExpanded`, `touchesScope` use `MatchScope`
- Updated `sdk/go/tracks/tracks.go` — `assignScope` uses `MatchScope`
- Updated `sdk/go/filter/filter.go` — `matches()` uses `MatchScope` for `group` and `touches` fields with wildcards
- Updated `apps/cli/internal/cli/feed.go` — `buildGitLogArgs` expands wildcard scope via `filepath.Glob`
- Updated `--scope` flag help text in next, status, feed, and tracks commands

### Tests added:
- `sdk/go/filter/scope_test.go` — full coverage of MatchScope
- `sdk/go/filter/filter_test.go` — wildcard group/touches filter tests
- `sdk/go/next/next_test.go` — wildcard scope exact and expanded tests
- `sdk/go/tracks/tracks_test.go` — wildcard scope assign tests

All tests pass, lint clean.
