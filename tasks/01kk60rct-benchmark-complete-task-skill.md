---
id: "01kk60rct"
title: "Benchmark complete-task skill"
status: pending
priority: medium
dependencies: []
tags: ["benchmark", "skill-eval"]
created: 2026-03-08
---

# Benchmark complete-task skill

## Objective

Run the complete-task skill **with and without** the taskmd skill loaded in an isolated project, then compare quality, accuracy, token usage, and latency.

## Tasks

- [ ] Create isolated temp dir, run `taskmd init`, copy fixtures from `benchmark/fixtures/tasks/`
- [ ] Run **without_skill** baseline: `claude -p "mark task 001 as done"` (no skill loaded)
- [ ] Save without_skill output to `benchmark/iteration-1/eval-6-complete-task/without_skill/outputs/result.md`
- [ ] Run **with_skill** variant: `claude -p "mark task 001 as done" --allowedTools "taskmd:*"` (skill loaded)
- [ ] Save with_skill output to `benchmark/iteration-1/eval-6-complete-task/with_skill/outputs/result.md`
- [ ] Record token usage and duration in `timing.json` for both runs
- [ ] Grade both runs against assertions in `eval_metadata.json`, save `grading.json` for each
- [ ] Run `aggregate_benchmark.py` to produce `benchmark.json` and `benchmark.md` with comparison deltas
- [ ] Evaluate: compare quality, accuracy, tokens, and latency between with/without skill

## Acceptance Criteria

- Both with_skill and without_skill runs are executed and recorded
- Grading.json files exist for both configurations with assertion results
- benchmark.json contains comparison deltas (pass_rate, tokens, time)
- Token usage and duration recorded in timing.json for both runs
