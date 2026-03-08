---
id: "01kk60r70"
title: "Benchmark get-task-status skill"
status: pending
priority: medium
dependencies: []
tags: ["benchmark", "skill-eval"]
created: 2026-03-08
---

# Benchmark get-task-status skill

## Objective

Run the get-task-status skill in an isolated project and evaluate quality, accuracy, token usage, and latency.

## Tasks

- [ ] Create isolated temp dir and run `taskmd init`
- [ ] Copy fixture tasks from `benchmark/fixtures/tasks/` into the project
- [ ] Invoke the `/taskmd:get-task-status` skill with prompt: "what's the status of task 002?"
- [ ] Record token usage and duration
- [ ] Evaluate: did it run `taskmd status 002`? Did it show status as pending? Did it show metadata?
- [ ] Save results to `benchmark/iteration-1/eval-3-get-task-status/with_skill/outputs/`

## Acceptance Criteria

- Skill runs `taskmd status` with the task ID
- Output shows task status (pending) and priority (medium)
- Token usage and duration are recorded
