---
title: "Add grouping and deduplication to feed command"
id: "01kjmgar4"
status: pending
priority: low
type: feature
tags: ["cli"]
created: "2026-03-01"
phase: Feed Enhancements
---

# Add grouping and deduplication to feed command

## Objective

Add options to group and deduplicate feed events so users can get a summary view instead of a raw event log. When a task has multiple events in the feed window, allow collapsing them into a single entry per task showing the most recent activity.

## Tasks

- [ ] Implement `--group-by task` flag that collapses events per task into a single summary line
- [ ] In grouped mode, show: last event timestamp, task ID/title, event count, and most recent event type
- [ ] Implement `--dedup` flag that removes redundant consecutive events for the same task (e.g. multiple rapid edits)
- [ ] Ensure grouping works correctly with all event sources (git, worklog) and all output formats (plain, json)
- [ ] Add tests for grouping logic, deduplication, and edge cases (single event per task, all events same task)

## Acceptance Criteria

- `taskmd feed --group-by task` shows one line per task with an activity summary
- `taskmd feed --dedup` collapses consecutive events for the same task within a short time window
- Grouped JSON output includes an `events` array per task for programmatic access
- Default behavior (no flags) remains unchanged — full event log
- Tests cover grouping, dedup, and combinations with `--since`/`--limit`/`--scope`
