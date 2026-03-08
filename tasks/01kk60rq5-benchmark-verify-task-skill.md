---
id: "01kk60rq5"
title: "Benchmark verify-task skill"
status: pending
priority: medium
dependencies: []
tags: ["benchmark", "skill-eval"]
created: 2026-03-08
---

# Benchmark verify-task skill

## Objective

Run the verify-task skill in an isolated project and evaluate quality, accuracy, token usage, and latency.

## Tasks

- [ ] Create isolated temp dir and run `taskmd init`
- [ ] Copy fixture tasks from `benchmark/fixtures/tasks/` into the project
- [ ] Add a `verify` field to task 003 with a bash step like `grep -r sanitize src/`
- [ ] Invoke the `/taskmd:verify-task` skill with prompt: "verify the acceptance criteria for task 003"
- [ ] Record token usage and duration
- [ ] Evaluate: did it run `taskmd verify --format json`? Did it interpret results? Did it report verdict?
- [ ] Save results to `benchmark/iteration-1/eval-10-verify-task/with_skill/outputs/`

## Acceptance Criteria

- Skill runs `taskmd verify` with `--format json`
- Interprets pass/fail for each verification step
- Reports overall verdict
- Token usage and duration are recorded
