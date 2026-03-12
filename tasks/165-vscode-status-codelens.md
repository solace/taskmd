---
id: "165"
title: "VSCode extension: status codelens"
status: pending
priority: low
effort: small
tags: []
touches:
  - vscode
created: 2026-02-20
phase: vscode-extension
---

# VSCode Extension: Status CodeLens

## Objective

Show a clickable status indicator above the frontmatter that lets users quickly view and change a task's status without editing YAML manually.

## Tasks

- [ ] Implement a `CodeLensProvider` for markdown files in the task directory
- [ ] Display the current status value above the opening `---` delimiter
- [ ] On click, show a quick-pick with valid status values
- [ ] Update the `status:` line in the frontmatter when a new value is selected
- [ ] Add tests for codelens generation and status update logic

## Acceptance Criteria

- A codelens appears above the frontmatter showing the current status
- Clicking it opens a quick-pick with all valid status values
- Selecting a value updates the `status:` field in the file
- CodeLens only appears for task files (resolved via `.taskmd.yaml`)
