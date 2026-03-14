---
id: "01kkpbd54"
title: "Replace deprecated command messages with did-you-mean suggestions"
status: completed
priority: medium
dependencies: []
tags: []
created: 2026-03-14
---

# Replace deprecated command messages with did-you-mean suggestions

## Objective

Replace cobra's `Deprecated` field on hidden alias commands (`show`, `update`) with a friendlier "did you mean" message. Currently running `taskmd update xyz` prints `Command "update" is deprecated, use 'set' instead` — instead it should print something like `Unknown command "update". Did you mean "set"?`. Also audit all commands and add `SuggestFor` entries where missing so cobra's built-in suggestion system covers common synonyms.

## Tasks

- [x] Remove `Deprecated` field from `showCmd` and `updateCmd`
- [x] Remove `Hidden: true` from both — instead, remove these commands entirely and rely on `SuggestFor` on the canonical commands (`getCmd`, `setCmd`) to suggest the right command
- [x] Add `"show"` to `getCmd.SuggestFor` and `"update"` to `setCmd.SuggestFor` (if not already present)
- [x] Audit all commands and add `SuggestFor` entries for commands that are missing them (e.g., `add`, `archive`, `rm`, `status`, `sync`, `worklog`, etc.). Suggest aliases to the user interactively for each.
- [x] Remove the separate `showCmd` and `updateCmd` command registrations (and their `init()` flag bindings)
- [x] Update or remove any tests that assert on deprecated command behavior
- [x] Add tests verifying that typing `taskmd show` or `taskmd update` suggests the correct command

## Acceptance Criteria

- Running `taskmd show 042` no longer prints "deprecated" — instead cobra suggests `get`
- Running `taskmd update 042` no longer prints "deprecated" — instead cobra suggests `set`
- All commands have reasonable `SuggestFor` aliases covering common synonyms
- `taskmd validate` passes
- Existing tests pass; new tests cover the suggestion behavior
