---
id: "163"
title: "VSCode extension: task ID navigation and hover"
status: pending
priority: low
effort: medium
tags: []
touches:
  - vscode
created: 2026-02-20
phase: VSCode Extension
---

# VSCode Extension: Task ID Navigation and Hover

## Objective

Enable Ctrl+click navigation and hover previews for task IDs referenced in `dependencies`, `parent`, and `pr` frontmatter fields. This lets users quickly jump between related tasks without leaving the editor.

## Tasks

- [ ] Implement a `DefinitionProvider` for markdown files that resolves task IDs to file paths
- [ ] Scan the task directory (using `.taskmd.yaml` config resolution) to build a task ID → file path map
- [ ] Register a `HoverProvider` that shows a task's title, status, and priority when hovering over an ID in `dependencies` or `parent`
- [ ] Cache the task map and invalidate on file create/delete/rename events
- [ ] Add tests for ID resolution and hover content generation

## Acceptance Criteria

- Ctrl+clicking a task ID in `dependencies: ["041"]` opens the file for task 041
- Ctrl+clicking a task ID in `parent: "045"` opens the file for task 045
- Hovering over a task ID shows the referenced task's title, status, and priority
- Non-existent task IDs show no navigation target
- Works with the task directory resolved from `.taskmd.yaml`
