---
title: "Create incremental test coverage improvement plan"
id: "212"
status: pending
priority: low
type: chore
tags: ["testing", "quality"]
created: "2026-02-25"
phase: Web UI
---

# Create incremental test coverage improvement plan

## Description

Once the test infrastructure is in place (task 211), create a concrete plan for incrementally raising test coverage across the web app over time. This plan should prioritize high-value areas, set milestone targets, and be practical enough to follow without blocking feature work.

## Tasks

- [ ] Audit the web app codebase and categorize modules by risk/importance (core logic, utilities, UI components, pages)
- [ ] Measure baseline coverage after task 211 is complete
- [ ] Define coverage milestones (e.g. 30% → 50% → 70% → 80%) with target dates or sprint goals
- [ ] Prioritize test targets: critical paths first (data parsing, state management, API calls), then UI components
- [ ] Document the plan in a markdown file (e.g. `apps/web/TESTING.md`)
- [ ] Identify areas where testing patterns or helpers would reduce friction (e.g. test fixtures, mock factories)

## Acceptance Criteria

- A written plan exists documenting coverage milestones and priority areas
- The plan identifies the top 10 highest-value files/modules to test first
- Coverage milestones are defined with realistic increments
- The plan is reviewed and agreed upon by the team
