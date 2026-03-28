---
title: "Create shared test utilities for web app"
id: "01kmsmkh1"
status: completed
priority: medium
type: chore
tags: ["testing", "quality"]
created: "2026-03-28"
phase: web-ui
---

# Create shared test utilities for web app

## Objective

Create shared test utilities to reduce boilerplate and friction when writing new tests. These helpers are a prerequisite for efficiently reaching the coverage milestones defined in `apps/web/TESTING.md`.

## Tasks

- [x] Create `src/test-utils/mock-api.ts` with pre-built mock responses for common API calls (`/tasks`, `/stats`, `/config`, `/board`)
- [x] Create `src/test-utils/render.ts` with a `renderWithProviders` helper that wraps components with router + query client
- [x] Create `src/test-utils/fixtures.ts` with factory functions (`createTask()`, `createStats()`, `createConfig()`) for building test data
- [x] Create `src/test-utils/keyboard.ts` with helpers for simulating keyboard navigation sequences
- [x] Add a barrel export `src/test-utils/index.ts`
- [x] Refactor at least 2 existing test files to use the new utilities and verify they still pass

## Acceptance Criteria

- All test utility files exist under `src/test-utils/`
- `renderWithProviders` correctly sets up router and query client context
- Factory functions produce valid typed test data matching `api/types.ts`
- At least 2 existing tests are refactored to use the new helpers
- All existing tests still pass after refactoring
