# Spec: CLI Graph Multigraph Features

**Status:** Complete — all features implemented  
**Task:** 232  
**Date:** 2026-07-08

---

## Objective

Add four flag-gated features to `taskmd graph` that port the structural/relational capabilities of the web multigraph view to CLI output formats. All features are off by default to preserve backward compatibility with existing scripts and pipelines.

Users:
- Developer who wants to see phase or scope groupings in a Mermaid/DOT diagram they embed in docs
- Developer tracing a dependency chain to a specific depth (not the full transitive closure)
- Developer who needs a clean deps-only view for sharing (without related/spawned-by noise)
- Developer who uses `parent:` relationships and wants to see them as edges, not just node metadata

---

## Tech Stack

- Go 1.22+
- `sdk/go/graph/graph.go` — core graph struct, rendering functions
- `apps/cli/internal/cli/graph.go` — CLI flag definitions, `runGraph`
- `apps/cli/internal/cli/graph_test.go` — CLI integration tests
- `sdk/go/graph/graph_test.go` — SDK unit tests

---

## Commands

```bash
# Build and test
cd apps/cli && go build ./...
cd apps/cli && go test ./...
cd apps/cli && go test ./internal/cli -run TestGraph -v

# Lint
cd apps/cli && make lint

# Full check
cd apps/cli && make check

# Manual smoke test (after make install-dev)
taskmd-dev graph --subgraphs --format mermaid tasks/
taskmd-dev graph --root 003 --downstream --depth 1
taskmd-dev graph --preset deps-only --format json tasks/
taskmd-dev graph --parent-edges --format dot tasks/
```

---

## Project Structure

Files touched by this feature:

```
sdk/go/graph/
  graph.go          ← GetUpstreamN, GetDownstreamN, ToMermaid/ToDot/ToASCII/ToJSON options struct
  graph_test.go     ← unit tests for new SDK functions

apps/cli/internal/cli/
  graph.go          ← --depth, --preset, --subgraphs, --parent-edges flags + runGraph wiring
  graph_test.go     ← CLI integration tests for all four flags
```

No new files needed.

---

## Code Style

### Options struct pattern (preferred over parameter explosion)

The rendering functions (`ToMermaid`, `ToDot`, `ToASCII`, `ToJSON`) currently take 1–2 parameters. Adding 3+ new booleans to each signature is unwieldy. Use an options struct instead:

```go
type RenderOptions struct {
    FocusTaskID  string
    Subgraphs    bool
    ShowRelated  bool // default true — preset can suppress
    ShowSpawnedBy bool // default true
    ShowParent   bool // --parent-edges or --preset full
}

func DefaultRenderOptions() RenderOptions {
    return RenderOptions{ShowRelated: true, ShowSpawnedBy: true}
}

func (g *Graph) ToMermaid(opts RenderOptions) string { ... }
func (g *Graph) ToDot(opts RenderOptions) string { ... }
func (g *Graph) ToASCII(rootTaskID string, downstream bool, f *ASCIIFormatter, opts RenderOptions) string { ... }
func (g *Graph) ToJSON(opts RenderOptions) map[string]any { ... }
```

This is a breaking change to the SDK signatures. All callers are internal (`apps/cli`), so this is acceptable.

### Depth-limited traversal

```go
// GetDownstreamN returns dependents up to depth hops. depth <= 0 means unlimited.
func (g *Graph) GetDownstreamN(taskID string, depth int) map[string]bool {
    visited := make(map[string]bool)
    var visit func(id string, remaining int)
    visit = func(id string, remaining int) {
        if visited[id] || remaining == 0 {
            return
        }
        visited[id] = true
        for _, dep := range g.Adjacency[id] {
            visit(dep, remaining-1)
        }
    }
    visit(taskID, depth)
    delete(visited, taskID)
    return visited
}
```

depth ≤ 0 → call existing unlimited version (or pass `math.MaxInt`).

### Subgraph classification (mirrors web cluster.ts)

```go
func classifyByGroup(tasks []*model.Task, depNodeIDs map[string]bool) map[string][]string {
    // Returns map of groupKey → []taskID
    // groupKey: "phase:X" | "scope:X" | "" (top-level)
    // A task is isolated if it has no dep edges in or out.
}
```

