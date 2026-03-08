---
id: "01kk60r52"
title: "Benchmark get-task skill"
status: pending
priority: medium
dependencies: []
tags: ["benchmark", "skill-eval"]
created: 2026-03-08
---

# Benchmark get-task skill

## Objective

Run the get-task skill in an isolated project and evaluate quality, accuracy, token usage, and latency.

## Tasks

- [ ] Create isolated temp dir and run `taskmd init`
- [ ] Copy fixture tasks from `benchmark/fixtures/tasks/` into the project
- [ ] Invoke the `/taskmd:get-task` skill with prompt: "show me the details of task 001"
- [ ] Record token usage and duration
- [ ] Evaluate: did it run `taskmd get 001`? Did it read the file? Did it show full details?
- [ ] Save results to `benchmark/iteration-1/eval-2-get-task/with_skill/outputs/`

## Acceptance Criteria

- Skill runs `taskmd get` with the task ID
- Skill reads the task file for full details
- Output presents ID, title, status, priority, tags, and description
- Token usage and duration are recorded
