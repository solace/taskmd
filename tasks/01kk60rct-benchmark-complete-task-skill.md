---
id: "01kk60rct"
title: "Benchmark complete-task skill"
status: pending
priority: medium
dependencies: []
tags: ["benchmark", "skill-eval"]
created: 2026-03-08
---

# Benchmark complete-task skill

## Objective

Run the complete-task skill in an isolated project and evaluate quality, accuracy, token usage, and latency.

## Tasks

- [ ] Create isolated temp dir and run `taskmd init`
- [ ] Copy fixture tasks from `benchmark/fixtures/tasks/` into the project
- [ ] Invoke the `/taskmd:complete-task` skill with prompt: "mark task 001 as done"
- [ ] Record token usage and duration
- [ ] Evaluate: did it check workflow mode? Did it run `taskmd set --status completed --verify`? Did it confirm?
- [ ] Save results to `benchmark/iteration-1/eval-6-complete-task/with_skill/outputs/`

## Acceptance Criteria

- Skill checks `.taskmd.yaml` for workflow mode
- Runs `taskmd set` with `--status completed --verify`
- Confirms the status change
- Token usage and duration are recorded
