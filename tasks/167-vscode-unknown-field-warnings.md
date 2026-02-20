---
id: "167"
title: "VSCode extension: unknown field warnings"
status: pending
priority: low
effort: small
tags: []
touches:
  - vscode
created: 2026-02-20
---

# VSCode Extension: Unknown Field Warnings

## Objective

Warn users when frontmatter contains field names not in the taskmd schema, catching typos like `stauts` instead of `status` or `dependecies` instead of `dependencies`.

## Tasks

- [ ] Add validation rule that checks each frontmatter key against the known field set in `schema.ts`
- [ ] Report unknown fields as warnings (not errors, since the CLI silently ignores them)
- [ ] Highlight the key range for unknown fields
- [ ] Add tests for unknown field detection

## Acceptance Criteria

- A typo like `stauts: pending` produces a warning diagnostic
- Valid fields produce no warnings
- The `verify` field and all its sub-fields are not flagged
- Warning message includes the unknown field name
