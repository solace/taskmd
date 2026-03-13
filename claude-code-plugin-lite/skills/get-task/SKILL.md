---
name: get-task
description: Get details of a specific task by ID or name. Use when the user wants to view or look up a task.
allowed-tools: Glob, Read
---

# Get Task

Retrieve full details of a specific task — no CLI required.

## Instructions

The user's query is in `$ARGUMENTS` (a task ID like `077` or a task name/keyword).

1. **Find the task directory**:
   - Read `.taskmd.yaml` if it exists to check for a custom `dir` field
   - Default to `tasks` if not configured

2. **Find the task file**:
   - Use `Glob` for `<task-dir>/**/*$ARGUMENTS*.md` to find files matching the ID or keyword
   - If multiple matches, read each file's frontmatter to find the one with `id` matching `$ARGUMENTS`
   - If no match by filename, use `Glob` for `<task-dir>/**/*.md` and read frontmatter of each to find a matching `id`
   - If still no match, list available tasks and ask the user which one they meant

3. **Read the full task file** using the `Read` tool

4. **Present the task** including:
   - All frontmatter fields (ID, title, status, priority, effort, type, tags, owner, dependencies, etc.)
   - The full markdown body (objective, tasks/subtasks, acceptance criteria)
   - The file path for reference

See `SPEC_REFERENCE.md` (in the plugin root) for valid field values and frontmatter schema.
