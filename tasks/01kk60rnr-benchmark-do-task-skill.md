---
id: "01kk60rnr"
title: "Benchmark do-task skill"
status: pending
priority: medium
dependencies: []
tags: ["benchmark", "skill-eval"]
created: 2026-03-08
---

# Benchmark do-task skill

## Objective

Run the do-task skill in an isolated project and evaluate quality, accuracy, token usage, and latency.

## Tasks

- [ ] Create isolated temp dir and run `taskmd init`
- [ ] Copy fixture tasks from `benchmark/fixtures/tasks/` into the project
- [ ] Invoke the `/taskmd:do-task` skill with prompt: "pick up task 003 and start working on it"
- [ ] Record token usage and duration
- [ ] Evaluate: did it look up the task? Did it mark as in-progress? Did it start a worklog? Did it begin working?
- [ ] Save results to `benchmark/iteration-1/eval-8-do-task/with_skill/outputs/`

## Acceptance Criteria

- Skill runs `taskmd get` to find the task
- Sets task status to in-progress
- Creates or appends a worklog entry
- Starts working on the task objective
- Token usage and duration are recorded
