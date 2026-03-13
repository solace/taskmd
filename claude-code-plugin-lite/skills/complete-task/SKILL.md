---
name: complete-task
description: Mark a task as completed. Use when the user wants to mark a task as done or complete.
allowed-tools: Glob, Read, Edit, Write
---

# Complete Task

Mark a task as completed — no CLI required.

## Instructions

The user's query is in `$ARGUMENTS` (a task ID like `077`).

1. **Find the task file**:
   - Read `.taskmd.yaml` for custom `dir` (default: `tasks`) and `workflow` mode (default: `solo`)
   - Use `Glob` for `<task-dir>/**/*$ARGUMENTS*.md`
   - Read frontmatter to confirm the ID matches
   - If not found, list available tasks

2. **Read the task file** to get current status and verify fields

3. **Add a final worklog entry** (if worklogs are enabled):
   - Check `.taskmd.yaml` for `worklogs: true` — only create worklogs if explicitly enabled; skip otherwise
   - If enabled, find or create the worklog file at `<task-dir>/<group>/.worklogs/<ID>.md` (or `<task-dir>/.worklogs/<ID>.md` for root tasks)
   - Append a timestamped completion summary

4. **Check the workflow mode** from `.taskmd.yaml`:

   ### Solo mode (default)
   - If the task has `verify` checks in frontmatter:
     - For `bash` type: Run each `run` command via Bash (in the specified `dir` or project root) and check exit code
     - For `assert` type: Evaluate each `check` by inspecting the codebase
     - If any check fails, report failures and do NOT mark as completed
   - If all checks pass (or no verify checks): Edit the frontmatter to set `status: completed`

   ### PR-review mode
   - Edit the frontmatter to set `status: in-review` instead of `completed`
   - Note to the user that in pr-review mode, the task completes when the PR is merged

5. **Confirm** the status change to the user

See `SPEC_REFERENCE.md` (in the plugin root) for valid field values, workflow modes, and verify check format.
