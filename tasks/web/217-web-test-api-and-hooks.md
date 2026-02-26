---
id: "217"
title: "Test API client and theme hook"
status: pending
priority: medium
type: chore
effort: small
tags: ["testing", "quality"]
dependencies: ["214"]
created: "2026-02-26"
---

# Test API client and theme hook

## Objective

Add tests for the pure-logic modules in `src/api/` and the non-trivial `use-theme` hook. These are the easiest high-value targets: small, self-contained, and no component rendering required.

## Tasks

- [ ] Test `fetcher()` in `api/client.ts` (success, non-200 status, network error)
- [ ] Test `updateTask()` in `api/client.ts` (request format, error parsing with `ApiRequestError`)
- [ ] Test `use-theme.ts` theme logic (`getSystemTheme`, `getStoredTheme`, toggle, localStorage persistence)
- [ ] Refactor: extract `getSystemTheme()` and `getStoredTheme()` as named exports if they aren't already, to make them independently testable

## Acceptance Criteria

- `api/client.ts` has tests covering success and error paths for both `fetcher` and `updateTask`
- `use-theme.ts` has tests for theme detection, persistence, and toggling
- All new tests pass via `pnpm test`
