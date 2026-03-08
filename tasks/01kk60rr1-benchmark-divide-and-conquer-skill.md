---
id: "01kk60rr1"
title: "Benchmark divide-and-conquer skill"
status: pending
priority: medium
dependencies: []
tags: ["benchmark", "skill-eval"]
created: 2026-03-08
---

# Benchmark divide-and-conquer skill

## Objective

Run the divide-and-conquer skill in an isolated project and evaluate quality, accuracy, token usage, and latency.

## Tasks

- [ ] Create isolated temp dir and run `taskmd init`
- [ ] Copy fixture tasks from `benchmark/fixtures/tasks/` into the project
- [ ] Invoke the `/taskmd:divide-and-conquer` skill with prompt: "task 002 is too big, can you split it into smaller pieces?"
- [ ] Record token usage and duration
- [ ] Evaluate: did it read the task? Did it assess complexity? Did it create sub-tasks? Did it report the split?
- [ ] Save results to `benchmark/iteration-1/eval-11-divide-and-conquer/with_skill/outputs/`

## Acceptance Criteria

- Skill reads the task to understand scope
- Evaluates complexity and explains why splitting is warranted
- Creates focused sub-task files
- Lists created sub-tasks with IDs and titles
- Token usage and duration are recorded
