# Spec: Hierarchical Multigraph Graph View

**Status:** Complete — all phases implemented\
**Date:** 2026-07-08\
**Last updated:** 2026-07-09

---

## What Is Currently Implemented

| Feature                                    | Status | Notes                                                                                  |
| ------------------------------------------ | ------ | -------------------------------------------------------------------------------------- |
| ELK layout engine                          | ✅     | Using `elk.bundled.js` (synchronous); worker deferred — see decision below             |
| Phase compound regions                     | ✅     | Tasks with `phase:` frontmatter rendered inside labelled dashed-indigo containers      |
| Parent relationship                        | ✅     | Diamond edge (changed from spec — see decision below)                                  |
| Dep edge layout                            | ✅     | ELK `layered` algorithm, `elk.direction: DOWN`                                         |
| Overlay toggles                            | ✅     | Related and Spawned-by buttons in header bar, off by default                           |
| `phase` in graph API                       | ✅     | Go `ToJSON()` now emits `phase` field on each node                                     |
| `touches` in graph API                     | ✅     | Go `ToJSON()` now emits `touches` array on each node                                   |
| `touches` in TypeScript types              | ✅     | `GraphNode.touches?: string[]` added to `api/types.ts`                                 |
| Web data provider respects `ignore` config | ✅     | `data_provider.go` passes `ignoreDirs` from `.taskmd.yaml`                             |
| Scope clustering (`touches`)               | ✅     | `cluster.ts` detects isolated nodes, `__scope_X` ELK compounds with teal dashed border |
| Preset system                              | ✅     | `useGraphState` reducer: Default / Deps only / Related / Provenance / Focus            |
| Focus mode                                 | ✅     | BFS subgraph via `focus.ts`, depth 1/2/3, click-to-focus in focus preset               |
| Hover neighbourhood highlight              | ✅     | Hover dims non-adjacent nodes via adjacency set from structural edges                  |
| "Color by" scope tinting                   | ✅     | `GraphColorBy` dropdown, dot badge on nodes with matching `touches`                    |
| LOD zoom gating                            | ✅     | Overlay edges hidden below zoom 0.5; "zoom in to see" hint in overlay toggles          |
| ELK Web Worker                             | ❌     | Deferred — see decision below                                                          |
| ClusterNode component                      | ❌     | Not needed — scope compounds use `ContainerNode` directly                              |

---

## Design Decisions (Including Post-Spec Changes)

### Parent relationship: edge, not compound _(changed during implementation)_

The original spec placed tasks with `parent:` inside ELK compound nodes
(`__parent_X`). This was changed during implementation for the following
reasons:

- A parent task and its children rarely share the same dependency rank. Forcing
  them into a compound box creates tall, sparse containers and fights the
  dependency-driven layout signal.
- A parent task may belong to a different phase than its children. Compound
  containment forces co-location; an edge does not.
- The relationship is already unambiguous — a UML composition diamond edge
  (solid indigo, filled diamond at parent end) is visually clear and consistent
  with how all other relationships are shown.

**Current behaviour:** parent→child is a diamond edge
(`markerStart: "url(#rf-diamond-filled)"`). ELK also receives a `parent→child`
edge for layout ranking (ensures children appear below parents). No `__parent_`
compound nodes are created.

**Phase compounds are unaffected** — all tasks with `phase:` still go inside a
`__phase_X` compound region.

---

### ELK Web Worker: deferred _(changed during implementation)_

The original spec required the worker from day one. After assessing the
local-tool context (not a web service, not sensitive to 200–500ms layout freezes
on initial load), the worker was deferred:

- Local tool only — a brief freeze on graph open is acceptable
- `elk.bundled.js` produces identical layout results
- The hook is already async (`isLayouting` state), so adding the worker later is
  a 5-line change to the ELK instantiation in `elk-layout.ts`
- The Vite + `elk.worker.js` (classic worker / `importScripts`) integration has
  non-trivial friction

**To enable the worker:** replace the `const elk = new ELK()` line in
`elk-layout.ts` with the worker instantiation noted in the TODO comment.

---

### Overlay toggles: direct state, not preset-driven _(simplified from spec)_

