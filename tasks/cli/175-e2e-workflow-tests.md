---
id: "175"
title: "E2e tests for command workflows"
status: completed
priority: medium
effort: medium
type: improvement
tags:
  - testing
  - cli
parent: "173"
dependencies:
  - "174"
created: 2026-02-20
---

# E2e tests for command workflows

## Objective

Test multi-command workflows end-to-end, verifying that commands compose correctly and produce valid, parseable output. These tests exercise the happy path of the most important user journeys.

## Tasks

- [x] Test add -> list workflow: add a task, verify it appears in list output
- [x] Test add -> set -> list workflow: add a task, change its status, verify list reflects the change
- [x] Test add -> get workflow: add a task, get it by ID, verify output matches
- [x] Test add -> next workflow: add tasks with dependencies, verify next picks the unblocked one
- [x] Test graph with dependencies: create tasks with dependency edges, verify graph JSON contains correct nodes and edges
- [x] Test board output: create tasks in different statuses, verify board groups them correctly
- [x] Test validate on well-formed tasks: create valid task files, verify validate exits 0
- [x] Test JSON output parseability: parse JSON output from list, get, graph, next
- [x] Test YAML output parseability where supported
- [x] Test flag wiring: verify flags like `--status`, `--priority`, `--format` affect output end-to-end

## Acceptance Criteria

- Workflow tests cover add, list, set, get, next, graph, validate, and board commands
- All JSON output is parsed and structurally validated (not just string matching)
- Flag combinations are tested (e.g. `list --status pending --format json`)
- Tests are independent — each creates its own task files from scratch
