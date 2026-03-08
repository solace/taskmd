---
id: "01kk60rrh"
title: "Benchmark import-todos skill"
status: pending
priority: medium
dependencies: []
tags: ["benchmark", "skill-eval"]
created: 2026-03-08
---

# Benchmark import-todos skill

## Objective

Run the import-todos skill in an isolated project and evaluate quality, accuracy, token usage, and latency.

## Tasks

- [ ] Create isolated temp dir and run `taskmd init`
- [ ] Copy fixture tasks from `benchmark/fixtures/tasks/` into the project
- [ ] Copy fixture source files from `benchmark/fixtures/src/` into `src/`
- [ ] Invoke the `/taskmd:import-todos` skill with prompt: "find all the TODO comments in the code and turn them into tasks"
- [ ] Record token usage and duration
- [ ] Evaluate: did it run `taskmd todos list`? Did it present a table? Did it check duplicates? Did it ask which to convert?
- [ ] Save results to `benchmark/iteration-1/eval-12-import-todos/with_skill/outputs/`

## Acceptance Criteria

- Skill runs `taskmd todos list --format json`
- Displays TODOs in a numbered table format
- Checks existing tasks for duplicates
- Asks user which TODOs to convert
- Token usage and duration are recorded
