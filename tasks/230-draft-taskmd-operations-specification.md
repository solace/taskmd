---
title: "Draft taskmd operations specification"
id: "230"
status: completed
priority: high
effort: medium
type: feature
tags: ["spec", "api", "documentation"]
created: "2026-02-28"
---

# Draft taskmd operations specification

## Objective

Document the behavioral contracts for all core taskmd operations so that library implementations in any language produce consistent, predictable results. This spec complements the existing format specification (`docs/taskmd_specification.md`) by defining *what operations do*, not what files look like.

## Tasks

- [x] Define scanning behavior — which files are task files, directory traversal rules, group inference from directory names, handling of nested directories and dotfiles
- [x] Define filtering semantics — how multiple filters combine (AND/OR), tag matching (exact vs partial), status/priority/effort matching, negation
- [x] Define validation rules — required fields, enum validation, duplicate ID detection, circular dependency detection, dangling dependency references, file naming conventions
- [x] Define next-task ranking algorithm — how priority, effort, dependencies, blocked status, and age factor into the ranking order
- [x] Define dependency resolution — when a dependency is "met" (which statuses count), transitive dependency handling, blocked status inference
- [x] Define graph construction — node/edge semantics, cycle detection, subgraph extraction
- [x] Define search behavior — which fields are searchable, matching rules (case sensitivity, partial match)
- [x] Create a conformance test fixtures directory with sample task files and expected outputs for each operation
- [x] Write the spec document (`docs/taskmd_operations.md`)
- [x] Review against current Go implementation to ensure the spec matches actual behavior

## Acceptance Criteria

- `docs/taskmd_operations.md` exists and covers all core operations (scan, filter, validate, next, graph, search)
- Each operation section defines inputs, outputs, and edge case behavior
- A `tests/conformance/` directory contains fixture files and expected results that any implementation can test against
- The current Go CLI passes all conformance tests
- The spec is referenced from the main taskmd specification document
