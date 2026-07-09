---
title: "Port multigraph features to CLI graph command"
id: "232"
status: completed
priority: medium
effort: medium
type: feature
tags: ["cli", "graph", "feature"]
related: ["231"]
created: "2026-07-08"
---

# Port Multigraph Features to CLI Graph Command

## Objective

Carry over the feasible subset of the web multigraph view (task 231) to the CLI `taskmd graph` command. The web view has interactive, visual-only features (LOD, hover dimming, click-to-focus) that have no CLI equivalent, but several structural features translate cleanly to text output formats.

All four additions are flag-enabled rather than default behaviour, since they change output structure in ways that would break existing scripts or pipelines.

## Tasks

### Step 1 — `RenderOptions` struct + signature migration (foundation)
- [x] Define `RenderOptions` struct and `DefaultRenderOptions()` in `sdk/go/graph/graph.go`
  - Fields: `FocusTaskID string`, `ShowRelated bool` (default true), `ShowSpawnedBy bool` (default true), `ShowParent bool` (default false), `Subgraphs bool` (default false)
- [x] Update `ToMermaid(opts RenderOptions)`, `ToDot(opts RenderOptions)`, `ToASCII(rootID string, downstream bool, f *ASCIIFormatter, opts RenderOptions)`, `ToJSON(opts RenderOptions) map[string]any` signatures
- [x] Move `focusTaskID` string parameter into `opts.FocusTaskID` for Mermaid and DOT
- [x] Update all callers in `apps/cli/internal/cli/graph.go` to pass `graph.DefaultRenderOptions()` (with `FocusTaskID` set where applicable)
- [x] Update SDK test callers in `sdk/go/graph/graph_test.go`
- [x] Verify: `go test ./...` passes with zero behaviour change

### Step 2 — Depth-limited traversal + `--depth`
- [x] Add `GetDownstreamN(taskID string, depth int) map[string]bool` to `sdk/go/graph/graph.go` — depth ≤ 0 delegates to `GetDownstream`
- [x] Add `GetUpstreamN(taskID string, depth int) map[string]bool` — depth ≤ 0 delegates to `GetUpstream`
- [x] Add `graphDepth int` flag to `apps/cli/internal/cli/graph.go` (`--depth`, default 0)
- [x] In `runGraph`: return error `"--depth requires --root"` if `graphDepth > 0 && graphRoot == ""`
- [x] In `runGraph`: use `GetDownstreamN`/`GetUpstreamN` when `graphDepth > 0`
- [x] SDK unit tests: depth 0 (unlimited), depth 1 (direct only), depth 2 (two hops), depth exceeds graph size
- [x] CLI integration tests: `--depth 1 --root X --downstream`, `--depth` without `--root` errors, `--depth 0` behaves as unlimited
- [x] Add `graphDepth = 0` to `resetGraphFlags()`

### Step 3 — Edge suppression + `--preset`
- [x] Gate `-.-` block in `ToMermaid` on `opts.ShowRelated`; gate `-.->` on `opts.ShowSpawnedBy`
- [x] Gate `style=dashed` block in `ToDot` on `opts.ShowRelated`; gate `style=dotted` on `opts.ShowSpawnedBy`
- [x] Gate `~ related` annotation in `ToASCII` on `opts.ShowRelated`; gate `(spawned by X)` on `opts.ShowSpawnedBy`
- [x] Omit `"relatedEdges"` key from `ToJSON` output when `!opts.ShowRelated`; omit `"spawnedByEdges"` when `!opts.ShowSpawnedBy`
- [x] Add `graphPreset string` flag (`--preset`, default `""`)
- [x] Resolve preset → opts in `runGraph` before render; explicit flags override preset
- [x] CLI tests: `--preset deps-only` suppresses both edge types in all four formats; `--preset related` suppresses only spawned-by; `--preset provenance` suppresses only related
- [x] Add `graphPreset = ""` to `resetGraphFlags()`

### Step 4 — Parent edges + `--parent-edges`
- [x] Collect `ParentEdges [][2]string` (`[child, parent]`) in `NewGraph` — only include pairs where parent task exists in the graph
- [x] Render in `ToMermaid` when `opts.ShowParent`: `child --o parent`
- [x] Render in `ToDot` when `opts.ShowParent`: `child -> parent [arrowhead=odiamond, dir=forward, style=solid, color="#6366f1"]`
- [x] Render in `ToASCII` when `opts.ShowParent`: append `(child of PARENT_ID)` to annotation line
- [x] Add `"parentEdges"` array to `ToJSON` when `opts.ShowParent`, entries `{"child":"...", "parent":"..."}`
- [x] Add `graphParentEdges bool` flag (`--parent-edges`, default false)
- [x] Set `opts.ShowParent = true` when `graphParentEdges` or `graphPreset == "full"`
- [x] CLI tests: `--parent-edges` in all four formats; absent by default; `--preset full` implies parent edges
- [x] Add `graphParentEdges = false` to `resetGraphFlags()`

### Step 5 — Subgraph grouping + `--subgraphs`
- [x] Add `classifyByGroup(tasks []*model.Task, hasDepEdge map[string]bool) (phases, scopes map[string][]string, topLevel []string)` helper in `sdk/go/graph/graph.go`
  - `hasDepEdge`: set of task IDs that have at least one dep edge in or out
  - Task with `phase` set → phase group (regardless of isolation)
  - Isolated task (not in `hasDepEdge`, no parent, no phase) with `touches[0]` → scope group
  - Otherwise → top-level
- [x] `ToMermaid` with `opts.Subgraphs`: emit phase/scope groups as `subgraph X\n...\nend` blocks; top-level tasks flat as today; extract `writeMermaidGroups` helper to stay under 60-line limit
- [x] `ToDot` with `opts.Subgraphs`: emit groups as `subgraph cluster_X { label="X"; ... }` blocks; extract `writeDotGroups` helper
- [x] ASCII and JSON: no change
- [x] Add `graphSubgraphs bool` flag (`--subgraphs`, default false)
- [x] Set `opts.Subgraphs = true` when `graphSubgraphs` or `graphPreset == "full"`
- [x] CLI tests: `--subgraphs` produces `subgraph`/`cluster` blocks in Mermaid/DOT; ASCII/JSON unaffected; `--preset full` implies subgraphs
- [x] Add `graphSubgraphs = false` to `resetGraphFlags()`
- [x] Verify: `make lint` passes (check function lengths)

## New Flags Summary

```
--subgraphs          Group tasks by phase/scope in Mermaid and DOT output
--depth N            Limit --root traversal to N hops (default: unlimited)
--preset NAME        deps-only | related | provenance | full
--parent-edges       Render parent→child edges (Mermaid, DOT, ASCII, JSON)
```

## Acceptance Criteria

- `--subgraphs` produces `subgraph`/`cluster` blocks in Mermaid and DOT; no change to ASCII or JSON
- `--depth 1 --root X --downstream` returns only direct dependents of X
- `--depth 0` or omitting `--depth` preserves existing transitive behaviour
- `--preset deps-only` omits `relatedEdges` and `spawnedByEdges` from JSON; omits `-.-` and `-.->` lines from Mermaid; omits dashed/dotted edges from DOT; omits `~` and `(spawned by)` annotations from ASCII
- `--parent-edges` renders parent relationships in all four formats
- `--preset full` is equivalent to `--parent-edges` with all edge types shown
- All new flags have tests
- No existing tests break (all flags default to current behaviour)
</content>
