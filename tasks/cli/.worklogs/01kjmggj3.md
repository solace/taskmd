## 2026-03-01T00:00:00Z

Implemented blocked/unblocked state display in the `status` command.

**Changes:**
- Added `Blocked *bool` and `BlockedBy []string` fields to `statusOutput` (nil when no deps, omitted in JSON/YAML)
- Added `buildTasksByIDMap()` and `resolveBlockingDeps()` helpers to resolve dependency status
- Updated text output to show "Blocked: Yes (blocked by: X, Y)" or "Blocked: No" after dependencies line
- Added 6 new tests covering blocked, unblocked, and no-dependency cases in both text and JSON formats

All 27 status tests pass, lint is clean.
