---
id: "215"
title: "Add coverage reporting and thresholds to web app"
status: completed
priority: medium
type: chore
effort: small
tags: ["testing", "quality"]
parent: "211"
dependencies: ["214"]
created: "2026-02-26"
---

# Add coverage reporting and thresholds to web app

## Objective

Configure code coverage reporting with `@vitest/coverage-v8` and set up baseline coverage thresholds so regressions are caught early.

## Tasks

- [x] Install `@vitest/coverage-v8`
- [x] Configure coverage reporting in Vitest config (line, branch, function metrics)
- [x] Add `test:coverage` script to `apps/web/package.json`
- [x] Set initial coverage thresholds (3% lines/statements, 10% branches/functions)
- [x] Verify HTML coverage report is generated and viewable locally

## Acceptance Criteria

- `pnpm test:coverage` generates a coverage report with line, branch, and function metrics
- Coverage thresholds are configured and enforced (Vitest fails if below threshold)
- A developer can view an HTML coverage report locally
