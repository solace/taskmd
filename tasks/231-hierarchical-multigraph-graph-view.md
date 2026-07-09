---
title: "Hierarchical multigraph graph view"
id: "231"
status: completed
priority: high
effort: large
type: feature
tags: ["web", "graph", "ui", "feature"]
related: ["094"]
created: "2026-07-07"
---

# Hierarchical Multigraph Graph View

## Objective

Replace the flat single-mode graph view with a layered, hierarchical multigraph. The view must be readable at first load and progressively reveal relationship complexity through opt-in overlays and interaction.

Primary users:
- Developer reviewing what to work on next (needs: dependency order, blockers, status at a glance)
- Tech lead understanding task structure (needs: hierarchy, phase clusters, provenance)

## Tasks

### Phase 1 — Core layout engine
- [x] Replace dagre with elkjs 0.11.1 (`elk.bundled.js`, synchronous)
- [x] `buildElkGraph` in `elk-layout.ts`: maps `GraphData` → ELK input with `layered` algorithm, `elk.direction: DOWN`
- [x] Phase compound regions: tasks with `phase:` frontmatter placed inside `__phase_X` ELK compounds (dashed indigo border)
- [x] `elkNodesToReactFlow`: converts ELK output back to React Flow nodes/edges
- [x] `useElkLayout` hook: async layout returning `{ nodes, edges, isLayouting }`
- [x] `ContainerNode` component for phase region rendering
- [x] Dependency edges: solid gray arrow, `zIndex: 2`
- [x] Parent relationship: diamond edge (`markerStart: "url(#rf-diamond-filled)"`) instead of compound node

### Phase 2 — Overlay edges
- [x] `buildStructuralEdges`: dep + parent edges always shown; never passed to ELK post-layout
- [x] `buildOverlayEdges`: related (dashed purple `#a855f7`) + spawned-by (dotted violet `#8b5cf6`) edges
- [x] `GraphOverlayToggles` component: Related / Spawned-by toggle buttons, off by default
- [x] Overlays injected after layout — toggling never triggers ELK re-layout

### Phase 3 — Scope clustering
- [x] `cluster.ts`: detects isolated nodes (no dep edges, no parent, no phase); groups by first `touches` scope
- [x] `__scope_X` ELK compound regions (dashed teal border) for isolated scoped tasks
- [x] `touches` field emitted in `/api/graph` JSON response and typed in `GraphNode.touches?: string[]`
- [x] Web data provider respects `ignore:` config from `.taskmd.yaml`

### Phase 4 — Scope tinting ("Color by")
- [x] `GraphColorBy` dropdown: select a scope to highlight
- [x] `scopeColor()`: deterministic color from scope name using palette rotation
- [x] Dot badge on task nodes whose `touches` includes the selected scope
- [x] `graph-colors.ts`: color utilities

### Phase 5 — Preset system
- [x] `useGraphState` reducer: manages `preset`, `overlays`, `showParentEdges`, `clustering`, `colorBy`, `focusNodeId`, `focusDepth`
- [x] Presets: Default / Deps only / Related / Provenance / Focus (each atomically sets overlay + clustering state)
- [x] `GraphPresetSelector` component
- [x] Switch from multiple `useState` to `useReducer` in `useElkLayout` to avoid cascading setState lint warning

### Phase 6 — Focus mode + hover dimming
- [x] `focus.ts`: `bfsSubgraph(data, nodeId, depth)` — BFS subgraph extraction at depth 1/2/3
- [x] `GraphFocusControls` component: depth selector + exit button
- [x] Click-to-focus in Focus preset: clicking a node calls `SET_FOCUS` instead of navigating
- [x] Hover neighbourhood dimming: adjacency set from structural edges; non-adjacent nodes get `dimmed: true`
- [x] `onTaskClick` and `onNodeHover` callback props on `GraphView`
- [x] Focus filtering in `GraphPage`: `bfsSubgraph` applied before layout when preset is "focus"

### Phase 7 — LOD zoom gating + legend fix
- [x] `LOD_OVERLAY_THRESHOLD = 0.5`: overlay edges hidden below this zoom level
- [x] `GraphOverlayToggles` `lodHidden` prop: renders "zoom in to see" hint when overlays are active but hidden
- [x] `GraphLegend` priority rings: switched from Tailwind `ring-*` classes to inline `boxShadow` style (matches `TaskNode` rendering)
- [x] `onViewportChange` in `GraphPage` tracks zoom; `isZoomedOut` state gates overlay inclusion

### Supporting changes
- [x] `elk-edges.ts` extracted from `elk-layout.ts` to keep files under 200 lines (ESLint max-lines rule)
- [x] `elk-layout.test.ts` split into three files: `elk-layout.test.ts`, `elk-layout.run.test.ts`, `elk-edges.test.ts`
- [x] `TaskDetailPage.tsx` split: display JSX extracted into `TaskDetailView` component
- [x] `vite-env.d.ts` added: `/// <reference types="vite/client" />` to resolve CSS side-effect import type error
- [x] `TaskNode.test.tsx` updated: priority ring and highlight tests updated to check inline `boxShadow` instead of Tailwind classes
- [x] Spec document: `docs/specs/graph-multigraph-view.md`

## Key Design Decisions

**Parent relationship: edge, not compound** — A UML composition diamond edge handles parent→child. Compound containment fights the dependency-driven layout signal when parent and child tasks span different phases or dependency ranks.

**ELK Web Worker: deferred** — `elk.bundled.js` (synchronous) produces identical layout results. A local tool can tolerate a brief freeze on initial load. The hook is already async (`isLayouting` state), so switching to the worker is a 5-line change when needed.

**Overlay edges never trigger re-layout** — Overlays are injected into the React Flow `edges` array after ELK runs. Toggling `showRelated` / `showSpawnedBy` recomputes only the overlay array.

## Acceptance Criteria

- Graph with 80+ tasks is legible on first render without configuration ✅
- Phase compound regions visually group tasks sharing a `phase:` value ✅
- Related and spawned-by overlays are off by default; toggling them does not shift the layout ✅
- Scope clustering groups isolated tasks into compact `__scope_X` regions ✅
- "Color by" tints nodes whose `touches` matches the selected scope ✅
- Preset system atomically controls overlay visibility, clustering, and focus depth ✅
- Focus mode narrows the graph to the BFS neighbourhood of a clicked node ✅
- Hovering a node dims all non-adjacent nodes ✅
- Overlay edges are hidden below zoom 0.5 with a "zoom in to see" hint ✅
- All components have unit tests; `TaskNode.test.tsx` updated to match inline style rendering ✅
</content>
</invoke>