The spec called for a `useReducer`-based preset system (`Default`,
`Dependencies-only`, `Related`, `Provenance`, `Focus`) that atomically
controlled overlay visibility, clustering, and focus depth.

The current implementation uses simple `useState` booleans for the two overlay
types. This is simpler and sufficient for the currently implemented features.
The preset system remains the right architecture once clustering and focus mode
are built.

---

### `ignore` config now respected by web server

Not in the original spec. The web data provider (`data_provider.go`), server
config (`server.go`), project resolver, and export command now all accept and
propagate `ignoreDirs` from the `ignore:` key in `.taskmd.yaml`. Add any
directory name (e.g. `archive`) there to have it excluded from all taskmd
operations including the web graph.

---

## Objective

Replace the current flat single-mode graph view with a layered, hierarchical
multigraph. The view must be readable at first load — no edge soup — and
progressively reveal relationship complexity through opt-in overlays and
interaction.

**Primary users:**

- Developer reviewing what to work on next (needs: dependency order, blockers,
  status at a glance)
- Tech lead understanding task structure (needs: hierarchy, phase clusters,
  provenance)

**Success looks like:**

- A graph with 80 tasks is legible on first render without configuration
- A user can identify all blockers of a task in ≤2 clicks
- Toggling an overlay does not visually shift the graph layout
- Isolated tasks with only a scope don't make the graph stretch: they appear in
  compact scope clusters
- A focus on a single node surfaces its full relationship context without
  leaving the graph view

---

## Current ELK Graph Shape

```
root
├── __phase_v1.0  (ELK compound — all tasks with phase=v1.0)
│   ├── task-001
│   └── task-002
├── __phase_v2.0  (ELK compound — all tasks with phase=v2.0)
│   └── task-005
└── task-030  (no phase — top-level)

ELK edges:
  dep:    task-001 → task-002  (dependency, drives layer ranking)
  dep:    task-002 → task-005  (cross-phase, routed through compound boundaries)
  parent: task-001 → task-003  (parent→child ranking edge, no compound)

React Flow edges (injected after layout):
  dep:      solid gray arrow
  parent:   solid indigo diamond (markerStart)
  related:  dashed purple (only when overlay toggled on)
  spawn-by: dotted violet open arrow (only when overlay toggled on)
```

Tasks with `parent:` and tasks with `phase:` can overlap: a parent task with
`phase: v1.0` goes inside `__phase_v1.0`, and the diamond edge connects it to
its child regardless of where the child sits.

---

## `touches` / Scope Clustering: Current State and Plan

### What exists today

The `touches` field (array of scope identifiers whitelisted in `.taskmd.yaml`)
is:

- Parsed from task frontmatter by the Go scanner ✅
- Emitted in the `/api/graph` JSON response:
  `{ "id": "...", "touches": ["api", "web"] }` ✅
- Typed in `GraphNode.touches?: string[]` ✅

The frontend does **nothing** with `touches` yet.

### What needs to be built (Phase 3)

Isolated tasks (no dep edges in or out, no `parent`, no `phase`) should be
grouped into scope cluster nodes based on their first-listed `touches` scope.

**Classification logic:**

```
For each task in GraphData:
  if has parent in graph       → positioned by parent edge
  else if has phase            → inside phase compound
  else if is isolated AND has touches → inside scope cluster (first scope wins)
  else if is isolated AND no touches → inside status cluster (last resort)
  else                         → top-level (has deps but no phase/parent)
```

**Scope cluster node (ClusterNode.tsx):**

- Collapsed by default: rounded rect, dashed border, scope label, task count,
  mini status bar
- Click to expand: member task nodes rendered inside with local ELK sub-layout
- Same colour as "Color by" tint when that scope is selected

**ELK input with scope clusters:**

```
root
├── __phase_v1.0 (compound)
│   └── ...
├── __scope_api  (compound — isolated tasks touching "api")
│   ├── task-020
│   └── task-021
└── task-030  (has deps but no phase — top-level)
```

---

## Library Assessment

### Why dagre was replaced

