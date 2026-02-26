---
title: "Add effort column to next command table output"
id: "226"
status: completed
priority: medium
effort: small
type: chore
tags: []
created: "2026-02-26"
---

# Add effort column to next command table output

## Objective

The `next` command's table output currently shows: #, ID, Title, Priority, File, Reason. The `Recommendation` struct already includes an `Effort` field, but it is not displayed in the default table format. Add an "Effort" column to the table so users can see task effort at a glance when deciding what to work on next.

## Tasks

- [x] Add "Effort" header to the table in `outputNextTable` (`internal/cli/next.go:132`)
- [x] Include `rec.Effort` in both the plain and colored row data
- [x] Apply appropriate formatting to the effort value (e.g., color coding similar to priority)
- [x] Update or add tests to verify the effort column appears in table output

## Acceptance Criteria

- Running `taskmd next` in table format shows an "Effort" column between "Priority" and "File"
- Effort values (small, medium, large) are displayed; empty effort shows as blank
- JSON and YAML formats are unaffected (effort is already included)
- Existing tests continue to pass
