---
id: "145"
title: "Fix ASCII graph single-child chain indentation bug"
status: completed
priority: medium
effort: small
tags: [cli, bug, graph]
created: 2026-02-17
---

# Fix ASCII graph single-child chain indentation bug

## Objective

Fix a bug where `taskmd graph --format ascii` rendered single-child dependency chains as flat root-level nodes with no tree connectors, making them indistinguishable from independent tasks.

## Problem

In `ToASCII`, the child prefix logic at `graph.go:374` had the condition:

```go
if prefix != "" || len(children) > 1 || i > 0 {
```

When a root node (prefix `""`) had exactly one child, all three conditions were false. The child inherited an empty prefix and rendered at the root level. This cascaded through the entire chain.

**Before (broken):**
```
[141] Add Windows ARM64 binary to release workflow
[142] Create Scoop bucket for Windows package manager
[144] Update installation docs with Windows instructions
```

**After (fixed):**
```
[141] Add Windows ARM64 binary to release workflow
    └── [142] Create Scoop bucket for Windows package manager
        └── [144] Update installation docs with Windows instructions
```

## Solution

Replaced the condition with `isLast || prefix == ""`. This always computes child indentation, while using blank spacing (not `│`) for root-level children since roots don't have tree connectors between them.

## Tasks

- [x] Add failing test `TestToASCII_SingleChildChain_ShowsIndentation` covering both auto-detected and explicit root cases
- [x] Fix child prefix condition in `graph.go`
- [x] Remove stale comment documenting bug as expected behavior
- [x] Verify all existing graph tests pass

## Files Changed

- `apps/cli/internal/graph/graph.go` — fixed child prefix logic
- `apps/cli/internal/graph/graph_test.go` — added regression test, removed stale comment
