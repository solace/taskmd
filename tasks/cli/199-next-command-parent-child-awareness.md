---
id: "199"
title: "Next command parent/child awareness"
status: completed
priority: medium
effort: small
tags: [cli, next]
created: 2026-02-22
---

# Next command parent/child awareness

## Objective

Update `taskmd next` to consider parent/child relationships when recommending tasks. Currently, the `next` command only considers explicit `depends_on` dependencies and ignores the `parent` field entirely, which can lead to parent tasks being recommended even when their children are incomplete.

## Tasks

- [x] Add a helper to compute children for each task (build a parent-to-children map)
- [x] Update `IsActionable` or `filterActionable` in `internal/next/next.go` to exclude parent tasks with incomplete children
- [x] Allow parent tasks with all children completed to remain actionable
- [x] Tasks with no children should be unaffected
- [x] Add unit tests covering all three cases (incomplete children, all children completed, no children)

## Acceptance Criteria

- Parent tasks with pending/in-progress children are excluded from `taskmd next` output
- Parent tasks where all children are completed appear in `taskmd next` as normal
- Tasks without children are unaffected
- Existing tests continue to pass
- New unit tests cover the parent/child filtering logic
