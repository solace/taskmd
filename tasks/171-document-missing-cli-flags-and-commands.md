---
id: "171"
title: "Document missing CLI flags and commands"
status: pending
priority: medium
effort: medium
type: docs
tags:
  - docs
  - cli
created: 2026-02-20
---

# Document missing CLI flags and commands

## Objective

Fill documentation gaps for CLI commands and flags that exist in the CLI but are missing from documentation. Covers both `apps/docs/guide/cli.md` (VitePress) and `docs/guides/cli-guide.md` (standalone).

## Tasks

### VitePress CLI guide (`apps/docs/guide/cli.md`)

- [ ] Add `todos` / `todos list` command section with all flags (`--dir`, `--marker`, `--include`, `--exclude`, `--rich`, `--raw-text`, `--format`)
- [ ] Add `todos` to Quick Reference table
- [ ] Add `next --quick-wins` and `next --critical` flags to `next` command section
- [ ] Add `web export` subcommand section with flags (`--output`, `--base-path`)
- [ ] Add `web start --readonly` flag

### Standalone CLI guide (`docs/guides/cli-guide.md`)

- [ ] Add `add` command section
- [ ] Add `search` command section
- [ ] Add `verify` command section
- [ ] Add `status` command section
- [ ] Add `context` command section
- [ ] Add `worklog` command section
- [ ] Add `import` command section
- [ ] Add `spec` command section
- [ ] Add `commit-msg` command section
- [ ] Add `todos` / `todos list` command section
- [ ] Add `completion` to Quick Reference table
- [ ] Add `web export` subcommand section
- [ ] Add `next --quick-wins` and `next --critical` flags
- [ ] Add `web start --readonly` flag
- [ ] Add `get --context` flag
- [ ] Add `graph --filter` flag

## Acceptance Criteria

- Every CLI command from `taskmd --help` has a corresponding section in both CLI guides
- All flags shown by `<command> --help` are documented in the respective command section
- New documentation follows existing style (description, flags table, examples)
