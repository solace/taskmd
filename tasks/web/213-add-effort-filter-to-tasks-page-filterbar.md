---
title: "Add effort filter to Tasks page FilterBar"
id: "213"
status: pending
priority: low
type: feature
tags: ["ui"]
created: "2026-02-25"
---

# Add effort filter to Tasks page FilterBar

## Objective

Add an "Effort" toggle group to the FilterBar on the Tasks page, matching the existing Status, Priority, and Type filter groups. Task 208 added URL-param-driven effort filtering and `selectedEffort` state to `TaskTable.tsx`, but there is no UI control in the FilterBar for users to toggle effort values directly.

## Tasks

- [ ] Add `EFFORTS` constant to `TaskTable/constants.ts` (e.g. `["small", "medium", "large"]`)
- [ ] Add effort toggle group to `FilterBar.tsx` matching the existing status/priority/type pattern
- [ ] Wire `selectedEffort` and `onToggleEffort` props through from `TaskTable.tsx` to `FilterBar`
- [ ] Sync effort filter toggles to URL params (using the existing `syncFiltersToUrl` from task 208)
- [ ] Include effort in `hasActiveFilters` check and `clearFilters` reset (already partially done in task 208)

## Acceptance Criteria

- The FilterBar shows an "Effort" toggle group with small, medium, and large options
- Toggling an effort value filters the task list to show/hide tasks with that effort level
- Effort filter state is reflected in the URL (e.g. `?effort=small`)
- Clearing all filters resets effort toggles to all-selected
- The effort filter group styling is consistent with the existing status/priority/type groups
