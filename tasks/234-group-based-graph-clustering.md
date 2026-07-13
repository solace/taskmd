---
id: "234"
title: "Replace scope-based graph clustering with group-based clustering"
status: completed
priority: medium
effort: medium
type: improvement
tags: ["graph", "cli", "web", "refactor"]
dependencies: ["232"]
see_also: ["231"]
created_at: 2026-07-13
---

# Replace Scope-Based Graph Clustering with Group-Based Clustering

## Objective

Replace the `touches`-based scope clustering heuristic with clustering by the `group` field. The old approach grouped only isolated tasks (no dep edges, no parent) into clusters by their first `touches` entry. This was haphazard: task placement depended on insertion order of `touches`, the isolation constraint excluded most tasks, and the cluster label (`touches[0]`) carried scope identity rather than logical grouping meaning.

The `group` field is already singular, directory-derived when omitted, and semantically correct for "which logical area does this task belong to." Using it for clustering produces stable, intentional groupings without special-casing connectivity.

## Changes Made

### Specification

- [x] Documented `/` separator convention in `group` field description: first segment is the top-level cluster, the remainder is the sub-cluster. This is a rendering hint only — `group` remains a plain string for filtering, display, and sorting. Maximum meaningful depth is one `/`; additional slashes are treated as part of the sub-cluster label.
- [x] Synced to `apps/cli/internal/cli/templates/TASKMD_SPEC.md` and `apps/docs/reference/specification.md`

### SDK — Graph (`sdk/go/graph/graph.go`)

- [x] Replaced `classifyByGroup(tasks, hasDepEdge)` with new signature `classifyByGroup(tasks)`:
  - `hasDepEdge` parameter removed — isolation is no longer a condition for clustering
  - Tasks with `phase` → `phaseGroups[phase][group]` (group `""` if unset)
  - Tasks with no phase but a `group` → `groups[group]`
  - All others → top-level (no change)
- [x] Added `sanitizeID` helper (replaces non-alphanumeric chars with `_` for use in graph node IDs)
- [x] Added `sortedStringKeys` generic helper (returns sorted keys of any string-keyed map)
- [x] Added `buildGroupTree` helper: converts flat `group → []taskID` map into `top → (sub → []taskID)` tree by splitting on first `/`
- [x] `writeMermaidGroups(sb, phaseGroups, groups)`:
  - Phase subgraphs now contain group sub-subgraphs: `subgraph phasegrp_{phase}_{group}["group"]`
  - Standalone group subgraphs: `subgraph grp_{top}["top"]` with optional `subgraph grp_{top}_{sub}["sub"]` nesting
  - Split into `writeMermaidPhaseBody` and `writeMermaidGroupBody` helpers to stay under 60-line lint limit
- [x] `writeDotGroups(sb, phaseGroups, groups)`:
  - Phase clusters now contain group sub-clusters: `subgraph cluster_phasegrp_{phase}_{group}`
  - Standalone group clusters: `subgraph cluster_grp_{top}` with optional nested `subgraph cluster_grp_{top}_{sub}`
  - Split into `writeDotPhaseBody` and `writeDotGroupBody` helpers

### Web — Cluster classification (`apps/web/src/components/graph/layout/cluster.ts`)

- [x] Replaced `classifyNodes(data, candidates)` with `classifyNodes(candidates)`:
  - Removed `data: GraphData` parameter (dep edge set no longer needed)
  - Removed `nodesWithDeps` and `childNodes` sets — isolation check dropped
  - Any task with a `group` goes into `groupMap` regardless of connectivity
  - `scopeGroups: Map<string, string[]>` → `groupMap: Map<string, string[]>`
- [x] `NodeClassification.scopeGroups` → `groupMap`

### Web — ELK layout (`apps/web/src/components/graph/layout/elk-layout.ts`)

- [x] `buildPhaseCompounds(phaseMap, nodeMap)`: now sub-clusters within each phase by `group`; ungrouped phase tasks remain flat children; grouped tasks become `__phasegrp_{phase}/{group}` ELK compounds
- [x] `buildScopeCompounds` → `buildGroupCompounds(groupMap)`: splits groups by `/` to create nested ELK compounds (`__grp_{top}` containing `__grp_{top}/{sub}`)
- [x] `collectElkNodes`: recognises `__phasegrp_` and `__grp_` prefixes in addition to `__phase_`; extracts label from the appropriate segment
- [x] `buildElkGraph`: calls `classifyNodes(nonPhaseTasks)` (no `data` arg); uses `buildGroupCompounds` instead of `buildScopeCompounds`; passes `nodeMap` to `buildPhaseCompounds`

### Web — Container node (`apps/web/src/components/graph/ContainerNode.tsx`)

- [x] Variant `"scope"` renamed to `"group"` — same teal visual style, corrected semantic name

### Tests

- [x] `cluster.test.ts` rewritten: group-based tests replacing scope/touches tests; verifies that tasks with deps still cluster by group (no isolation requirement)
- [x] `elk-layout.test.ts`: scope compound test replaced with group compound test (`__grp_cli` not `__scope_api`)
- [x] `elk-layout.run.test.ts`: scope cluster test replaced with group cluster test; asserts `variant: "group"`
- [x] `apps/cli/internal/cli/graph_test.go`: `createSubgraphTestFiles` fixture updated from `touches: ["api"]` to `group: "api"`; assertions updated from `scope_api` / `cluster_scope_api` to `grp_api` / `cluster_grp_api`

## Design Decisions

**No isolation requirement** — The old heuristic only clustered tasks with no dep edges and no parent. This excluded most real tasks. The new approach clusters any task that declares a group, regardless of connectivity. Cross-cluster dependency edges are expected and informative.

**Phase → group two-level hierarchy** — Tasks within a phase are further sub-clustered by group. A task with `phase: v1` and `group: cli` appears inside a `cli` sub-container within the `v1` phase container. Ungrouped phase tasks appear flat inside the phase container.

**`/` as rendering hint only** — `group: cli/graph` creates a `cli` outer cluster containing a `graph` sub-cluster. The field remains a plain string for all other purposes. Depth beyond one `/` is not meaningful.

**Directory derivation unchanged** — The `group` field still derives from the parent directory name when omitted. Root-level tasks with no explicit `group` remain unclustered (top-level in the graph).

## Acceptance Criteria

- `--subgraphs` in Mermaid/DOT clusters tasks by `group` not by `touches` ✅
- Tasks with dep edges are clustered by group (not excluded as non-isolated) ✅
- Tasks with `phase` and `group` appear in a group sub-cluster within the phase cluster ✅
- `group: cli/graph` creates a `cli` outer cluster with a `graph` sub-cluster ✅
- Web graph clusters non-phase tasks by `group` field ✅
- Phase containers sub-cluster by group in the web graph ✅
- `ContainerNode` variant `"scope"` replaced with `"group"` ✅
- Spec documents `/` as a two-level clustering hint ✅
- All tests pass ✅
