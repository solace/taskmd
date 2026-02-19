---
name: add-task
description: Create a new task file following the taskmd specification. Use when the user wants to add a new task to the project.
allowed-tools: Read, Glob, Write, Bash
---

# Add Task

Create a new task file under `./tasks/` following the taskmd specification.

## Instructions

The user's task description is in `$ARGUMENTS`.

1. **Read the specification** at `docs/taskmd_specification.md` (or `docs/TASKMD_SPEC.md`) for the correct format
2. **Determine the next task ID**:
   - Run `taskmd next-id` in Bash
   - If the command succeeds, use the returned ID (the project uses monotonic zero-padded numeric IDs)
   - If it fails because the project doesn't use monotonic zero-padded numeric IDs, generate a short unique numeric ID from the current Unix timestamp (e.g., last 6 digits of epoch seconds)
   - If `taskmd` is not installed, fall back to scanning existing files: run `Glob` for `tasks/**/*.md`, extract numeric IDs from filenames (pattern: `NNN-description.md`), and pick the next sequential ID zero-padded to 3 digits
3. **Choose the subdirectory** based on the task's domain:
   - `tasks/cli/` — CLI commands, Go backend, terminal features
   - `tasks/web/` — Web frontend, UI, React components
   - `tasks/` (root) — Cross-cutting, infrastructure, documentation, or unclear domain
4. **Create the task file** named `<NNN>-<slug>.md` with:

```yaml
---
id: "<NNN>"
title: "<title from user>"
status: pending
priority: medium
effort: medium
tags: []
created: <today's date YYYY-MM-DD>
---
```

Followed by a markdown body with:
- An H1 heading matching the title
- An `## Objective` section describing the goal
- A `## Tasks` section with a checkbox list of subtasks
- An `## Acceptance Criteria` section

5. **Validate** by running `taskmd validate` to ensure the new task file is valid. If validation fails, fix the issues before proceeding.
6. **Confirm** the created file path and ID to the user
