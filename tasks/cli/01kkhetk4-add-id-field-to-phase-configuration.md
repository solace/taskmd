---
title: "Add id field to phase configuration"
id: "01kkhetk4"
status: completed
priority: medium
type: feature
tags: ["spec", "phases"]
created: "2026-03-12"
phase: phase-support
---

# Add id field to phase configuration

## Objective

Add a separate `id` field to phase configuration so tasks reference a short, stable identifier instead of the full phase name. Currently `name` serves as both the display label and the key used in task frontmatter. This couples task files to the human-readable name — renaming a phase requires updating every task that references it.

With this change:
- Each phase has an `id` (short, kebab-case) and a `name` (human-readable label)
- Task `phase` frontmatter references the phase `id`, not the `name`
- Both `id` and `name` must be unique across all configured phases
- Validation warns on duplicate `id` or `name` values

Example `.taskmd.yaml`:
```yaml
phases:
  - id: benchmarks
    name: "Skill Benchmarks"
    description: "Establish quality baselines for all agent skills"
  - id: web-ui
    name: "Web UI"
    description: "Enhance the web interface"
```

Example task frontmatter:
```yaml
phase: benchmarks  # references phase id, not name
```

## Tasks

- [ ] Update spec (`docs/taskmd_specification.md`) — add `id` field to phases table, update examples
- [ ] Add `ID` field to `PhaseConfig` struct (`sdk/go/validator/validator.go`)
- [ ] Update `parsePhasesConfig` in `apps/cli/internal/cli/validate.go` to parse `id`
- [ ] Update validation logic to check phase references against `id` (not `name`)
- [ ] Add validation: both `id` and `name` must be unique across phases
- [ ] Update `.taskmd.yaml` phases config to use new `id` field
- [ ] Update all existing task files to reference phase `id` instead of `name`
- [ ] Sync spec copies (`make sync-spec`)
- [ ] Update tests for `parsePhasesConfig` and phase validation
- [ ] Run `taskmd-dev validate` to confirm everything passes

## Acceptance Criteria

- `PhaseConfig` struct has an `ID` field alongside `Name`
- `parsePhasesConfig` reads `id` from each phase entry
- Validation matches task `phase` values against phase `id` (not `name`)
- Validation warns if any two phases share the same `id` or `name`
- Spec documents the `id` field with examples
- All existing task files use the phase `id` (e.g., `benchmarks` not `Skill Benchmarks`)
- `taskmd-dev validate` passes with no errors or warnings
