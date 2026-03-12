---
title: "Add phase selector filter to web dashboard"
id: "01kkhf93y"
status: completed
priority: medium
type: feature
tags: ["web", "phases", "ux"]
dependencies: ["01kkhetk4"]
created: "2026-03-12"
phase: phase-support
---

# Add phase selector filter to web dashboard

## Objective

Add a global phase selector (dropdown or tab bar) to the web dashboard that scopes all views — tasks list, board, stats, graph, next — to a single phase. This is the most impactful phase feature for the web UI since it turns every existing view into a phase-aware view without building dedicated pages.

The selector should appear in the Shell/NavTabs area and persist across page navigation. An "All" option shows unfiltered results (the current default behavior).

## Tasks

- [x] Read phases config from the API response (already served by the CLI web server)
- [x] Create a `PhaseSelector` component (dropdown with phase names, "All" default)
- [x] Add `PhaseSelector` to `Shell.tsx` or `NavTabs.tsx` layout
- [x] Store selected phase in URL query param (`?phase=benchmarks`) or React context for persistence across navigation
- [x] Filter tasks list view by selected phase
- [x] Filter board view by selected phase
- [x] Filter stats view by selected phase
- [x] Filter graph view by selected phase
- [x] Filter next-up view by selected phase
- [x] Show phase name and task count in the selector options
- [x] Handle edge case: no phases configured (hide selector entirely)
- [x] Add tests for PhaseSelector component
- [x] Test that filtering works correctly across all views

## Acceptance Criteria

- A phase selector is visible in the dashboard navigation area
- Selecting a phase filters all views (tasks, board, stats, graph, next) to that phase
- "All" option shows all tasks regardless of phase
- Selected phase persists across page navigation within the session
- Selector is hidden when no phases are configured in `.taskmd.yaml`
- Selector shows task count per phase in the dropdown options
