---
id: "01kk60r70"
title: "Benchmark get-task-status skill"
status: pending
priority: medium
dependencies: []
tags: ["benchmark", "skill-eval"]
created: 2026-03-08
phase: Skill Benchmarks
---

# Benchmark get-task-status skill

## Objective

Run the get-task-status skill **with and without** the taskmd skill loaded in an isolated project, then compare quality, accuracy, token usage, and latency.

## Tasks

- [ ] Create isolated temp dir, run `taskmd init`, copy fixtures from `benchmark/fixtures/tasks/`
- [ ] Run **without_skill** baseline: `claude -p "what's the status of task 002?"` (no skill loaded)
- [ ] Save without_skill output to `benchmark/iteration-1/eval-3-get-task-status/without_skill/outputs/result.md`
- [ ] Run **with_skill** variant: `claude -p "what's the status of task 002?" --allowedTools "taskmd:*"` (skill loaded)
- [ ] Save with_skill output to `benchmark/iteration-1/eval-3-get-task-status/with_skill/outputs/result.md`
- [ ] Record token usage and duration in `timing.json` for both runs
- [ ] Grade both runs against assertions in `eval_metadata.json`, save `grading.json` for each
- [ ] Run `aggregate_benchmark.py` to produce `benchmark.json` and `benchmark.md` with comparison deltas
- [ ] Evaluate: compare quality, accuracy, tokens, and latency between with/without skill

## Acceptance Criteria

- Both with_skill and without_skill runs are executed and recorded
- Grading.json files exist for both configurations with assertion results
- benchmark.json contains comparison deltas (pass_rate, tokens, time)
- Token usage and duration recorded in timing.json for both runs
