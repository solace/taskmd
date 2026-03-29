---
title: "Raise vitest coverage thresholds to milestone levels"
id: "01kmsmmvr"
status: completed
priority: low
type: chore
tags: ["testing", "quality"]
created: "2026-03-28"
phase: web-ui
depends-on: ["01kmsmma7"]
---

# Raise vitest coverage thresholds to milestone levels

## Objective

Update the coverage thresholds in `vitest.config.ts` as each milestone is reached, so that CI prevents coverage regressions. Current thresholds are very low (5% statements, 25% branches) and should be raised incrementally.

## Tasks

- [x] After M1: raise thresholds to `statements: 60, branches: 80, functions: 65, lines: 60`
- [x] After M2: raise thresholds to `statements: 70, branches: 83, functions: 75, lines: 70`
- [x] After M3: raise thresholds to `statements: 78, branches: 86, functions: 83, lines: 78`
- [x] After M4: raise thresholds to `statements: 83, branches: 88, functions: 88, lines: 83`

## Acceptance Criteria

- Thresholds in `vitest.config.ts` are updated after each milestone is reached
- Thresholds are set ~2% below actual coverage to allow minor fluctuations without breaking CI
- All tests pass with the new thresholds
