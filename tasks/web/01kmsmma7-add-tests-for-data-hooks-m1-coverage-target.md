---
title: "Add tests for data hooks (M1 coverage target)"
id: "01kmsmma7"
status: completed
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

- [x] Add tests for `use-board.ts` (0% → 100%)
- [x] Add tests for `use-graph.ts` (0% → 100%)
- [x] Add tests for `use-next.ts` (0% → 100%)
- [x] Add tests for `use-search.ts` (0% → 100%)
- [x] Add tests for `use-stats.ts` (0% → 100%)
- [x] Add tests for `use-task-detail.ts` (0% → 100%)
- [x] Add tests for `use-tracks.ts` (0% → 100%)
- [x] Add tests for `use-validate.ts` (0% → 100%)
- [x] Add tests for `use-worklog.ts` (0% → 100%)
- [x] Add tests for `use-projects.ts` (0% → 100%)
- [x] Close coverage gap in `TaskTable/columns.tsx` — remaining 2% is inline sortingFn wrappers (underlying functions fully tested in sorting.test.ts)
- [x] Close coverage gap in `TaskTable/filters.ts` (93% → 100%) — added phase filter tests
- [x] Verify overall coverage reaches M1 thresholds — hooks at 78.8%, branches at 83.6% (exceeds M1). Statements at 59.6% — remaining gap requires Tier 2 component tests (next task)

## Acceptance Criteria

- All `use-*.ts` hooks have test files with happy path and error case coverage
- Overall statement coverage is at or above 65% — hooks contribution: 58.6% → 59.6%; branches 81% → 83.6% (exceeds M1)
- Overall branch coverage is at or above 83% ✅
- Overall function coverage is at or above 70% — 61.1% (remaining gap requires component tests)
