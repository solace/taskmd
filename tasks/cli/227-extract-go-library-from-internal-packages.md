---
title: "Extract Go library from internal packages"
id: "227"
status: completed
priority: high
effort: large
type: feature
tags: ["library", "go", "api"]
dependencies:
  - "230"
created: "2026-02-28"
---

# Extract Go library from internal packages

## Objective

Restructure the CLI codebase to expose core taskmd functionality as a public Go library. Move packages from `internal/` to a public module so that Go users can `go get` the library and use taskmd parsing, scanning, filtering, validation, and graph logic directly in their own tools — without shelling out to the CLI binary.

## Tasks

- [ ] Design the public API surface — decide which packages/types/functions to export
- [ ] Create a new Go module (e.g. `go.taskmd.dev/taskmd` or `github.com/driangle/taskmd-go`) with a clean `pkg/` layout
- [ ] Move core packages (model, parser, scanner, filter, graph, validator, next, search) from `internal/` to the public module
- [ ] Refactor the CLI to import from the new public module instead of internal packages
- [ ] Review and clean up exported types — ensure consistent naming, minimize surface area
- [ ] Add godoc comments to all exported types and functions
- [ ] Write usage examples (as `_test.go` example functions and a README)
- [ ] Add a conformance test suite based on the taskmd specification that can be reused across language implementations
- [ ] Publish the module and verify `go get` works

## Acceptance Criteria

- Core taskmd logic is available as a standalone Go module with a documented public API
- The CLI binary continues to work identically, now importing from the public module
- All existing CLI tests pass without modification
- The public module has godoc coverage on all exported symbols
- A README with quick-start examples exists in the library repo/directory
- `go get <module>` works and the module is usable from external Go projects
