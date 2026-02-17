---
id: "150"
title: "Add type field support to web frontend"
status: pending
priority: medium
effort: medium
type: feature
dependencies: ["149"]
tags:
  - web
  - frontend
created: 2026-02-17
---

# Add Type Field Support to Web Frontend

## Objective

Wire up the `type` enum field (`feature`, `bug`, `improvement`, `chore`, `docs`) added in task 149 through the web frontend. The CLI backend already serves `type` on task objects and supports grouping/filtering by type. The web project needs to display, filter, edit, and group by this field.

## Tasks

### API & Types
- [ ] Add `type?: string` to `Task` interface in `apps/web/src/api/types.ts`
- [ ] Add `type?: string` to `BoardTask`, `TaskUpdateRequest`, and other relevant interfaces
- [ ] Add `TYPES` constant array and `TYPE_COLORS` color mapping

### Backend Handler
- [ ] Add `Type *string` field to `TaskUpdateRequest` struct in `apps/cli/internal/web/handlers.go`
- [ ] Map `Type` in `toUpdateRequest()` so edits persist

### Table & Display
- [ ] Add `type` column to `createTaskColumns()` in `columns.tsx`
- [ ] Create `TypeBadge` component in `Badges.tsx`
- [ ] Add `TYPE_COLORS` to `constants.ts`

### Filtering
- [ ] Add type filter to `FilterBar.tsx` (task list view)
- [ ] Add type filter to `BoardFilterBar.tsx` (board view)

### Edit Form
- [ ] Add type dropdown to `TaskEditForm.tsx`

### Board Grouping
- [ ] Add `"type"` to `groupByOptions` in `BoardPage.tsx`
- [ ] Add type filtering logic to board view

### Tests
- [ ] Add handler test for type update in `handlers_test.go`
- [ ] Verify existing frontend tests still pass

## Acceptance Criteria

- Type badge displays in the task table with appropriate colors
- Users can filter tasks by type in both list and board views
- Users can set/change type via the edit form
- Board view supports "group by type" with correct ordering
- Tasks without a type display gracefully (no badge, no error)
