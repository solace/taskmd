## 2026-03-01T12:00:00Z

Implemented duplicate task ID detection as errors in `get` and `status` commands.

**Approach:** Changed `resolveTask()` in `get.go` to return an error instead of a warning when duplicate IDs are detected. Since both `get` and `status` commands use `resolveTask()`, both get the fix. Also changed the duplicate check to use `task.ID` instead of the raw query, so title-based matches also detect duplicates on the resolved task's ID.

**Changes:**
- `get.go`: Changed `resolveTask()` to return error with title+filepath details instead of stderr warning
- `duplicate.go`: Added `formatDuplicatePathsWithTitles()` for error messages that include both filepath and title
- `duplicate_test.go`: Updated existing test, added 7 new tests covering get, status, title-match, and unique-ID-still-works scenarios

**Completed:**
- [x] `get` command errors on duplicate IDs
- [x] `status` command errors on duplicate IDs (via shared `resolveTask`)
- [x] Error message lists conflicting tasks with title and filename
- [x] Commands exit with non-zero status (via returned error)
- [x] Comprehensive tests for both commands
