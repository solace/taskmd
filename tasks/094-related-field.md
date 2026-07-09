---
id: "094"
title: "Add related field for non-dependency task relations"
status: completed
priority: medium
effort: large
tags:
  - feature
  - spec
  - cli
  - web
  - mvp
created: 2026-02-14
---

# Add Related Field for Non-Dependency Task Relations

## Objective

Add a `related` frontmatter field that lets tasks reference other tasks they are conceptually connected to, without implying any blocking or ordering. This is a flat list of task IDs with the same shape as `dependencies`, meaning "these tasks are connected/relevant to each other."

Bidirectional by convention: if task A lists task B as related, B is related to A even if B doesn't list A.

## Tasks

### Specification
- [x] Add `related` field to `docs/taskmd_specification.md` as an optional `array` of task ID strings
- [x] Document semantics: non-blocking, non-ordering, bidirectional by convention

### Model & Parser
- [x] Add `Related []string` field to the Task struct (`sdk/go/model/task.go`)
- [x] Ensure YAML/JSON serialization tags are correct (`yaml:"related,omitempty" json:"related,omitempty"`)
- [x] Verify parser handles `related` field correctly (omitempty behavior)

### Validation
- [x] Validate that related task IDs reference existing tasks (`sdk/go/validator/validator.go` — `checkMissingRelated`)
- [x] Warn if a task lists itself as related (`checkRelatedSelfReference`)
- [x] Add tests for related field validation (`sdk/go/validator/validator_test.go`)

### CLI — `get` command
- [x] Display related tasks in `taskmd get` output (bidirectional: shows both explicit and reverse relations)
- [x] Add tests — text format, bidirectional display, JSON format, omitted when empty

### CLI — `set` command
- [x] Support `--related 058,063` flag to set related tasks
- [x] Add tests — set, clear, combined with other flags

### CLI — `graph` command
- [x] Render related edges as dashed/dotted lines (visually distinct from dependency edges)
- [x] Mermaid: `-.-` (undirected dashed)
- [x] DOT: `style=dashed, dir=none`
- [x] ASCII: `~ relatedId, ...` annotation on nodes
- [x] JSON: `relatedEdges` array alongside existing `edges`
- [x] Add tests — JSON (`relatedEdges` keys `a`/`b`), Mermaid (`-.-`), DOT (`style=dashed, dir=none`), ASCII (`~`)

### Filtering
- [x] Support `related=true/false` filter in the filter package (`sdk/go/filter/filter.go`)
- [x] Add tests (`sdk/go/filter/filter_test.go`)

### Web UI
- [x] Display related tasks in the task detail view as clickable links (`TaskDetailView.tsx`)
- [x] **Extension (multigraph work):** Related edges rendered as dashed purple overlay in graph view (`buildOverlayEdges`, toggled via "Related" button in `GraphOverlayToggles`)

## Non-Goals

- No effect on `next` command scoring or actionability
- No cycle detection for relations (non-directional, non-blocking)
- No cascading status changes
- No typed relations (parent, blocks, etc.) — keep it simple for now

## Acceptance Criteria

- `related` field is documented in the specification ✅
- Tasks can declare related tasks via frontmatter: `related: ["058", "063"]` ✅
- `taskmd get` displays related tasks ✅
- `taskmd set --related` updates the field ✅
- `taskmd graph` renders related edges distinctly from dependency edges ✅
- Validation catches references to non-existent tasks ✅
- All new functionality has tests ✅
- Web UI shows related tasks in detail view ✅
