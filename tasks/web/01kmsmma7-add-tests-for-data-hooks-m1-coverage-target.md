---
title: "Add tests for data hooks (M1 coverage target)"
id: "01kmsmma7"
status: pending
priority: medium
type: chore
tags: ["testing", "quality"]
created: "2026-03-28"
phase: web-ui
depends-on: ["01kmsmkh1"]
---

# Add tests for data hooks (M1 coverage target)

## Objective

Add tests for data hooks and close remaining coverage gaps in core logic files to reach the M1 milestone (65% statements, 83% branches, 70% functions). Most hooks are at 0% coverage but are thin wrappers around API calls, making them quick wins.

## Tasks

- [ ] Add tests for `use-board.ts` (0% → target 80%+)
- [ ] Add tests for `use-graph.ts` (0% → target 80%+)
- [ ] Add tests for `use-next.ts` (0% → target 80%+)
- [ ] Add tests for `use-search.ts` (0% → target 80%+)
- [ ] Add tests for `use-stats.ts` (0% → target 80%+)
- [ ] Add tests for `use-task-detail.ts` (0% → target 80%+)
- [ ] Add tests for `use-tracks.ts` (0% → target 80%+)
- [ ] Add tests for `use-validate.ts` (0% → target 80%+)
- [ ] Add tests for `use-worklog.ts` (0% → target 80%+)
- [ ] Add tests for `use-projects.ts` (0% → target 80%+)
- [ ] Close coverage gap in `TaskTable/columns.tsx` (98% → 100%)
- [ ] Close coverage gap in `TaskTable/filters.ts` (93% → 100%)
- [ ] Verify overall coverage reaches M1 thresholds

## Acceptance Criteria

- All `use-*.ts` hooks have test files with happy path and error case coverage
- Overall statement coverage is at or above 65%
- Overall branch coverage is at or above 83%
- Overall function coverage is at or above 70%
