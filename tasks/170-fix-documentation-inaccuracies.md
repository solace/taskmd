---
id: "170"
title: "Fix documentation inaccuracies found in audit"
status: completed
priority: high
effort: small
type: docs
tags:
  - docs
  - cli
  - web
created: 2026-02-20
---

# Fix documentation inaccuracies found in audit

## Objective

Fix factual errors and stale information in documentation that could mislead users. These are the highest-priority items from the documentation audit.

## Tasks

- [x] Fix `--dir` vs `--task-dir` mismatch in Global Flags sections of `apps/docs/guide/cli.md` and `docs/guides/cli-guide.md` (actual flag is `--task-dir` / `-d`, not `--dir`)
- [x] Add `in-review` to `set --status` valid values in both CLI guides
- [x] Add missing `set` flags to both CLI guides: `--add-pr`, `--remove-pr`, `--type`, `--verify`
- [x] Fix stale "config not implemented" text in `docs/guides/web-guide.md:765-767` (config IS implemented)
- [x] Fix Graph view description in `apps/docs/guide/web.md` and `docs/guides/web-guide.md` — uses @xyflow/react (ReactFlow), not Mermaid diagrams
- [x] Update future features list in `docs/guides/web-guide.md:828-836` — remove items that are already implemented (drag-and-drop on Board, task editing)
- [x] Add `--debug` and `--no-color` global flags to the Global Flags sections in both CLI guides

## Acceptance Criteria

- No documentation states incorrect flag names or missing flag options
- No stale "not yet implemented" claims for features that exist
- Graph view accurately described as interactive ReactFlow visualization
- Global flags section matches actual `--help` output
