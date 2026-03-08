---
id: "01kk60r2g"
title: "Benchmark list-tasks skill"
status: pending
priority: medium
dependencies: []
tags: ["benchmark", "skill-eval"]
created: 2026-03-08
---

# Benchmark list-tasks skill

## Objective

Run the list-tasks skill in an isolated project and evaluate quality, accuracy, token usage, and latency.

## Tasks

- [ ] Create isolated temp dir and run `taskmd init`
- [ ] Copy fixture tasks from `benchmark/fixtures/tasks/` into the project
- [ ] Invoke the `/taskmd:list-tasks` skill with prompt: "show me all my tasks"
- [ ] Record token usage and duration
- [ ] Evaluate: did it run `taskmd list`? Did it show all 5 tasks? Was the format readable?
- [ ] Save results to `benchmark/iteration-1/eval-1-list-tasks/with_skill/outputs/`

## Acceptance Criteria

- Skill runs `taskmd list` command
- Output shows all 5 baseline tasks
- Output is in a readable format
- Token usage and duration are recorded in timing.json
