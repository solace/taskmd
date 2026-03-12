---
title: "Add phase overview page to web dashboard"
id: "01kkhf957"
status: pending
priority: medium
type: feature
tags: ["web", "phases", "ux"]
dependencies: ["01kkhf93y", "01kkhf94s"]
created: "2026-03-12"
phase: phase-support
---

# Add phase overview page to web dashboard

## Objective

Add a dedicated "Phases" page to the web dashboard that lists all configured phases as cards with summary stats, progress bars, and due dates. Clicking a phase card navigates to the tasks list filtered to that phase. This serves as the landing page for project planning and progress tracking.

## Tasks

- [ ] Add "Phases" tab to `NavTabs.tsx` (route: `/phases`)
- [ ] Create `PhasesView` page component
- [ ] Create `PhaseCard` component showing: phase name, description, progress bar, task count breakdown (pending/in-progress/completed/blocked), due date
- [ ] Compute per-phase stats from task data
- [ ] Clicking a phase card navigates to `/tasks?phase=<id>` (integrates with phase selector from 01kkhf93y)
- [ ] Show a summary row or section for tasks with no phase assigned ("Unphased")
- [ ] Handle edge case: no phases configured (show helpful message explaining how to configure phases)
- [ ] Add route to React Router config
- [ ] Add tests for PhasesView and PhaseCard components

## Acceptance Criteria

- A "Phases" tab appears in the navigation when phases are configured
- The phases page shows one card per configured phase
- Each card displays: name, description, progress bar, status breakdown, due date
- Clicking a phase card navigates to the tasks list filtered to that phase
- Tasks without a phase are accounted for (shown as "Unphased" or similar)
- When no phases are configured, a helpful empty state is shown
- "Phases" tab is hidden when no phases exist in config
