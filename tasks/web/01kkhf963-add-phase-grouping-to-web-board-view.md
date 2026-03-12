---
title: "Add phase grouping to web board view"
id: "01kkhf963"
status: pending
priority: medium
type: feature
tags: ["web", "phases", "board"]
dependencies: ["01kkhetk4"]
created: "2026-03-12"
phase: phase-support
---

# Add phase grouping to web board view

## Objective

Add a "group by phase" option to the web board view, allowing users to see kanban columns organized by phase instead of status. This mirrors the CLI's `taskmd board --group-by phase` functionality.

## Tasks

- [ ] Add "Phase" option to the group-by selector in `BoardFilterBar.tsx`
- [ ] Update `BoardView.tsx` to support grouping tasks by phase
- [ ] Render one column per configured phase (ordered by config order)
- [ ] Add an "Unphased" column for tasks without a phase assignment
- [ ] Show task count per phase column header
- [ ] Ensure existing board features (drag-and-drop if present, task cards, filters) work with phase grouping
- [ ] Handle edge case: no phases configured (disable or hide the "Phase" group-by option)
- [ ] Add tests for phase grouping in board view

## Acceptance Criteria

- Board view has a "Phase" option in its group-by selector
- Selecting "Phase" renders one column per configured phase
- Columns are ordered by phase config order (not alphabetical)
- Tasks without a phase appear in an "Unphased" column
- The option is hidden/disabled when no phases are configured
- Existing board interactions continue to work when grouped by phase
