---
name: divide-and-conquer
description: Pick up a task and execute it using subagents to parallelize independent workstreams. Use when the user wants to work on a task with maximum concurrency.
allowed-tools: Glob, Read, Write, Edit, Grep, Bash, Task, Agent, EnterPlanMode
---

# Divide and Conquer

Pick up a task and execute it by splitting the work into independent workstreams that run in parallel via subagents — no CLI required.

## Instructions

The user's query is in `$ARGUMENTS` (a task ID like `077` or a task name/keyword).

1. **Find the task file**:
   - Read `.taskmd.yaml` for custom `dir` (default: `tasks`) and `workflow` mode
   - Use `Glob` for `<task-dir>/**/*$ARGUMENTS*.md`
   - If multiple matches, read frontmatter to find the exact ID match
   - If not found, list available tasks

2. **Read the task file** with the `Read` tool to get the full description, subtasks, and acceptance criteria

3. **Mark the task as in-progress**:
   - Use `Edit` to change the status to `in-progress` in the frontmatter

4. **Start a worklog entry** (if worklogs are enabled):
   - Check `.taskmd.yaml` for `worklogs: true` — only create worklogs if explicitly enabled
   - If enabled, find or create worklog at `<task-dir>/<group>/.worklogs/<ID>.md`
   - Append a timestamped entry noting your approach

5. **Plan and identify workstreams**:
   - Use `EnterPlanMode` to design the overall approach
   - In the plan, include a reference to the original task ID and task file path
   - Analyze the task and break it into **independent workstreams** — pieces of work that can proceed in parallel without depending on each other's output
   - Examples of independent workstreams:
     - Implementation code vs. tests vs. documentation
     - Changes to separate packages or modules
     - Backend changes vs. frontend changes
   - If the task is simple enough that parallelization adds no benefit, just do it directly (skip to step 7)

6. **Launch subagents in parallel**:
   - Use the `Agent` tool to launch one subagent per independent workstream
   - Give each subagent a clear, self-contained prompt describing exactly what to do, including relevant file paths and context
   - Launch all independent subagents in a **single message** so they run concurrently
   - Use `isolation: "worktree"` for subagents that modify files, to avoid conflicts
   - Wait for all subagents to complete

7. **Coordinate and integrate**:
   - Review all subagent results for correctness
   - If subagents ran in worktrees, merge their changes (review diffs, resolve any conflicts)
   - If any subagent failed, handle the failure directly rather than re-launching
   - Run tests and linting to verify the integrated result
   - Check off subtasks (`- [x]`) in the task file using `Edit` as they are completed
   - Append worklog entries for key decisions and completed subtasks

8. **Write a final worklog entry** summarizing what was done, which workstreams ran in parallel, decisions made, and any open items

9. **Mark the task as done**:
   - Check `.taskmd.yaml` for `workflow` mode:
   - **Solo mode** (default):
     - If the task has `verify` checks: run them (bash via Bash tool, assert via code inspection)
     - If all pass, use `Edit` to set `status: completed`
     - If any fail, fix issues and try again
   - **PR-review mode**:
     - Open a PR, then use `Edit` to set `status: in-review` and add the PR URL to `pr` array
     - Stop — task completes on PR merge

## Worklog Format

Each worklog entry uses a timestamp heading followed by free-form notes:

```markdown
## 2026-02-15T10:30:00Z

Started divide-and-conquer execution of the search feature task.

**Workstreams identified:**

1. Core search implementation (subagent — worktree)
2. Test suite (subagent — worktree)
3. Documentation updates (subagent)

**Completed:**

- [x] All subagents finished successfully
- [x] Merged worktree changes
- [x] Tests passing after integration

**Decisions:** Used full-text search with SQLite rather than Elasticsearch.
```

See `SPEC_REFERENCE.md` (in the plugin root) for frontmatter schema, workflow modes, and verify checks.
