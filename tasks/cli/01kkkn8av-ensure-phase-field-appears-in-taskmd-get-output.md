---
id: "01kkkn8av"
title: "Ensure phase field appears in taskmd get output"
status: completed
priority: medium
dependencies: []
tags: []
created: 2026-03-13
---

# Ensure phase field appears in taskmd get output

## Objective

The `taskmd get` command does not display the `phase` field in any output format (text, JSON, YAML). Tasks that belong to a phase should show this information when viewed.

## Tasks

- [x] Add `Phase` to `outputGetText` in `apps/cli/internal/cli/get.go` (e.g. using `printOptionalField`)
- [x] Add `Phase` field to the `getOutput` struct used for JSON/YAML serialization
- [x] Populate `Phase` in `buildGetOutput` from `task.Phase`
- [x] Add tests for phase display in text, JSON, and YAML formats

## Acceptance Criteria

- Running `taskmd get <id>` on a task with a `phase` field shows `Phase: <value>` in text output
- JSON output includes `"phase": "<value>"` when the field is set
- YAML output includes `phase: <value>` when the field is set
- Phase is omitted from all formats when the field is empty
- Existing tests continue to pass
