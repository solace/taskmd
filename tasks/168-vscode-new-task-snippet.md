---
id: "168"
title: "VSCode extension: new task file snippet"
status: pending
priority: low
effort: small
tags: []
touches:
  - vscode
created: 2026-02-20
phase: vscode-extension
---

# VSCode Extension: New Task File Snippet

## Objective

Provide a snippet or command that generates a new task file with the correct frontmatter template and the next available ID, reducing boilerplate when creating tasks from VSCode.

## Tasks

- [ ] Scan existing task files to determine the next sequential ID
- [ ] Register a command (`taskmd.newTask`) that creates a new file with frontmatter template
- [ ] Pre-fill `id`, `created` (today's date), and default values for status/priority/effort
- [ ] Open the new file in the editor with cursor on the `title` field
- [ ] Add tests for ID calculation logic

## Acceptance Criteria

- Running the command creates a new task file with the next available ID
- The file is created in the task directory resolved from `.taskmd.yaml`
- Frontmatter includes all standard fields with sensible defaults
- The file opens in the editor ready for the user to fill in the title
