---
id: "185"
title: "Write a getting started tutorial guide"
status: pending
priority: high
effort: medium
type: docs
tags:
  - documentation
  - onboarding
created: 2026-02-20
---

# Write a Getting Started Tutorial Guide

## Objective

Create a step-by-step tutorial that walks new users through setting up taskmd and managing their first project. The current documentation is reference-style — there's no guided path from installation to productive usage.

## Tasks

- [ ] Write an introductory section explaining what taskmd is and who it's for
- [ ] Write a step-by-step installation section (Homebrew, GitHub releases, from source)
- [ ] Walk through `taskmd init` to set up a new project
- [ ] Show creating the first task with `taskmd add`
- [ ] Demonstrate listing and filtering tasks with `taskmd list`
- [ ] Show updating task status with `taskmd set`
- [ ] Introduce the dependency graph with `taskmd graph`
- [ ] Walk through using `taskmd next` for task recommendations
- [ ] Show launching the web dashboard with `taskmd web start`
- [ ] Add a section on using taskmd with AI assistants (Claude Code, Cursor)
- [ ] Include screenshots or terminal output examples for each step
- [ ] Add the guide to the docs site navigation

## Acceptance Criteria

- A new user can go from zero to a working taskmd project by following the guide
- Each step includes a command example and expected output
- The guide covers CLI, web UI, and AI assistant integration
- The guide is linked from the docs site homepage and navigation
- The guide is approachable for users unfamiliar with markdown-based task management
