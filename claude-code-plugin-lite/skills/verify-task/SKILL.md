---
name: verify-task
description: Run verification checks for a task and evaluate results. Use when the user wants to verify a task's acceptance criteria.
allowed-tools: Glob, Read, Bash, Grep
---

# Verify Task

Run a task's verification checks and evaluate the results — no CLI required.

## Instructions

The user's query is in `$ARGUMENTS` (a task ID like `077`).

1. **Find the task file**:
   - Read `.taskmd.yaml` for custom `dir` (default: `tasks`)
   - Use `Glob` for `<task-dir>/**/*$ARGUMENTS*.md`
   - Read frontmatter to confirm the ID matches
   - If not found, list available tasks

2. **Read the task file** and extract the `verify` field from frontmatter

3. **If no verify checks are defined**: Inform the user that the task has no verification checks

4. **Run each verification check**:

   ### For `bash` type checks
   - Execute the `run` command via the `Bash` tool
   - If `dir` is specified, run in that directory (relative to project root)
   - If `dir` is not specified, run in the project root
   - **Pass**: exit code 0
   - **Fail**: non-zero exit code

   ### For `assert` type checks
   - Read the `check` text — this is a human-readable assertion
   - Inspect the relevant codebase files using `Read`, `Glob`, and `Grep` to evaluate whether the assertion holds
   - **Pass**: the assertion is satisfied based on code inspection
   - **Fail**: the assertion is not satisfied, explain why

5. **Report results**:
   ```
   Verification results for task <ID>: <title>

   ✓ [bash] go test ./internal/api/... -run TestPagination — PASSED
   ✗ [bash] npm test — FAILED (exit code 1)
     Output: ...
   ✓ [assert] Pagination links appear in the API response headers — PASSED
     Evidence: Found Link header in handlers.go:142
   ✗ [assert] Page size defaults to 20 — FAILED
     Reason: Default page size is 10 in config.go:38

   Overall: FAIL (2 passed, 2 failed)
   ```

See `SPEC_REFERENCE.md` (in the plugin root) for verify check format and types.
