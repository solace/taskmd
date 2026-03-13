---
name: next-task
description: Get the next recommended task to work on. Use when the user asks what to work on next or needs a task assignment.
allowed-tools: Glob, Read
---

# Next Task

Find the next recommended task using priority ranking — no CLI required.

## Instructions

The user may provide optional filters in `$ARGUMENTS` (e.g. `--tag mvp`, `--group cli`).

1. **Find the task directory**:
   - Read `.taskmd.yaml` if it exists to check for a custom `dir` field
   - Default to `tasks` if not configured

2. **Scan all task files**: Use `Glob` with `<task-dir>/**/*.md`
   - Exclude `.worklogs/` directories

3. **Read frontmatter** of each task file and collect: id, title, status, priority, effort, dependencies, tags, group, created, owner

4. **Filter candidates**:
   - Include only tasks with `status: pending` (or no status field)
   - Exclude tasks whose dependencies include any task that is NOT `completed`
   - Apply any user filters from `$ARGUMENTS` (e.g. `--tag`, `--group`, `--owner`)

5. **Rank candidates** using this priority order:
   1. **Priority** (descending): critical > high > medium > low > unset
   2. **Effort** (ascending): small > medium > large > unset (prefer smaller tasks as tiebreaker)
   3. **Created date** (ascending): older tasks first

6. **Present the top recommendation**:
   - Read the full task file of the #1 ranked task
   - Show: ID, title, priority, effort, tags, and the full description
   - Optionally mention the next 2-3 runner-up tasks

See `SPEC_REFERENCE.md` (in the plugin root) for valid field values and ranking logic.
