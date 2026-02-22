---
id: "201"
title: "Add ID strategy config section to .taskmd.yaml"
status: completed
priority: high
effort: medium
type: feature
tags: [id, config]
parent: "200"
dependencies: []
created: 2026-02-22
---

# Add ID strategy config section to .taskmd.yaml

## Objective

Introduce a new `id` section in `.taskmd.yaml` that configures how task IDs are generated. This is the foundational config plumbing that the ID generation and deduplication tasks build on.

Config shape:

```yaml
id:
  strategy: sequential    # "sequential" | "prefixed" | "random"
  prefix: "dr-"           # required when strategy is "prefixed"
  length: 6               # character count for "random" (default 6)
  padding: 3              # zero-pad width for sequential/prefixed (default 3)
```

## Tasks

- [x] Add `"id"` to `knownConfigKeys` in `validator/validator.go`
- [x] Add `IDConfig` struct to `ConfigData` in `validator/validator.go`
- [x] Add config validation: valid strategy enum, prefix required for `prefixed`, length/padding > 0
- [x] Expose resolved ID config via viper in `cli/root.go` (helper function)
- [x] Update `deriveFieldsFromFilename()` in `parser/markdown.go` to handle non-digit-starting filenames (prefix and random IDs)
- [x] Add `id` section to `docs/taskmd_specification.md` and run `make sync-spec`
- [x] Add tests for config validation and parser changes

## Acceptance Criteria

- `.taskmd.yaml` with an `id` section is parsed without "unknown config key" warnings
- Invalid strategy values produce validation errors
- `strategy: prefixed` without a `prefix` value produces a validation error
- `deriveFieldsFromFilename()` correctly handles filenames like `dr-001-slug.md` and `a3f9x2-slug.md`
- Omitting the `id` section preserves current defaults (sequential, padding 3)
