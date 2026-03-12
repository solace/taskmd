---
title: "Add rich diff analysis to feed command"
id: "01kjmgaqf"
status: pending
priority: low
type: feature
tags: ["cli", "git"]
created: "2026-03-01"
phase: feed-enhancements
---

# Add rich diff analysis to feed command

## Objective

Enhance the feed command to detect and display specific field-level changes from git diffs, rather than just showing that a file was modified. Parse frontmatter diffs to surface meaningful transitions like status changes (`pending` → `in-progress`), priority changes, and subtask completions.

## Tasks

- [ ] Parse git diffs for task files to extract frontmatter field changes (using `git log -p` or `git diff` between commits)
- [ ] Detect status transitions and display them (e.g. `[status] 042: pending → in-progress`)
- [ ] Detect priority changes (e.g. `[priority] 042: medium → high`)
- [ ] Detect subtask check-off events from body diffs (e.g. `[subtask] 042: completed "Add tests"`)
- [ ] Fall back to generic `[modified]` for changes that don't match known patterns
- [ ] Add tests with sample diffs covering status changes, priority changes, subtask completions, and mixed edits

## Acceptance Criteria

- Status transitions appear as distinct labeled events in the feed (e.g. `pending → completed`)
- Priority changes are surfaced with old and new values
- Subtask completions show which subtask was checked off
- Unrecognized changes still appear as generic `[modified]` events
- Performance remains acceptable — diff parsing doesn't significantly slow down the feed for typical repos
- Tests cover each change type and the generic fallback
