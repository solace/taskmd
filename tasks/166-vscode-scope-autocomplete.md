---
id: "166"
title: "VSCode extension: scope autocomplete for touches field"
status: pending
priority: low
effort: small
tags: []
touches:
  - vscode
created: 2026-02-20
---

# VSCode Extension: Scope Autocomplete for Touches Field

## Objective

Read scope definitions from `.taskmd.yaml` and suggest them when editing the `touches` field, preventing typos and ensuring consistency with configured scopes.

## Tasks

- [ ] Read the `scopes` map from `.taskmd.yaml` (reuse config resolution from `config.ts`)
- [ ] Implement completions inside `touches:` array values
- [ ] Show scope name as the label and scope description (if present) as the detail
- [ ] Add tests for scope parsing and completion triggering

## Acceptance Criteria

- Typing inside `touches: [` suggests scope names defined in `.taskmd.yaml`
- Scope descriptions appear as completion details when available
- No completions when `.taskmd.yaml` has no scopes defined
- Completions refresh if `.taskmd.yaml` is modified