| Requirement                    | dagre        | elkjs                              |
| ------------------------------ | ------------ | ---------------------------------- |
| Compound/parent nodes          | ❌ Broken    | ✅ Native                          |
| Crossing minimisation          | ⚠️ Poor      | ✅ `ELK_LAYERED`                   |
| Async / Web Worker             | ❌ Sync only | ✅ Promise-based                   |
| Disconnected component packing | ❌ Flat row  | ✅ `SEPARATE_CONNECTED_COMPONENTS` |

### @xyflow/react v12 capabilities

| Requirement                 | Feasibility   | Note                                      |
| --------------------------- | ------------- | ----------------------------------------- |
| Custom node types           | ✅            | `nodeTypes` map                           |
| Overlay edges, no re-layout | ✅            | Injected after ELK                        |
| Compound nodes              | ✅ with elkjs | ELK positions; RF renders with `parentId` |
| Click → navigate            | ✅            | `onNodeClick` → `useNavigate`             |
| Zoom-based LOD              | ✅            | `useOnViewportChange`                     |

---

## Tech Stack

| Layer         | Technology                                                            |
| ------------- | --------------------------------------------------------------------- |
| Rendering     | @xyflow/react v12                                                     |
| Layout engine | elkjs 0.11.1, `elk.bundled.js` (worker deferred)                      |
| State         | React `useState` for overlays; `useReducer` planned for preset system |
| Backend       | Go API — `phase` and `touches` now in graph response                  |
| Styling       | Tailwind CSS                                                          |
| Tests         | vitest + @testing-library/react                                       |

---

## Commands

```bash
# Dev server (separate terminal: taskmd-dev serve)
cd apps/web && pnpm dev

# Test all
cd apps/web && pnpm test

# Test graph layout only
cd apps/web && pnpm test -- --run src/components/graph

# Build (full, with embedded web assets)
cd apps/cli && make install-dev-full
```

---

## Project Structure (current)

```
apps/web/src/
  components/graph/
    GraphView.tsx              # ReactFlow wrapper; registers task + container node types
    GraphLegend.tsx            # Status, priority, edges (dep/parent/related/spawn), groups (phase)
    GraphFilters.tsx           # Status filter toggles (unchanged)
    GraphOverlayToggles.tsx    # Related / Spawned-by toggle buttons (NEW)
    TaskNode.tsx               # Task node renderer (unchanged)
    ContainerNode.tsx          # Phase region renderer (NEW) — variant: "phase"
    graph-utils.ts             # filterGraphByStatus, findMatchedNodeIds (unchanged)
    useGraphLayout.ts          # @deprecated — dagre-based, kept for reference

    layout/
      elk-layout.ts            # buildElkGraph, elkNodesToReactFlow, buildStructuralEdges, buildOverlayEdges
      elk-layout.test.ts       # Layout + overlay edge tests

    hooks/
      useElkLayout.ts          # Async ELK layout hook; returns { nodes, edges, isLayouting }

  pages/
    GraphPage.tsx              # Composes layout hook + overlay state + toggles
    layout/
      cluster.ts               # Isolated node detection + scope grouping
      elk-edges.ts             # buildStructuralEdges + buildOverlayEdges
      focus.ts                 # BFS subgraph extraction
    hooks/
      useGraphState.ts         # Preset system reducer
```

---

## Overlay Edge Architecture

Overlays are **never passed to ELK**. They are injected into the React Flow
`edges` array after layout, via `buildOverlayEdges()` in `elk-layout.ts`.

```ts
// elk-layout.ts
export function buildStructuralEdges(data: GraphData): Edge[]; // dep + parent — always shown
export function buildOverlayEdges(
  data: GraphData,
  showRelated: boolean,
  showSpawnedBy: boolean,
): Edge[];

// GraphPage.tsx
const { nodes, edges: structuralEdges } = useElkLayout(filteredData);
const overlayEdges = useMemo(
  () => buildOverlayEdges(filteredData, showRelated, showSpawnedBy),
  [filteredData, showRelated, showSpawnedBy],
);
const edges = [...structuralEdges, ...overlayEdges];
```

Toggling `showRelated` or `showSpawnedBy` recomputes only `overlayEdges` — no
ELK re-layout.

