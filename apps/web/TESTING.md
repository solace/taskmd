# Web App Test Coverage Improvement Plan

## Baseline (2026-03-28)

| Metric     | Current |
|------------|---------|
| Statements | 58.6%   |
| Branches   | 81.0%   |
| Functions  | 63.6%   |
| Lines      | 58.6%   |

271 tests across 30 test files. Infrastructure (Vitest, jsdom, coverage reporting) is fully set up.

## Coverage Milestones

| Milestone | Statements | Branches | Functions | Target         |
|-----------|------------|----------|-----------|----------------|
| M1        | 65%        | 83%      | 70%       | Next 2 sprints |
| M2        | 75%        | 85%      | 80%       | +2 sprints     |
| M3        | 80%        | 88%      | 85%       | +2 sprints     |
| M4        | 85%        | 90%      | 90%       | Ongoing        |

Update `vitest.config.ts` thresholds after each milestone is reached to prevent regressions.

## Top 10 Highest-Value Test Targets

Prioritized by risk (user-facing, complex logic, large untested surface):

| # | File                                  | Stmts | Why high-value                              |
|---|---------------------------------------|-------|---------------------------------------------|
| 1 | `components/layout/Shell.tsx`         | 0%    | Root layout, renders on every page          |
| 2 | `components/search/SearchDialog.tsx`  | 0%    | 202 lines, keyboard-driven, user-facing     |
| 3 | `components/validate/ValidateView.tsx`| 0%    | 101 lines, displays validation results      |
| 4 | `components/graph/GraphView.tsx`      | 0%    | 89 lines, complex visualization component   |
| 5 | `hooks/use-worklog.ts`                | 0%    | Data hook, affects task detail page          |
| 6 | `components/board/BoardFilterBar.tsx` | 36%   | Filter logic, user interaction heavy         |
| 7 | `components/board/BoardView.tsx`      | 45%   | Board orchestration, drag-and-drop          |
| 8 | `components/shared/KeyboardList.tsx`  | 45%   | Reusable, keyboard navigation logic          |
| 9 | `components/tasks/WorklogSection.tsx` | 14%   | Renders worklog content in task detail       |
| 10| `pages/TasksPage.tsx`                 | 0%    | Main task list page, high traffic            |

## Priority Tiers

### Tier 1: Core logic and data layer (target: M1)

These files contain logic that, if broken, would silently produce wrong results.

- `src/api/client.ts` -- already at 100%, maintain
- `src/hooks/use-*.ts` -- most are at 0%; they are thin wrappers but easy to test
- `src/components/tasks/TaskTable/filters.ts` -- 93%, close gap
- `src/components/tasks/TaskTable/sorting.ts` -- 100%, maintain
- `src/components/tasks/TaskTable/columns.tsx` -- 98%, close gap

### Tier 2: Key interactive components (target: M2)

Components with meaningful UI logic or user interaction flows.

- `Shell.tsx` -- routing, layout, global state
- `SearchDialog.tsx` -- keyboard shortcuts, search logic
- `BoardFilterBar.tsx` / `BoardView.tsx` -- filter + drag-and-drop
- `KeyboardList.tsx` -- reusable keyboard navigation
- `WorklogSection.tsx` -- rendering worklog entries

### Tier 3: Feature pages and views (target: M3)

Full page components, mostly orchestration.

- `GraphPage.tsx`, `GraphView.tsx`, `GraphFilters.tsx` -- graph visualization
- `ValidateView.tsx`, `ValidatePage.tsx` -- validation display
- `TasksPage.tsx`, `TracksPage.tsx`, `PhasesPage.tsx` -- page wrappers
- `App.tsx` -- routing setup

### Tier 4: Remaining components (target: M4)

Lower-risk, mostly presentational.

- `GraphLegend.tsx`, `GraphSearch.tsx`, `GraphStats.tsx`, `TaskNode.tsx`
- `TrackCard.tsx`, `TrackColumn.tsx`, `TracksView.tsx`, `FlexibleSection.tsx`
- `ProjectSelector.tsx`
- Remaining hooks (`use-live-reload.ts`, etc.)

## Testing Patterns and Helpers

### Existing patterns (keep using)

- `@testing-library/react` + `@testing-library/user-event` for component tests
- `vi.mock()` for API client mocking in component tests
- `test-setup.ts` for global test configuration

### Recommended additions to reduce friction

1. **API mock factory**: Create `src/test-utils/mock-api.ts` with pre-built mock responses for common API calls (`/tasks`, `/stats`, `/config`). Most hooks and pages need these.

2. **Render with providers helper**: Create `src/test-utils/render.ts` that wraps components with router + query client, since most components need both.

3. **Task fixture factory**: Create `src/test-utils/fixtures.ts` with `createTask()`, `createStats()`, etc. for building test data without repetitive boilerplate.

4. **Keyboard interaction helpers**: For `SearchDialog` and `KeyboardList` tests, shared helpers for simulating keyboard sequences.

## How to Contribute Tests

1. Pick a file from the priority list above
2. Create `<filename>.test.tsx` (or `.test.ts`) alongside it
3. Focus on behavior: what does the user see/do? Not implementation details
4. Run `pnpm test:coverage` to verify your contribution
5. Update this plan (check off items, update baseline) when milestones are hit

## Running Tests

```bash
pnpm test              # Run all tests
pnpm test:coverage     # Run with coverage report
pnpm test -- --run <pattern>  # Run specific tests
```

Coverage HTML report: `apps/web/coverage/index.html`
