---
id: "235"
title: "Create Claude Code plugin manifest and directory structure"
status: pending
priority: low
effort: small
tags:
  - cli
  - integration
  - claude-code
  - plugin
  - mvp
parent: "cli-042"
created: 2026-03-08
---

# Create Claude Code Plugin Manifest and Directory Structure

## Objective

Set up the plugin directory layout, create the plugin manifest file with proper metadata, and declare the taskmd skill entry point. This provides the scaffolding that the skill definition and integration tasks build on.

## Tasks

- [ ] Create `claude-code-plugin/` directory at project root
- [ ] Create plugin manifest file (e.g., `plugin.json` or `manifest.yaml`)
  - Define plugin metadata (name, version, description, author)
  - Declare the `taskmd` skill
  - Specify dependencies (Go binary, or reference to installed CLI)
- [ ] Document plugin file structure in a brief README or inline comments

## Acceptance Criteria

- `claude-code-plugin/` directory exists with a valid manifest file
- Manifest includes all required metadata fields (name, version, description, author)
- The `taskmd` skill is declared in the manifest
- Dependency requirements (CLI binary) are specified
- Plugin follows Claude Code plugin best practices for structure
