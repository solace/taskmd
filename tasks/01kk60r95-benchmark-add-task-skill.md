---
id: "01kk60r95"
title: "Benchmark add-task skill"
status: pending
priority: medium
dependencies: []
tags: ["benchmark", "skill-eval"]
created: 2026-03-08
---

# Benchmark add-task skill

## Objective

Run the add-task skill in an isolated project and evaluate quality, accuracy, token usage, and latency.

## Tasks

- [ ] Create isolated temp dir and run `taskmd init`
- [ ] Copy fixture tasks from `benchmark/fixtures/tasks/` into the project
- [ ] Invoke the `/taskmd:add-task` skill with prompt: "create a new task to implement user notifications via email and in-app, high priority, tags: notifications,backend"
- [ ] Record token usage and duration
- [ ] Evaluate: did it run `taskmd add` with correct flags? Did it fill in content? Did it validate? Did it confirm?
- [ ] Save results to `benchmark/iteration-1/eval-4-add-task/with_skill/outputs/`

## Acceptance Criteria

- Skill runs `taskmd add` with title and flags (--priority high, --tags)
- Placeholder content is replaced with real objective, tasks, and acceptance criteria
- Runs `taskmd validate` after creation
- Reports created file path and task ID
- Token usage and duration are recorded
