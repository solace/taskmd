---
title: "Implement taskmd phases command"
id: "01kkhezs6"
status: completed
priority: medium
type: feature
tags: ["cli", "phases"]
dependencies: ["01kkhetk4"]
created: "2026-03-12"
phase: phase-support
---

# Implement taskmd phases command

## Objective

Add a `taskmd phases` command that lists all configured phases with summary stats — task count, completion percentage, status breakdown, and due date. This gives users a quick "where are we?" overview across all phases.

Follow the conventions of existing commands (`stats`, `list`) for flag handling, output formatting, and scanner usage.

Example output (table format):

```
ID           Name              Tasks  Done  Progress  Due
benchmarks   Skill Benchmarks  12     0     0%        -
web-ui       Web UI            6      0     0%        -
feed         Feed Enhancements 3      0     0%        2026-06-01
```

## Tasks

- [ ] Create `apps/cli/internal/cli/phases.go` with cobra command structure
- [ ] Register `phasesCmd` with `rootCmd.AddCommand()` in `init()`
- [ ] Read phases config from `.taskmd.yaml` via viper
- [ ] Scan tasks and group by `phase` field, matching against phase IDs
- [ ] Compute per-phase stats: total tasks, completed count, completion percentage, status breakdown
- [ ] Implement table output format (default) with columns: ID, Name, Tasks, Done, Progress, Due
- [ ] Implement JSON output format
- [ ] Implement YAML output format
- [ ] Support `--format` flag (table, json, yaml) consistent with other commands
- [ ] Show warning for tasks referencing undefined phases (orphaned phase values)
- [ ] Handle edge case: no phases configured (print helpful message)
- [ ] Create `apps/cli/internal/cli/phases_test.go` with comprehensive tests
- [ ] Add command documentation to `docs/` and CLI help text
- [ ] Update `apps/docs/` site if applicable (command reference page)

## Acceptance Criteria

- `taskmd phases` lists all configured phases with task count, completion %, and due date
- `taskmd phases --format json` and `--format yaml` produce structured output
- Tasks with no `phase` or an unrecognized phase are reported separately or noted
- No phases configured prints a clear message (not an error)
- Command follows existing conventions: `GetGlobalFlags()`, `ResolveScanDir()`, scanner pattern
- Tests cover: happy path, all formats, no phases configured, orphaned phase values
- Command is documented in CLI help text (`Short`, `Long`, `Examples`)
