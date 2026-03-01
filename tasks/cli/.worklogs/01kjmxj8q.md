## 2026-03-01T12:00:00Z

Implemented `--scope` flag for both `list` and `graph` commands.

**Approach:** Created a shared `scope_filter.go` with `filterTasksByScope()` and `warnUnknownScope()`. Moved `loadScopesConfig()` from `tracks.go` to the shared file. Used simple direct-match filtering (like `next --scope --exact`), not dependency expansion.

**Completed:**
- [x] Add `--scope` flag to `list` command
- [x] Add `--scope` flag to `graph` command
- [x] Shared scope filtering logic in `scope_filter.go`
- [x] Unit tests for scope filtering (list and graph)
- [x] E2e tests for scope filtering
- [x] Moved `writeTaskWithTouches` helper to shared `e2e_test.go`

**Results:** All unit tests pass, all e2e tests pass, lint clean (only pre-existing `status.go` funlen issue).
