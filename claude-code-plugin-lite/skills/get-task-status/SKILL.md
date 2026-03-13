---
name: get-task-status
description: Get only the metadata/status of a task without full details. Use when the user wants to quickly check a task's status, priority, or other metadata.
allowed-tools: Glob, Read
---

# Get Task Status

Retrieve lightweight metadata for a task — no CLI required.

## Instructions

The user's query is in `$ARGUMENTS` (a task ID like `077` or a task name/keyword).

1. **Find the task directory**:
   - Read `.taskmd.yaml` if it exists to check for a custom `dir` field
   - Default to `tasks` if not configured

2. **Find the task file**:
   - Use `Glob` for `<task-dir>/**/*$ARGUMENTS*.md`
   - If multiple matches, read frontmatter to find the one with matching `id`
   - If no match by filename, scan all task files for matching `id` in frontmatter
   - If still no match, list available tasks

3. **Read only the frontmatter** of the matched file (the YAML between `---` delimiters)

4. **Present the metadata** in a compact format:
   ```
   Task 077: Fix login bug
   Status:       in-progress
   Priority:     high
   Effort:       medium
   Type:         bug
   Tags:         auth, frontend
   Owner:        alice
   Dependencies: 042, 043
   Created:      2026-02-10
   File:         tasks/cli/077-fix-login-bug.md
   ```

See `SPEC_REFERENCE.md` (in the plugin root) for valid field values and frontmatter schema.
