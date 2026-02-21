---
id: "190"
title: "Add rm command to delete task files"
status: pending
priority: medium
effort: small
type: feature
tags:
  - cli
  - commands
touches:
  - cli/rm
created: 2026-02-21
---

# Add rm command to delete task files

## Objective

Add a new `rm` CLI command that deletes a task file by ID. This provides a direct, intuitive way to permanently remove a task without needing to use the archive command with `--delete` flags. The command should look up the task by ID (positional arg), confirm with the user interactively, and then delete the file.

## Tasks

- [ ] Create `internal/cli/rm.go` with cobra command
  - Use: `rm <task-id>`
  - Accept task ID as required positional argument (`cobra.ExactArgs(1)`)
  - Scan for the task, resolve it by ID
  - Display task details (ID, title, file path) and prompt for confirmation
  - Delete the task file on confirmation
- [ ] Add `--force` / `-f` flag to skip interactive confirmation
- [ ] Add `--dry-run` flag to preview what would be deleted without acting
- [ ] Handle edge cases: task not found, file already deleted, permission errors
- [ ] Create `internal/cli/rm_test.go` with comprehensive tests
  - Test successful deletion
  - Test dry-run mode
  - Test task not found error
  - Test with `--force` flag
- [ ] Update help text with examples

## Acceptance Criteria

- `taskmd rm 042` prompts for confirmation then deletes the task file
- `taskmd rm 042 -f` deletes without prompting
- `taskmd rm 042 --force` deletes without prompting
- `taskmd rm 042 --dry-run` shows what would be deleted without acting
- Clear error message when task ID doesn't exist
- All existing tests continue to pass
- New tests cover happy path, dry-run, and error cases
