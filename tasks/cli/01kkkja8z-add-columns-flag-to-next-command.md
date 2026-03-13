---
title: "Add --columns flag to next command"
id: "01kkkja8z"
status: pending
priority: medium
type: feature
tags: ["cli"]
created: "2026-03-13"
---

# Add --columns flag to next command

## Objective

Add a `--columns` flag to the `next` command to allow users to customize which columns are displayed in table output, consistent with the existing `--columns` flag on the `list` command. The `next` command currently hardcodes columns (`#`, `ID`, `Title`, `Priority`, `Effort`, `File`, `Reason`). This flag lets users select and reorder columns to fit their workflow.

## Tasks

- [ ] Add `--columns` string flag to the `next` command in `apps/cli/internal/cli/next.go` with a sensible default (e.g. `rank,id,title,priority,effort,file,reason`)
- [ ] Update `outputNextTable` to use the columns flag instead of hardcoded headers, following the pattern in `list.go:outputTable`
- [ ] Support next-specific columns: `rank` (the `#` column), `reason`, `score` — in addition to standard task columns (`id`, `title`, `priority`, `effort`, `status`, `phase`, `tags`, `file`, `deps`, etc.)
- [ ] Add unit tests in `next_test.go` covering:
  - [ ] Default columns match current behavior
  - [ ] Custom column selection works (e.g. `--columns id,title,reason`)
  - [ ] Invalid column names produce a clear error
  - [ ] Flag only affects table format (json/yaml unaffected)
- [ ] Update command help text with `--columns` usage example

## Acceptance Criteria

- `taskmd next` without `--columns` displays the same output as before (no regression)
- `taskmd next --columns rank,id,title,reason` displays only those columns in that order
- Next-specific columns (`rank`, `reason`, `score`) are available alongside standard task columns
- The `--columns` flag is ignored for json/yaml formats
- Column names are case-insensitive and trimmed of whitespace
- All existing tests pass; new tests cover custom column selection
