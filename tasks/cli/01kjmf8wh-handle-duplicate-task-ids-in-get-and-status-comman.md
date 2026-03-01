---
title: "Handle duplicate task IDs in get and status commands"
id: "01kjmf8wh"
status: completed
priority: medium
type: feature
tags: []
created: "2026-03-01"
---

# Handle duplicate task IDs in get and status commands

## Objective

When multiple task files share the same ID, the `get` and `status` commands should detect the duplication and present a clear error message listing all conflicting tasks instead of silently picking one or crashing. The user must resolve the duplication before they can retrieve task details.

## Tasks

- [x] Update the `get` command to detect when multiple tasks share the same ID
- [x] Update the `status` command to detect when multiple tasks share the same ID
- [x] When duplicates are found, display an error message listing all conflicting tasks with their title and filename
- [x] Prevent the command from proceeding until the duplication is resolved
- [x] Add tests for duplicate ID detection in both commands

## Acceptance Criteria

- Running `taskmd get <id>` when two or more tasks share that ID prints an error message indicating duplicate IDs were found
- The error message lists each conflicting task with its title and filename
- The command exits with a non-zero status code when duplicates are detected
- Running `taskmd status <id>` behaves the same way when duplicates exist
- When only one task has the given ID, both commands work as before
