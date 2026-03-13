---
name: validate-tasks
description: Validate task files for format and convention errors. Use when the user wants to check their task files.
allowed-tools: Glob, Read
---

# Validate Tasks

Validate all task files for correctness — no CLI required.

## Instructions

The user's arguments are in `$ARGUMENTS` (e.g. a directory path to scope validation).

1. **Find the task directory**:
   - Read `.taskmd.yaml` if it exists to check for a custom `dir` field
   - Default to `tasks` if not configured
   - If `$ARGUMENTS` contains a directory path, validate only that directory

2. **Scan for task files**: Use `Glob` with `<task-dir>/**/*.md`
   - Exclude `.worklogs/` directories

3. **Read and validate each task file**. For each file, check:

   ### Required checks (errors)

   **a. Frontmatter exists**
   - File must start with `---` and contain a second `---` delimiter
   - Error: "Missing YAML frontmatter"

   **b. Required fields present**
   - `id`: Must be a non-empty string
   - `title`: Must be a non-empty string
   - Error: "Missing required field: <field>"

   **c. Valid enum values**
   - `status`: must be one of: pending, in-progress, completed, in-review, blocked, cancelled
   - `priority`: must be one of: low, medium, high, critical
   - `effort`: must be one of: small, medium, large
   - `type`: must be one of: feature, bug, improvement, chore, docs
   - Error: "Invalid <field> value '<value>'. Valid values: <list>"

   **d. Unique IDs**
   - Collect all task IDs; no duplicates allowed
   - Error: "Duplicate ID '<id>' found in: <file1>, <file2>"

   **e. Valid dependency references**
   - Each ID in `dependencies` must exist as a task ID in the project
   - Error: "Unknown dependency '<id>' in task '<task-id>'"

   **f. No circular dependencies**
   - Follow dependency chains; no task should transitively depend on itself
   - Error: "Circular dependency detected: <id1> → <id2> → ... → <id1>"

   **g. Valid parent references**
   - `parent` must reference an existing task ID
   - No self-references (parent != own id)
   - No parent cycles
   - Error: "Invalid parent reference '<id>' in task '<task-id>'"

   ### Advisory checks (warnings)

   **h. File naming convention**
   - Files should match `<ID>-<slug>.md` pattern
   - Warning: "File '<name>' doesn't follow naming convention"

   **i. Missing created date**
   - Warning: "Task '<id>' has no created date"

   **j. Phase validation** (if phases configured in `.taskmd.yaml`)
   - Task `phase` values should match a configured phase `id`
   - Warning: "Task '<id>' references unknown phase '<phase>'"

4. **Report results**:
   ```
   Validated N task files

   Errors (M):
   ✗ tasks/cli/042-fix-bug.md: Missing required field: title
   ✗ tasks/web/003-auth.md: Invalid status value 'done'. Valid values: pending, in-progress, completed, in-review, blocked, cancelled
   ✗ Duplicate ID '042' found in: tasks/cli/042-fix-bug.md, tasks/web/042-other.md

   Warnings (W):
   ⚠ tasks/old-task.md: File doesn't follow naming convention
   ⚠ tasks/cli/043-new.md: No created date

   Result: FAIL (M errors, W warnings)
   ```

   If no errors: `Result: PASS (0 errors, W warnings)`

See `SPEC_REFERENCE.md` (in the plugin root) for valid field values and validation rules.
