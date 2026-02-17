---
id: "087"
title: "Add owner field to task specification and code"
status: completed
priority: medium
effort: medium
tags:
  - mvp
created: 2026-02-14
---

# Add Owner Field to Task Specification and Code

## Objective

Add an `owner` field to the taskmd specification and implement support for it across both the CLI and web interfaces. The owner field allows tasks to be assigned to specific people, enabling team-based task management and filtering by assignee.

## Tasks

- [X] Add `owner` field definition to `docs/taskmd_specification.md`
- [X] Add `owner` field to the Go task model (`internal/model`)
- [X] Update the markdown parser to read/write the `owner` field
- [X] Update CLI `list` command to display owner in table output
- [X] Update CLI `set` command to support `--owner` flag
- [X] Add owner filtering to CLI `list` and `next` commands
- [X] Add `owner` field to TypeScript types in the web app
- [X] Display owner in the web task table and detail views
- [X] Support editing owner in the web inline editing and task edit interface
- [X] Add owner filter to the web filtering UI
- [X] Write tests for owner field across CLI commands
- [X] Write tests for owner field in web components

## Acceptance Criteria

- The `owner` field is documented in the taskmd specification as an optional string field
- CLI can read, display, set, and filter by owner
- Web UI displays owner and supports editing and filtering by owner
- Existing task files without an owner field continue to work without issues
- All new functionality has test coverage
