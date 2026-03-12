---
id: "182"
title: "Add keyboard shortcuts to web UI"
status: pending
priority: low
effort: medium
type: feature
tags:
  - web
  - ux
  - accessibility
created: 2026-02-20
phase: web-ui
---

# Add Keyboard Shortcuts to Web UI

## Objective

Add keyboard shortcuts for power users to navigate and operate the web UI without a mouse. Developer-oriented tools benefit greatly from keyboard-driven workflows.

## Tasks

- [ ] Define a keyboard shortcut scheme (e.g., `g t` for go to tasks, `g b` for board, `g g` for graph)
- [ ] Implement a shortcut handler that supports single keys and chord sequences
- [ ] Add navigation shortcuts: switch between views (tasks, board, graph, stats, next)
- [ ] Add table shortcuts: `j`/`k` for row navigation, `Enter` to open task detail
- [ ] Add board shortcuts: arrow keys to navigate cards
- [ ] Add task detail shortcuts: `e` to edit, `Esc` to close
- [ ] Add a `?` shortcut to show a keyboard shortcuts help overlay
- [ ] Ensure shortcuts don't fire when typing in input fields or textareas
- [ ] Add visual hints for shortcuts in the UI (tooltips on nav items)
- [ ] Add tests for the shortcut handler

## Acceptance Criteria

- Users can navigate between all views using keyboard shortcuts
- Users can navigate and select tasks in table/board views with the keyboard
- A help overlay (`?`) lists all available shortcuts
- Shortcuts are suppressed when focus is inside form inputs
- Shortcuts follow common conventions (vim-style `j`/`k`, `g` prefix for go-to)
