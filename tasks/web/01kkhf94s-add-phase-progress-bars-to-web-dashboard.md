---
title: "Add phase progress bars to web dashboard"
id: "01kkhf94s"
status: pending
priority: medium
type: feature
tags: ["web", "phases", "ux"]
dependencies: ["01kkhetk4"]
created: "2026-03-12"
phase: Phase Support
---

# Add phase progress bars to web dashboard

## Objective

Add a visual progress indicator for each phase showing completion percentage and task count. This can appear as a compact bar in the phase overview page or as a widget on the stats view, giving users an at-a-glance sense of progress per phase.

## Tasks

- [ ] Create a `PhaseProgressBar` component that takes phase name, total tasks, and completed count
- [ ] Render a horizontal bar with fill proportional to completion %
- [ ] Show label: phase name, "X / Y tasks (Z%)"
- [ ] Color-code the bar (e.g., green for high completion, yellow for mid, gray for empty)
- [ ] Create a `PhaseProgressList` component that renders a bar for each configured phase
- [ ] Integrate into the stats view or a dedicated section
- [ ] Handle edge cases: no phases configured, phase with zero tasks
- [ ] Add tests for PhaseProgressBar and PhaseProgressList components

## Acceptance Criteria

- Each configured phase displays a progress bar with completion percentage
- Progress bar visually reflects the ratio of completed to total tasks
- Phase name, task count, and percentage are displayed alongside the bar
- Phases with zero tasks show an empty bar (not hidden)
- Component is hidden when no phases are configured
