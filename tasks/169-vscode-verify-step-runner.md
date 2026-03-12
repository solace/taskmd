---
id: "169"
title: "VSCode extension: verify step runner"
status: pending
priority: low
effort: medium
tags: []
touches:
  - vscode
created: 2026-02-20
phase: VSCode Extension
---

# VSCode Extension: Verify Step Runner

## Objective

Add CodeLens actions on `verify` blocks that let users run bash verification steps directly from the editor and see pass/fail results inline.

## Tasks

- [ ] Implement a `CodeLensProvider` that detects `verify:` blocks and individual steps
- [ ] Show "Run" action on each bash step and "Run All" above the verify block
- [ ] Execute bash steps using a VSCode terminal or task runner
- [ ] Display pass/fail status inline after execution (via diagnostics or decorations)
- [ ] Resolve `dir` field relative to project root (matching CLI behavior)
- [ ] Add tests for verify step detection and dir resolution

## Acceptance Criteria

- A "Run" codelens appears next to each `type: bash` verify step
- Clicking it runs the command and shows success/failure
- The `dir` field is respected (runs in the correct directory)
- Assert steps show the check text but are not executed
- Steps without `run` are not runnable
