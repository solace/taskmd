---
id: "172"
title: "Document missing web features, API endpoints, and config options"
status: pending
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

- [ ] Add Next (Recommendations) page section — URL `/next`, shows scored task recommendations with reasons and critical path info
- [ ] Add Tracks page section — URL `/tracks`, shows parallel work tracks with scope-based grouping
- [ ] Add Validate page section — URL `/validate`, shows validation errors and warnings
- [ ] Add Task Detail page section — URL `/tasks/:id`, shows full task detail with markdown body, worklog, edit form

### Web features — update existing sections

- [ ] Document task editing via web UI (Board drag-and-drop, task detail edit form)
- [ ] Document `web export` static site generation in web guides
- [ ] Document `--readonly` mode in web guides
- [ ] Document tag/status/priority/effort multi-filter on Board page
- [ ] Document search and node highlighting on Graph page

### API endpoints — add to API section in both web guides

- [ ] Document `GET /api/config` endpoint
- [ ] Document `GET /api/tasks/{id}` endpoint
- [ ] Document `GET /api/tasks/{id}/worklog` endpoint
- [ ] Document `PUT /api/tasks/{id}` endpoint
- [ ] Document `GET /api/graph/mermaid` endpoint
- [ ] Document `GET /api/next` endpoint
- [ ] Document `GET /api/tracks` endpoint
- [ ] Document `GET /api/validate` endpoint
- [ ] Document `GET /api/search` endpoint
- [ ] Document `GET /api/events` (SSE) endpoint

### Configuration — update `apps/docs/reference/configuration.md`

- [ ] Add `ignore` option to Supported Options table (string[], directories to ignore when scanning)
- [ ] Add `worklogs` option to Supported Options table (boolean, enable/disable worklog files)
- [ ] Add `workflow` option to Supported Options table (string, `solo` or `pr-review`)
- [ ] Add `todos.exclude` option to Supported Options table (string[], glob patterns for todo scanning exclusion)

## Acceptance Criteria

- All 8 web pages are documented in both web guides
- All 14 API endpoints are listed with method, path, parameters, and response format
- All config keys supported in `.taskmd.yaml` appear in the Supported Options table
- Documentation follows existing style conventions in each file
