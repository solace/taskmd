---
id: "172"
title: "Document missing web features, API endpoints, and config options"
status: completed
priority: medium
effort: medium
type: docs
tags:
  - docs
  - web
  - config
created: 2026-02-20
---

# Document missing web features, API endpoints, and config options

## Objective

Fill documentation gaps for web pages, API endpoints, and configuration options that exist but are not covered in the documentation.

## Tasks

### Web pages — add to `apps/docs/guide/web.md` and `docs/guides/web-guide.md`

- [x] Add Next (Recommendations) page section — URL `/next`, shows scored task recommendations with reasons and critical path info
- [x] Add Tracks page section — URL `/tracks`, shows parallel work tracks with scope-based grouping
- [x] Add Validate page section — URL `/validate`, shows validation errors and warnings
- [x] Add Task Detail page section — URL `/tasks/:id`, shows full task detail with markdown body, worklog, edit form

### Web features — update existing sections

- [x] Document task editing via web UI (Board drag-and-drop, task detail edit form)
- [x] Document `web export` static site generation in web guides
- [x] Document `--readonly` mode in web guides
- [x] Document tag/status/priority/effort multi-filter on Board page
- [x] Document search and node highlighting on Graph page

### API endpoints — add to API section in both web guides

- [x] Document `GET /api/config` endpoint
- [x] Document `GET /api/tasks/{id}` endpoint
- [x] Document `GET /api/tasks/{id}/worklog` endpoint
- [x] Document `PUT /api/tasks/{id}` endpoint
- [x] Document `GET /api/graph/mermaid` endpoint
- [x] Document `GET /api/next` endpoint
- [x] Document `GET /api/tracks` endpoint
- [x] Document `GET /api/validate` endpoint
- [x] Document `GET /api/search` endpoint
- [x] Document `GET /api/events` (SSE) endpoint

### Configuration — update `apps/docs/reference/configuration.md`

- [x] Add `ignore` option to Supported Options table (string[], directories to ignore when scanning)
- [x] Add `worklogs` option to Supported Options table (boolean, enable/disable worklog files)
- [x] Add `workflow` option to Supported Options table (string, `solo` or `pr-review`)
- [x] Add `todos.exclude` option to Supported Options table (string[], glob patterns for todo scanning exclusion)

## Acceptance Criteria

- All 8 web pages are documented in both web guides
- All 14 API endpoints are listed with method, path, parameters, and response format
- All config keys supported in `.taskmd.yaml` appear in the Supported Options table
- Documentation follows existing style conventions in each file
