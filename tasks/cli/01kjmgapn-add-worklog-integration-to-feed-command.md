---
title: "Add worklog integration to feed command"
id: "01kjmgapn"
status: pending
priority: low
type: feature
tags: ["cli", "git"]
created: "2026-03-01"
---

# Add worklog integration to feed command

## Objective

Extend the `taskmd feed` command to include worklog entries alongside git-based events. Parse `.worklogs/*.md` files, extract timestamped entries, and merge them into the chronological feed. This adds narrative context ("what was done and why") to the raw file-change events.

## Tasks

- [ ] Parse worklog files from `.worklogs/` directories, extracting timestamp headers and entry summaries
- [ ] Merge worklog entries into the feed timeline alongside git-based events
- [ ] Add a `[worklog]` event type label in feed output
- [ ] Show a truncated first line of the worklog entry as the event description
- [ ] Support `--source` flag to filter by event source (e.g. `--source git`, `--source worklog`, or both)
- [ ] Handle worklogs with missing or malformed timestamps gracefully
- [ ] Add tests for worklog parsing, merging, and the `--source` filter

## Acceptance Criteria

- Worklog entries appear in the feed interleaved chronologically with git events
- Each worklog entry shows the timestamp, task ID, and a summary of the entry
- `taskmd feed --source worklog` shows only worklog entries
- `taskmd feed --source git` shows only git-based events (previous behavior)
- Malformed worklog timestamps are skipped with a warning in verbose mode
- Existing feed tests continue to pass
