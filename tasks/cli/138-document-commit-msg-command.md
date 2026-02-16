---
id: "138"
title: "Document the commit-msg command"
status: pending
priority: medium
effort: small
tags:
  - docs
  - cli
created: 2026-02-16
---

# Document the commit-msg command

## Objective

Add documentation for the recently added `commit-msg` CLI command to the CLI guide (`apps/docs/guide/cli.md`). The command generates conventional commit messages from task metadata and should be documented with the same level of detail as other commands in the guide, including usage examples.

## Tasks

- [ ] Add `commit-msg` to the Quick Reference table in `apps/docs/guide/cli.md`
- [ ] Add a dedicated `### commit-msg` section with description, flags table, and usage examples
- [ ] Include examples for all key workflows:
  - Single task: `taskmd commit-msg --task-id 042`
  - Custom type: `taskmd commit-msg --task-id 042 --type feat`
  - With body (subtasks): `taskmd commit-msg --task-id 042 --body`
  - Short mode: `taskmd commit-msg --task-id 042 --short`
  - Auto-detect from staged changes: `taskmd commit-msg`
  - Git integration: `git commit -m "$(taskmd commit-msg --task-id 042)"`
- [ ] Document all flags (`--task-id`, `--type`, `--body`, `--short`) in a flags table
- [ ] Explain auto-detection behavior (inspects `git diff --cached` for tasks changed to `completed`)

## Acceptance Criteria

- The `commit-msg` command appears in the Quick Reference table
- A dedicated section documents all flags with a table
- Usage examples cover single-task, multi-task (auto-detect), `--body`, `--short`, `--type`, and git integration
- Documentation style matches existing command sections in the CLI guide
