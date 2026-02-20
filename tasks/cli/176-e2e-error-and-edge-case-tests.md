---
id: "176"
title: "E2e tests for error handling and edge cases"
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

# E2e tests for error handling and edge cases

## Objective

Test that the CLI handles error conditions gracefully — returning non-zero exit codes, printing useful stderr messages, and not crashing on malformed input.

## Tasks

- [x] Test unknown command: `taskmd nonexistent` exits non-zero with helpful message
- [x] Test missing required args: e.g. `taskmd set` with no ID
- [x] Test invalid flag values: e.g. `taskmd list --status bogus`
- [x] Test validate on malformed task files: missing frontmatter, invalid YAML, missing required fields
- [x] Test operations on empty directory: list, next, graph with no task files
- [x] Test stdin/pipe behavior: pipe content to `taskmd validate --stdin`
- [x] Test invalid `--task-dir` path: non-existent directory
- [x] Verify exit codes: 0 for success, non-zero for all error cases
- [x] Verify stderr contains actionable error messages (not stack traces)

## Acceptance Criteria

- Every error scenario returns a non-zero exit code
- stderr output is user-friendly and describes what went wrong
- No panics or stack traces in error output
- stdin validation works via pipe
- Empty directory cases are handled gracefully (not treated as errors where appropriate)
