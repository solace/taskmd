# get-task Skill — Improvement Suggestions

Based on iteration 1 benchmark results (2026-03-13).

## Current Performance

- **Quality delta**: +33% (but driven by implementation-specific `runs-get` assertion)
- **Speed delta**: -2.4s faster with skill (13.0s vs 15.4s)
- **Cost delta**: +$0.018 more with skill ($0.116 vs $0.098)
- **Output quality**: equivalent between both configs — both present all task details correctly

## Suggestions

### 1. Reduce context overhead
The skill loads CLAUDE.md and TASKMD_SPEC.md into context, adding tokens without clear benefit for a simple lookup operation. Consider:
- Making the skill self-contained with minimal instructions
- Not requiring CLAUDE.md/TASKMD_SPEC.md reads for basic get operations

### 2. Add value beyond raw file reading
The skill currently does what Claude can do natively (read a markdown file). To justify its existence, it should:
- **Show related tasks** — display tasks that depend on or block the requested task
- **Show worklog summary** — if a worklog exists, include recent entries
- **Show git activity** — recent commits touching files related to the task
- **Suggest next actions** — based on task status and subtask progress

### 3. Improve lookup capabilities
The real value of `taskmd get` over file reading is lookup by various criteria:
- **Fuzzy title matching** — "show me the SSO bug" should work
- **Multiple result handling** — when the query is ambiguous, show candidates
- **Cross-referencing** — show which tasks mention this one

### 4. Optimize for common follow-up patterns
After viewing a task, users often want to:
- Start working on it (`do-task`)
- Update its status
- See its dependencies
The skill could suggest these as next steps.

### 5. Better eval assertions
Replace `runs-get` (implementation-specific) with output-quality assertions:
- "Shows subtask completion progress (X of Y done)"
- "Includes acceptance criteria"
- "Shows task relationships/dependencies if any"
- "Formats output readably with clear sections"

### 6. Test at scale
With 5 tasks, Claude can easily discover and read files. Test with 50-100 tasks to find where `taskmd get` provides real time savings over manual file discovery.
