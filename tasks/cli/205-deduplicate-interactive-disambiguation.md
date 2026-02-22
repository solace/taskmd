---
id: "205"
title: "Interactive disambiguation for deduplicate command"
status: completed
priority: medium
effort: medium
tags: [id, deduplicate, ux]
created: 2026-02-22
---

# Interactive disambiguation for deduplicate command

## Objective

When `taskmd deduplicate` encounters duplicate IDs that are referenced by other tasks (via `dependencies` or `parent`), it currently blindly rewrites those references to point to whichever duplicate gets reassigned. This can silently produce incorrect references.

Add an interactive disambiguation step: when a duplicate ID is referenced by another task, prompt the user to choose which of the colliding tasks the reference should resolve to.

## Tasks

- [x] Detect when a reassigned ID is referenced by other tasks' `dependencies` or `parent` fields
- [x] For each ambiguous reference, prompt the user to select the intended target (showing task titles, file paths, and created dates)
- [x] Apply the user's choice when rewriting references
- [x] Add a `--no-interactive` flag that falls back to current behavior (oldest keeps ID, references follow the reassigned task)
- [x] Add tests for interactive disambiguation logic
- [x] Add tests for `--no-interactive` fallback

## Acceptance Criteria

- When a duplicate ID is referenced by other tasks, the user is prompted to choose the correct target
- The prompt displays enough context (title, file path, created date) to make an informed choice
- `--no-interactive` preserves the existing automatic behavior
- Non-TTY environments (CI, piped output) default to `--no-interactive` behavior
- Dry-run mode shows which references are ambiguous without prompting
