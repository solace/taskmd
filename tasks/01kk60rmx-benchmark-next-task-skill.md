---
id: "01kk60rmx"
title: "Benchmark next-task skill"
status: pending
priority: medium
dependencies: []
tags: ["benchmark", "skill-eval"]
created: 2026-03-08
---

# Benchmark next-task skill

## Objective

Run the next-task skill in an isolated project and evaluate quality, accuracy, token usage, and latency.

## Tasks

- [ ] Create isolated temp dir and run `taskmd init`
- [ ] Copy fixture tasks from `benchmark/fixtures/tasks/` into the project
- [ ] Invoke the `/taskmd:next-task` skill with prompt: "what should I work on next?"
- [ ] Record token usage and duration
- [ ] Evaluate: did it run `taskmd next`? Did it read the recommended task? Did it present a summary? Did it recommend the critical-priority task (003) first?
- [ ] Save results to `benchmark/iteration-1/eval-7-next-task/with_skill/outputs/`

## Acceptance Criteria

- Skill runs `taskmd next`
- Reads the recommended task file for full details
- Presents task summary with ID, title, priority, description
- Recommends the critical-priority task (003) first
- Token usage and duration are recorded
