---
id: "155"
title: "Add todos command for finding TODO/FIXME comments in codebase"
status: pending
priority: medium
effort: large
type: feature
tags:
  - cli
  - developer-experience
created: 2026-02-19
---

# Add todos Command for Finding TODO/FIXME Comments in Codebase

## Objective

Implement a new `todos` command with subcommands for discovering and displaying TODO, FIXME, HACK, XXX, and similar marker comments across a codebase. The command should use lightweight parsing that is language-aware, handles multiline comments correctly, and outputs results with filename and line number references.

## Tasks

- [ ] Define the `todos` root command with subcommand structure
- [ ] Implement `todos list` subcommand
  - [ ] Scan files recursively, respecting `.gitignore` and configurable ignore patterns
  - [ ] Detect common markers: `TODO`, `FIXME`, `HACK`, `XXX`, `NOTE`, `BUG`, `OPTIMIZE`
  - [ ] Support language-specific comment syntax (single-line and multiline block comments)
    - [ ] Go (`//`, `/* */`)
    - [ ] JavaScript/TypeScript (`//`, `/* */`)
    - [ ] Python (`#`, `"""` / `'''` docstrings)
    - [ ] Ruby (`#`, `=begin`/`=end`)
    - [ ] Shell/Bash (`#`)
    - [ ] CSS (`/* */`)
    - [ ] HTML (`<!-- -->`)
    - [ ] Rust (`//`, `/* */`)
    - [ ] YAML/TOML (`#`)
  - [ ] Handle multiline comment blocks (extract full TODO text spanning multiple lines)
  - [ ] Output each match with file path, line number, marker type, and comment text
- [ ] Support output formats: `table` (default), `json`, `yaml`
- [ ] Add flags: `--marker` (filter by marker type), `--dir` (scan directory), `--include` (glob filter), `--exclude` (glob filter)
- [ ] Write comprehensive tests for the command
- [ ] Write tests for the comment parser across all supported languages

## Acceptance Criteria

- `taskmd todos list` scans the current directory and prints all TODO/FIXME/etc. comments with filename and line number
- Multiline comments are detected and their full text is captured
- Language-specific comment syntax is correctly parsed (no false positives from string literals)
- Output can be filtered by marker type with `--marker TODO`
- JSON and YAML output formats are supported
- Tests cover happy path, multiline comments, multiple languages, and edge cases
