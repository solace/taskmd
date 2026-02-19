---
id: "155"
title: "Add todos command for finding TODO/FIXME comments in codebase"
status: completed
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

- [x] Define the `todos` root command with subcommand structure
- [x] Implement `todos list` subcommand
  - [x] Scan files recursively, respecting `.gitignore` and configurable ignore patterns
  - [x] Detect common markers: `TODO`, `FIXME`, `HACK`, `XXX`, `NOTE`, `BUG`, `OPTIMIZE`
  - [x] Support language-specific comment syntax (single-line and multiline block comments)
    - [x] Go (`//`, `/* */`)
    - [x] JavaScript/TypeScript (`//`, `/* */`)
    - [x] Python (`#`, `"""` / `'''` docstrings)
    - [x] Ruby (`#`, `=begin`/`=end`)
    - [x] Shell/Bash (`#`)
    - [x] CSS (`/* */`)
    - [x] HTML (`<!-- -->`)
    - [x] Rust (`//`, `/* */`)
    - [x] YAML/TOML (`#`)
  - [x] Handle multiline comment blocks (extract full TODO text spanning multiple lines)
  - [x] Output each match with file path, line number, marker type, and comment text
- [x] Support output formats: `table` (default), `json`, `yaml`
- [x] Add flags: `--marker` (filter by marker type), `--dir` (scan directory), `--include` (glob filter), `--exclude` (glob filter)
- [x] Write comprehensive tests for the command
- [x] Write tests for the comment parser across all supported languages

## Acceptance Criteria

- `taskmd todos list` scans the current directory and prints all TODO/FIXME/etc. comments with filename and line number
- Multiline comments are detected and their full text is captured
- Language-specific comment syntax is correctly parsed (no false positives from string literals)
- Output can be filtered by marker type with `--marker TODO`
- JSON and YAML output formats are supported
- Tests cover happy path, multiline comments, multiple languages, and edge cases
