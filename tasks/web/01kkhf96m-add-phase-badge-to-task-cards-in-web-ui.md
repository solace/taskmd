---
title: "Add phase badge to task cards in web UI"
id: "01kkhf96m"
status: pending
priority: medium
type: feature
tags: ["web", "phases", "ux"]
dependencies: ["01kkhetk4"]
created: "2026-03-12"
phase: Phase Support
---

# Add phase badge to task cards in web UI

## Objective

Display a small phase badge (chip/tag) on task cards throughout the web UI — in the task list, board view, and task detail. This helps users quickly identify which phase a task belongs to without needing to open it. Each phase should have a consistent color for quick visual scanning.

## Tasks

- [ ] Create a `PhaseBadge` component that renders a small colored chip with the phase name
- [ ] Assign a consistent color to each phase (derive from phase ID hash or use a predefined palette based on config order)
- [ ] Add `PhaseBadge` to `TaskCard.tsx` (used in board view)
- [ ] Add `PhaseBadge` to task rows in the tasks list view
- [ ] Add `PhaseBadge` to task detail view (if one exists)
- [ ] Hide the badge when the task has no phase or when the view is already filtered to a single phase
- [ ] Add tests for PhaseBadge component

## Acceptance Criteria

- Task cards in board and list views show a phase badge when the task has a phase
- Each phase has a consistent, distinguishable color across all views
- Badge shows the phase name (short/truncated if needed)
- Badge is hidden when no phase is assigned to the task
- Badge is hidden when the current view is already filtered to a single phase (to avoid redundancy)
