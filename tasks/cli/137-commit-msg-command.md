---
id: "137"
title: "Add commit-msg command for generating commit messages from tasks"
status: completed
priority: medium
effort: medium
tags: [cli, git, dx]
created: 2026-02-16
---

# Add commit-msg command for generating commit messages from tasks

## Objective

Add a `taskmd commit-msg` command that generates conventional commit messages from task metadata. This enables a workflow like:

```bash
git add . && git commit -m "$(taskmd commit-msg --task-id 042)"
```

When no `--task-id` is provided, the command should infer which tasks are being completed by inspecting the staged git diff (`git diff --cached`) for task files whose status changed to `completed`.

## Tasks

- [ ] Create `internal/cli/commit_msg.go` with cobra command scaffolding
- [ ] Implement task type to commit prefix mapping (`feature`→`feat`, `bug`→`fix`, `chore`→`chore`, `docs`→`docs`, `test`→`test`, `refactor`→`refactor`)
- [ ] Implement `--task-id` flag to look up a specific task and generate a message
- [ ] Implement auto-inference: parse `git diff --cached` to find staged task files with status changing to `completed`
- [ ] Implement `--type` flag to override the commit prefix
- [ ] Implement `--body` flag to include completed subtasks as bullet points
- [ ] Implement `--short` flag for subject-line-only output
- [ ] Handle multi-task commits (multiple tasks completed in one commit)
- [ ] Add comprehensive tests in `internal/cli/commit_msg_test.go`
- [ ] Register command in root command

## Acceptance Criteria

- `taskmd commit-msg --task-id 042` outputs a conventional commit message derived from task 042's title and type
- `taskmd commit-msg` (no ID) detects staged task files changing to `completed` and generates a message from them
- Task type maps to the correct conventional commit prefix
- `--type` overrides the inferred prefix
- `--body` appends completed subtask checkboxes as bullet points in the commit body
- `--short` outputs only the subject line
- Multi-task commits produce a sensible combined message
- All flags and edge cases have test coverage
- Command is shell-friendly: output is plain text with no ANSI codes
