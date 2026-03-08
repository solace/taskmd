---
id: "236"
title: "Define taskmd skill operations and CLI integration"
status: pending
priority: low
effort: medium
tags:
  - cli
  - integration
  - claude-code
  - plugin
  - mvp
parent: "cli-042"
created: 2026-03-08
---

# Define Taskmd Skill Operations and CLI Integration

## Objective

Author the taskmd skill definition -- the prompt/instructions file and parameter handling -- and wire it up to invoke taskmd CLI commands. This is the core of the plugin's functionality.

## Tasks

- [ ] Define `taskmd` skill with common operations:
  - List tasks in current directory
  - Show next available task
  - Validate task files
  - Show task statistics
  - Visualize dependency graph
- [ ] Create skill prompt/instructions file
  - Explain taskmd format and conventions
  - Provide examples of common usage patterns
  - Include CLI command reference
- [ ] Add parameter handling for:
  - Directory path (default to current)
  - Format options (json, yaml, table)
  - Filter options (status, priority, tags)
- [ ] Configure skill to invoke taskmd CLI commands
- [ ] Handle output formatting for Claude context
- [ ] Add error handling and user feedback
- [ ] Test skill invocation from Claude Code

## Acceptance Criteria

- Skill can be invoked with `/taskmd` in Claude Code
- All five core operations (list, next, validate, stats, graph) work
- Parameters for directory, format, and filters are accepted and passed correctly
- CLI output is formatted suitably for Claude context consumption
- Error cases (CLI not installed, invalid directory, bad flags) produce helpful messages
- Plugin can access and execute taskmd CLI commands end-to-end