| Edge type          | `id` prefix     | Style                                                                                       |
| ------------------ | --------------- | ------------------------------------------------------------------------------------------- |
| Dependency         | `dep-N`         | solid gray, `arrowclosed` markerEnd, `zIndex: 2`                                            |
| Parent composition | `par-{childId}` | solid indigo `#6366f1`, diamond markerStart, `zIndex: 2`                                    |
| Related            | `rel-N`         | dashed purple `#a855f7`, `strokeDasharray: "5 4"`, `zIndex: 1`, `opacity: 0.65`             |
| Spawned-by         | `spawn-N`       | dotted violet `#8b5cf6`, `strokeDasharray: "2 3"`, open arrow, `zIndex: 1`, `opacity: 0.65` |

---

## Implemented Phases

All phases are complete.

| Phase                  | Summary                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| 1 — Core layout        | ELK layered engine, phase compounds, dep edges, status/priority nodes                      |
| 2 — Overlay edges      | Related (dashed purple) + spawned-by (dotted violet) toggles; never re-layout              |
| 3 — Scope clustering   | `cluster.ts` detects isolated nodes; `__scope_X` ELK compounds with teal border            |
| 4 — Scope tinting      | `GraphColorBy` dropdown; `scopeColor()` assigns deterministic palette; dot badge on node   |
| 5 — Preset system      | `useGraphState` reducer; Default / Deps only / Related / Provenance / Focus presets        |
| 6 — Focus mode + hover | `bfsSubgraph()` BFS subgraph; click-to-focus; hover adjacency dimming; depth 1/2/3 control |
| 7 — LOD + legend       | Overlays hidden below zoom 0.5; legend priority rings fixed; `GraphOverlayToggles` hint    |

### Deferred / Out of scope

- **ELK Web Worker:** `elk.bundled.js` is synchronous; worker is a 5-line swap
  when needed (see TODO in `elk-layout.ts`)
- **Cluster-level-only view below zoom 0.3:** Not implemented; the LOD signal at
  0.5 is sufficient for a local tool
- **Duplicate/Alternative edges:** Not in the graph API response; can be added
  as a future overlay type

---

## CLI Counterpart (Task 232)

Task 232 ported the structural subset of these web features to `taskmd graph`.
The web and CLI implementations share the same Go SDK (`sdk/go/graph/graph.go`)
with a unified `RenderOptions` struct.

### SDK change: `RenderOptions`

All four graph rendering functions (`ToMermaid`, `ToDot`, `ToASCII`, `ToJSON`)
now accept a `RenderOptions` struct instead of scattered parameters. All
existing callers use `DefaultRenderOptions()` which preserves the previous
output exactly.

```go
type RenderOptions struct {
    FocusTaskID   string
    Subgraphs     bool
    ShowRelated   bool // default true
    ShowSpawnedBy bool // default true
    ShowParent    bool // default false
}
```

### CLI flag → web feature mapping

| Web feature                           | CLI flag                                     | Format                    |
| ------------------------------------- | -------------------------------------------- | ------------------------- |
| Phase + scope compound regions        | `--subgraphs`                                | Mermaid, DOT              |
| Parent relationship (diamond edge)    | `--parent-edges`                             | Mermaid, DOT, ASCII, JSON |
| Overlay toggles (related, spawned-by) | `--preset deps-only/related/provenance/full` | All formats               |
| Focus mode (depth-limited BFS)        | `--root X --depth N`                         | All formats               |

### New CLI flags

```
--subgraphs          Group tasks by phase/scope in Mermaid and DOT output
--depth N            Limit --root traversal to N hops (0 = unlimited, requires --root)
--preset NAME        deps-only | related | provenance | full
--parent-edges       Render parent→child edges in all four output formats
```

`--preset full` mirrors the web Default view: all edge types visible, subgraphs
enabled.

See `docs/specs/cli-graph-multigraph-features.md` for the full CLI spec.

---

## Boundaries

- **Always:** Overlay toggles must never trigger ELK re-layout.
- **Always:** The existing `/graph` route continues to work. Changes are
  incremental.
- **Always:** Structural edges (dep + parent diamond) are always visible
  regardless of overlay state.
- **Ask first:** Adding npm dependencies. Changing the `/api/graph` response
  shape. Adding new task frontmatter fields.
- **Never:** Remove the status filter, search bar, or stats that exist. Break
  the `GraphData` type contract.
