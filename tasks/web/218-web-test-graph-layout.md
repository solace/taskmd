---
id: "218"
title: "Test graph layout logic and search highlighting"
status: pending
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

- [ ] Test `useGraphLayout` in `components/graph/useGraphLayout.ts` (empty data, node positioning, edge mapping)
- [ ] Refactor: extract the layout computation from the hook into a pure function (e.g. `computeGraphLayout(data)`) so it can be tested without `renderHook`
- [ ] Test `GraphPage` search matching logic (matched node IDs, filtered data based on status toggles)
- [ ] Refactor: extract `matchedNodeIds` and `filteredData` computations from `GraphPage.tsx` into pure utility functions if they are complex enough to warrant it

## Acceptance Criteria

- Graph layout computation is tested with at least 3 cases (empty, single node, multi-node with edges)
- Search matching and status filtering logic is tested
- All new tests pass via `pnpm test`
