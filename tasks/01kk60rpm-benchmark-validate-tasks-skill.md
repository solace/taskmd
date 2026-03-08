---
id: "01kk60rpm"
title: "Benchmark validate-tasks skill"
status: pending
priority: medium
dependencies: []
tags: ["benchmark", "skill-eval"]
created: 2026-03-08
---

# Benchmark validate-tasks skill

## Objective

Run the validate-tasks skill in an isolated project and evaluate quality, accuracy, token usage, and latency.

## Tasks

- [ ] Create isolated temp dir and run `taskmd init`
- [ ] Copy fixture tasks from `benchmark/fixtures/tasks/` into the project
- [ ] Create an additional malformed task file (missing required frontmatter) to test error detection
- [ ] Invoke the `/taskmd:validate-tasks` skill with prompt: "check if all my task files are valid"
- [ ] Record token usage and duration
- [ ] Evaluate: did it run `taskmd validate`? Did it detect the malformed file? Did it suggest fixes?
- [ ] Save results to `benchmark/iteration-1/eval-9-validate-tasks/with_skill/outputs/`

## Acceptance Criteria

- Skill runs `taskmd validate`
- Detects the malformed task file and reports errors
- Suggests how to fix the validation errors
- Token usage and duration are recorded