### Preset resolution (in CLI, before render)

```go
opts := graph.DefaultRenderOptions()
switch graphPreset {
case "deps-only":
    opts.ShowRelated, opts.ShowSpawnedBy = false, false
case "related":
    opts.ShowSpawnedBy = false
case "provenance":
    opts.ShowRelated = false
case "full":
    opts.ShowParent = true
    opts.Subgraphs = true  // mirrors web Default: clustering on
}
// Explicit flags override preset
if graphParentEdges {
    opts.ShowParent = true
}
if graphSubgraphs {
    opts.Subgraphs = true
}
```

---

## Testing Strategy

**Framework:** Go `testing` package, same file as existing tests.

**Test locations:**
- `sdk/go/graph/graph_test.go` — unit tests for `GetDownstreamN`, `GetUpstreamN`, subgraph classification
- `apps/cli/internal/cli/graph_test.go` — integration tests for all four CLI flags

**Coverage requirements:**
- `GetDownstreamN`/`GetUpstreamN`: depth 0 (unlimited), depth 1 (direct only), depth 2 (two hops), depth exceeds graph size
- `--subgraphs`: verify `subgraph`/`cluster` keywords appear in Mermaid/DOT; verify JSON/ASCII unaffected
- `--preset deps-only`: verify related and spawned-by suppressed in all four formats
- `--preset related`/`provenance`/`full`: verify correct edge visibility per format
- `--parent-edges`: verify `parentEdges` in JSON, `--o` in Mermaid, `odiamond` in DOT, `(child of X)` in ASCII
- `--depth` without `--root`: returns an error ("--depth requires --root")
- `resetGraphFlags()` must reset all four new flags

**Test helper:** extend `createRelatedGraphTestFiles` or create `createParentGraphTestFiles` with tasks that have `parent:`, `phase:`, and `touches:` set.

---

## Boundaries

- **Always:** Add to `resetGraphFlags()` for every new flag variable. Run `make check` before done.
- **Always:** Default values preserve existing output exactly — zero new output on any existing test.
- **Ask first:** Any change to `ToJSON` key names (`relatedEdges`, `spawnedByEdges`) — downstream consumers may rely on these.
- **Never:** Change behaviour when new flags are absent. No existing test should need updating.
- **Never:** Add `--subgraphs` output to ASCII or JSON — not applicable to those formats.

---

## Success Criteria

1. `taskmd graph --subgraphs --format mermaid` wraps tasks with a `phase:` value in `subgraph phase_X ... end` blocks; isolated tasks with `touches` get `subgraph scope_X ... end`
2. `taskmd graph --subgraphs --format dot` wraps same groups in `subgraph cluster_X { label="X"; ... }`
3. `taskmd graph --root X --downstream --depth 1` returns only direct dependents; `--depth 2` adds their dependents
4. `taskmd graph --depth 1` without `--root` returns an error: `--depth requires --root`
5. `taskmd graph --preset deps-only` omits `-.-`, `-.->` from Mermaid; omits `style=dashed`/`style=dotted` from DOT; omits `~` and `(spawned by)` from ASCII; omits `relatedEdges` and `spawnedByEdges` keys from JSON
6. `taskmd graph --preset full` shows all edge types (related, spawned-by, parent) and enables subgraphs — equivalent to `--parent-edges --subgraphs` with no edge suppression
7. `taskmd graph --parent-edges --format mermaid` emits `child --o parent` for each task with `parent:` set
8. `taskmd graph --parent-edges --format dot` emits `child -> parent [arrowhead=odiamond, ...]`
9. `taskmd graph --parent-edges --format json` includes `parentEdges` array with `{"child":..., "parent":...}` entries
10. All existing tests pass unchanged
11. `make lint` passes (function length ≤ 60 lines, complexity ≤ 15)

---

## Open Questions

None. Resolved decisions: `--depth` without `--root` is an error; `--preset full` implies `--subgraphs` (mirrors web Default clustering-on behaviour); JSON `parentEdges` only emitted with `--parent-edges` or `--preset full`.
</content>
