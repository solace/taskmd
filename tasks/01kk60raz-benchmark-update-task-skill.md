---
id: "01kk60raz"
title: "Benchmark update-task skill"
status: pending
priority: medium
dependencies: []
tags: ["benchmark", "skill-eval"]
created: 2026-03-08
---

# Benchmark update-task skill

## Objective

Run the update-task skill in an isolated project and evaluate quality, accuracy, token usage, and latency.

## Tasks

- [ ] Create isolated temp dir and run `taskmd init`
- [ ] Copy fixture tasks from `benchmark/fixtures/tasks/` into the project
- [ ] Invoke the `/taskmd:update-task` skill with prompt: "change task 002 to high priority and add the tag backend"
- [ ] Record token usage and duration
- [ ] Evaluate: did it look up the task? Did it run `taskmd set` with correct flags? Did it confirm?
- [ ] Save results to `benchmark/iteration-1/eval-5-update-task/with_skill/outputs/`

## Acceptance Criteria

- Skill looks up the task with `taskmd get`
- Runs `taskmd set` with `--priority high --add-tag backend`
- Confirms changes to the user
- Token usage and duration are recorded
