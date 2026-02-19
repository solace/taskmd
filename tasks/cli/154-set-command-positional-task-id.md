---
id: "154"
title: "Support positional task ID argument in set command"
status: pending
priority: medium
effort: small
type: improvement
tags:
  - cli
  - ux
touches:
  - cli/set
created: 2026-02-19
---

# Support positional task ID argument in set command

## Objective

Allow `taskmd set 148 --priority low` as a shorthand for `taskmd set --task-id 148 --priority low`. The task ID should be accepted as the first positional argument, making `--task-id` optional when a positional arg is provided.

## Tasks

- [ ] Change `Args` from `cobra.NoArgs` to `cobra.MaximumNArgs(1)`
- [ ] In `runSet`, resolve task ID from positional arg (first) or `--task-id` flag (fallback)
- [ ] Error if both positional arg and `--task-id` are provided with different values
- [ ] Update `Use` field to `set [task-id]` and help text / examples
- [ ] Add tests for positional arg, flag-only, both-provided, and neither-provided cases

## Acceptance Criteria

- `taskmd set 148 --priority low` works identically to `taskmd set --task-id 148 --priority low`
- `--task-id` flag continues to work for backward compatibility
- Providing both positional arg and `--task-id` with the same value works without error
- Providing neither produces a clear error message
- All existing set command tests continue to pass
