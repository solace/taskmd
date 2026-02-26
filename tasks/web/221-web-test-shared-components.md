---
id: "221"
title: "Test shared and presentational components"
status: pending
priority: low
type: chore
effort: small
tags: ["testing", "quality"]
dependencies: ["214"]
created: "2026-02-26"
---

# Test shared and presentational components

## Objective

Add tests for the remaining shared UI components and presentational pieces. These are lower priority since they contain less logic, but they round out coverage and catch rendering regressions.

## Tasks

- [ ] Test `LoadingState.tsx` renders correct skeleton variant for each variant prop
- [ ] Test `TaskEditForm.tsx` and `TaskEditFormFields.tsx` (field rendering, dirty state detection, form submission)
- [ ] Test `StatsView.tsx` renders correct breakdown sections
- [ ] Test `NavTabs.tsx` highlights the active route
- [ ] Test badge components in `TaskTable/Badges.tsx` (StatusBadge, PriorityBadge, TypeBadge render correct styles)

## Acceptance Criteria

- LoadingState renders distinct skeletons per variant
- TaskEditForm detects dirty fields and submits only changed values
- Badge components render correct status/priority/type labels
- All new tests pass via `pnpm test`
