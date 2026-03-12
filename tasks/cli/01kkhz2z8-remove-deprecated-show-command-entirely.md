---
title: "Remove deprecated show command entirely"
id: "01kkhz2z8"
status: pending
priority: low
type: chore
tags: []
created: "2026-03-12"
---

# Remove deprecated show command entirely

## Objective

Remove all code related to the deprecated `show` command from the CLI. The `show` command was previously deprecated in favor of `get`, but the code (including the deprecation message alias) still exists. Clean it up entirely — no residual references, no deprecation shim.

## Tasks

- [ ] Remove the `showCmd` cobra command definition and its `init()` registration in `internal/cli/get.go`
- [ ] Remove any `show`-specific flag bindings (lines 82–85 in `get.go`)
- [ ] Remove any references to `show` in help text, comments, or documentation
- [ ] Verify no other files reference the `show` command (e.g., e2e tests, docs)
- [ ] Run `make test` and `make e2e` to confirm nothing breaks
- [ ] Run `make lint` to ensure no dead code warnings

## Acceptance Criteria

- Running `taskmd show` produces an unknown command error (no deprecation message)
- No `show`-related code remains in the codebase
- All tests pass
