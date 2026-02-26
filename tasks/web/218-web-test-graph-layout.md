---
id: "218"
title: "Test graph layout logic and search highlighting"
status: completed
priority: medium
type: chore
effort: small
tags: ["testing", "quality"]
dependencies: ["214"]
created: "2026-02-26"
---

# Test graph layout logic and search highlighting

## Objective

Add tests for the graph feature's core logic: the dagre layout computation in `useGraphLayout` and the search/filter matching in `GraphPage`. These are critical for visual correctness and are currently untested.

## Tasks

- [x] Test `useGraphLayout` in `components/graph/useGraphLayout.ts` (empty data, node positioning, edge mapping)
- [x] Refactor: extracted `computeGraphLayout(data)` as a pure function from the hook
- [x] Test `GraphPage` search matching logic (matched node IDs, filtered data based on status toggles)
- [x] Refactor: extracted `findMatchedNodeIds` and `filterGraphByStatus` into `graph-utils.ts`

## Acceptance Criteria

- Graph layout computation is tested with at least 3 cases (empty, single node, multi-node with edges)
- Search matching and status filtering logic is tested
- All new tests pass via `pnpm test`
