import { vi } from "vitest";
import type {
  BoardGroup,
  GraphData,
  Recommendation,
  Stats,
  Task,
  TracksResult,
  ValidationResult,
  WorklogEntry,
  SearchResult,
} from "../api/types.ts";

/**
 * Mutable mock state for hooks. Modify these in individual tests and
 * reset them in `beforeEach` with `resetMockApi()`.
 */
export interface MockApiState {
  tasks: { data?: Task[]; error?: Error; isLoading: boolean };
  board: { data?: BoardGroup[]; error?: Error; isLoading: boolean };
  stats: { data?: Stats; error?: Error; isLoading: boolean };
  graph: { data?: GraphData; error?: Error; isLoading: boolean };
  next: { data?: Recommendation[]; error?: Error; isLoading: boolean };
  validate: { data?: ValidationResult; error?: Error; isLoading: boolean };
  worklog: { data?: WorklogEntry[]; error?: Error; isLoading: boolean };
  search: { data?: SearchResult[]; error?: Error; isLoading: boolean };
  tracks: { data?: TracksResult; error?: Error; isLoading: boolean };
  config: { readonly: boolean; version: string; phases: { id: string; name: string; description: string }[] };
  phase: { phase: string | null };
  project: { project: string | null };
}

function createDefaultState(): MockApiState {
  return {
    tasks: { data: undefined, error: undefined, isLoading: false },
    board: { data: undefined, error: undefined, isLoading: false },
    stats: { data: undefined, error: undefined, isLoading: false },
    graph: { data: undefined, error: undefined, isLoading: false },
    next: { data: undefined, error: undefined, isLoading: false },
    validate: { data: undefined, error: undefined, isLoading: false },
    worklog: { data: undefined, error: undefined, isLoading: false },
    search: { data: undefined, error: undefined, isLoading: false },
    tracks: { data: undefined, error: undefined, isLoading: false },
    config: { readonly: false, version: "1.0.0", phases: [] },
    phase: { phase: null },
    project: { project: null },
  };
}

export const mockApi: MockApiState = createDefaultState();

/** Reset all mock state to defaults. Call in `beforeEach`. */
export function resetMockApi() {
  Object.assign(mockApi, createDefaultState());
}

/** The shared mutate mock — assert on it to verify refetch calls. */
export const mockMutate = vi.fn();

/**
 * Pre-built mock factories for hooks.
 *
 * **Important:** Because `vi.mock` is hoisted above imports, you cannot
 * reference `hookMocks` directly inside a `vi.mock()` factory. Instead,
 * use mutable module-level variables that reference `mockApi`:
 *
 * ```ts
 * // ✅ Works — mutable variables are accessible from hoisted vi.mock
 * let mockBoardData = mockGroups;
 * vi.mock("../hooks/use-board.ts", () => ({
 *   useBoard: () => ({ data: mockBoardData, error: undefined, isLoading: false, mutate: vi.fn() }),
 * }));
 *
 * // ❌ Does NOT work — hookMocks is an import, not accessible in hoisted factory
 * vi.mock("../hooks/use-board.ts", () => hookMocks.board());
 * ```
 *
 * These factories are still useful for **dynamic mocking** with `vi.mocked()`:
 * ```ts
 * vi.mock("../hooks/use-stats.ts", () => ({ useStats: vi.fn() }));
 * import { useStats } from "../hooks/use-stats.ts";
 * const mockUseStats = vi.mocked(useStats);
 * mockUseStats.mockReturnValue(hookMocks.stats().useStats());
 * ```
 */
export const hookMocks = {
  tasks: () => ({
    useTasks: () => ({ ...mockApi.tasks, mutate: mockMutate }),
  }),
  board: () => ({
    useBoard: () => ({ ...mockApi.board, mutate: mockMutate }),
  }),
  stats: () => ({
    useStats: () => ({ ...mockApi.stats, mutate: mockMutate }),
  }),
  graph: () => ({
    useGraph: () => ({ ...mockApi.graph, mutate: mockMutate }),
  }),
  next: () => ({
    useNext: () => ({ ...mockApi.next, mutate: mockMutate }),
  }),
  validate: () => ({
    useValidate: () => ({ ...mockApi.validate, mutate: mockMutate }),
  }),
  worklog: () => ({
    useWorklog: () => ({ ...mockApi.worklog, mutate: mockMutate }),
  }),
  search: () => ({
    useSearch: () => ({ ...mockApi.search, mutate: mockMutate }),
  }),
  tracks: () => ({
    useTracks: () => ({ ...mockApi.tracks, mutate: mockMutate }),
  }),
  config: () => ({
    useConfig: () => mockApi.config,
  }),
  phase: () => ({
    usePhase: () => mockApi.phase,
  }),
  project: () => ({
    useProject: () => mockApi.project,
  }),
  updateTask: () => ({
    updateTask: vi.fn(),
  }),
};
