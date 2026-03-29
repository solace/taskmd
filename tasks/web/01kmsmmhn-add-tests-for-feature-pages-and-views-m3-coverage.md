---
title: "Add tests for feature pages and views (M3 coverage target)"
id: "01kmsmmhn"
status: completed
priority: low
type: chore
tags: ["testing", "quality"]
created: "2026-03-28"
phase: web-ui
depends-on: ["01kmsmmdx"]
---

# Add tests for feature pages and views (M3 coverage target)

## Objective

Add tests for feature pages and view components to reach the M3 milestone (80% statements, 88% branches, 85% functions). These are full page components that mostly orchestrate child components.

## Tasks

- [x] Add tests for `GraphPage.tsx` (0% → target 70%+)
- [x] Add tests for `GraphView.tsx` (0% → target 70%+)
- [x] Add tests for `GraphFilters.tsx` (0% → target 70%+)
- [x] Add tests for `ValidateView.tsx` (0% → target 70%+)
- [x] Add tests for `ValidatePage.tsx` (0% → target 70%+)
- [x] Add tests for `TasksPage.tsx` (0% → target 70%+)
- [x] Add tests for `TracksPage.tsx` (0% → target 70%+)
- [x] Add tests for `PhasesPage.tsx` (0% → target 70%+)
- [x] Add tests for `App.tsx` (0% → target 70%+) — routing setup
- [x] Verify overall coverage reaches M3 thresholds

## Acceptance Criteria

- All listed pages have tests verifying they render and pass data to child components
- Graph page tests verify filter interactions affect the rendered view
- Validate page tests verify validation results are displayed
- Overall statement coverage is at or above 80%
- Overall branch coverage is at or above 88%
