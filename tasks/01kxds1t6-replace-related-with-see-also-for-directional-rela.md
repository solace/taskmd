---
id: "01kxds1t6"
title: "Replace related with see_also for directional relationship"
status: completed
priority: medium
dependencies: []
tags: [refactor, cli, web, spec]
created_at: 2026-07-13
---

# Replace `related` with `see_also` for Directional Relationship

## Objective

Replace the `related` frontmatter field with `see_also`. The original `related` field was bidirectional by convention and treated as an undirected association. `see_also` is a directed context pointer — the declaring task references another task for background or context, with no implied reverse relationship. This aligns more closely with `spawned_by` in analytical utility and is simpler to reason about. Anything requiring a tighter structural relationship can be expressed with `dependencies` or `parent`.

## Changes Made

### Specification
- [x] Updated `docs/taskmd_specification.md`: replaced `related` field entry with `see_also`, revised semantics to directed/non-bidirectional
- [x] Synced to `apps/cli/internal/cli/templates/TASKMD_SPEC.md` and `apps/docs/reference/specification.md`

### Model & Parser
- [x] Renamed `Related []string` → `SeeAlso []string` in `sdk/go/model/task.go`
- [x] Updated YAML/JSON tags to `see_also,omitempty`

### SDK — Graph
- [x] Replaced undirected `RelatedEdges`/`RelatedMap` with directed `SeeAlsoEdges [][2]string` in `sdk/go/graph/graph.go`
- [x] Removed bidirectional deduplication logic; edges are now simple directed pairs
- [x] `RenderOptions.ShowRelated` → `ShowSeeAlso`
- [x] Mermaid: `-.-` (undirected) → `-.->` (directed)
- [x] DOT: `style=dashed, dir=none` → `style=dashed` (directed)
- [x] ASCII: annotation now reads directly from `task.SeeAlso` (no reverse map)
- [x] JSON: key `relatedEdges` with `a`/`b` → `seeAlsoEdges` with `from`/`to`

### SDK — Taskfile, Validator, Filter
- [x] `taskfile.UpdateRequest.Related` → `SeeAlso`; YAML field updated from `related:` to `see_also:`
- [x] `referenceFields` slice updated to `see_also:`
- [x] Validator: `checkMissingRelated` → `checkMissingSeeAlso`, `checkRelatedSelfReference` → `checkSeeAlsoSelfReference`; error messages updated
- [x] Filter: `related` filter key → `see_also`

### CLI — `get` command
- [x] Removed bidirectional reverse-lookup (no longer scans all tasks for reverse references)
- [x] `dependencyInfo.Related` → `SeeAlso`; `getOutput.Related` → `SeeAlso` (JSON key `see_also`)
- [x] Display label "Related:" → "See also:"
- [x] `printRelated` → `printSeeAlso`

### CLI — `set` command
- [x] `--related` flag → `--see-also`
- [x] Change confirmation output updated from `related:` → `see_also:`

### CLI — `graph` command
- [x] Removed `related` preset (was `--preset related`)
- [x] `ShowRelated` → `ShowSeeAlso` in preset switch
- [x] Help text updated; remaining presets: `deps-only`, `provenance`, `full`

### Web UI
- [x] `api/types.ts`: `Task.related` → `see_also`; `GraphRelatedEdge {a,b}` → `GraphSeeAlsoEdge {from,to}`; `GraphData.relatedEdges` → `seeAlsoEdges`
- [x] `useGraphState.ts`: overlay key `related` → `seeAlso`; action `TOGGLE_RELATED` → `TOGGLE_SEE_ALSO`; removed `"related"` preset
- [x] `GraphPresetSelector.tsx`: removed "Related" preset button
- [x] `GraphOverlayToggles.tsx`: props renamed; icon updated to directed arrow (matching `spawned_by` style)
- [x] `GraphLegend.tsx`: edge label "Related" → "See also"; SVG updated to directed arrow
- [x] `graph-utils.ts`: `relatedEdges` filter → `seeAlsoEdges` with `from`/`to` keys
- [x] `layout/focus.ts`: traversal updated — `see_also` edges are followed in declared direction only (not reversed)
- [x] `layout/elk-edges.ts`: `buildOverlayEdges` updated; edge IDs `rel-N` → `see-N`; `markerEnd` added for direction
- [x] `useGraphLayout.ts` (deprecated dagre path): updated to directed edges
- [x] `GraphPage.tsx`: overlay wiring updated
- [x] `TaskDetailView.tsx`: section heading "Related" → "See also"; field `task.related` → `task.see_also`

### Tests
- [x] All SDK tests updated (`graph_test.go`, `validator_test.go`, `filter_test.go`, `conformance_test.go`)
- [x] All CLI tests updated (`get_test.go`, `set_test.go`, `graph_test.go`)
- [x] Bidirectional test cases replaced with directed-only assertions
- [x] All web tests updated (`useGraphState.test.ts`, `elk-edges.test.ts`, `focus.test.ts`, `GraphLegend.test.tsx`)

## Acceptance Criteria

- `see_also` field documented in specification with directed semantics ✅
- Tasks declare context pointers via frontmatter: `see_also: ["058", "063"]` ✅
- `taskmd get` displays "See also:" (directed only, no reverse lookup) ✅
- `taskmd set --see-also` updates the field ✅
- `taskmd graph` renders `see_also` as directed dashed overlay edges ✅
- No `related` preset; `see_also` overlay toggled via graph UI or `--preset full` ✅
- Validation catches references to non-existent tasks ✅
- All tests pass ✅
