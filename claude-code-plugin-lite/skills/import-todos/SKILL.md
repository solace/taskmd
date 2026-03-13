---
name: import-todos
description: Discover TODO/FIXME comments in the codebase and convert selected ones into task files. Use when the user wants to turn code TODOs into tracked tasks.
allowed-tools: Glob, Read, Write, Grep, Skill
---

# Import TODOs

Discover TODO/FIXME comments in the codebase and convert selected ones into task files — no CLI required.

## Instructions

The user may optionally provide flags in `$ARGUMENTS` (e.g. `--dir ./src`, `--marker TODO`).

1. **Discover TODOs**: Use `Grep` to search for TODO/FIXME/HACK/XXX/NOTE/BUG/OPTIMIZE comments:
   - Default pattern: `(TODO|FIXME|HACK|XXX|BUG|OPTIMIZE)\b`
   - If `--marker` is specified, search for only that marker
   - If `--dir` is specified, search in that directory; otherwise search the project root
   - Exclude common non-source directories: `node_modules`, `vendor`, `.git`, `dist`, `build`
   - Collect: file path, line number, marker type, and comment text

2. **Handle empty results**: If no TODOs are found, inform the user:
   > "No TODO/FIXME comments found in the codebase. Try widening your search with `--dir` or removing `--marker` filters."
   - Stop here

3. **Check for duplicates**:
   - Read `.taskmd.yaml` for custom task `dir` (default: `tasks`)
   - Use `Glob` for `<task-dir>/**/*.md` and read frontmatter titles
   - For each TODO, check if its text closely matches an existing task title (case-insensitive substring match)
   - Flag potential duplicates

4. **Present the list**: Display the TODOs as a numbered list:
   ```
   Found N TODO comments:

     #  | Marker | File                          | Text
   -----|--------|-------------------------------|----------------------------------
     1  | TODO   | src/auth.go:42                | implement rate limiting
     2  | FIXME  | src/handler.go:15             | handle timeout errors
     3  | TODO   | src/db.go:88                  | add connection pooling
    *4  | TODO   | src/cache.go:12               | optimize cache (possible duplicate: task 045)
   ```

   Mark potential duplicates with `*` and note the matching task.

5. **Ask the user**: Ask which TODOs to convert into tasks. Accept:
   - Specific numbers: `1, 3, 5`
   - Ranges: `1-5`
   - A combination: `1-3, 7, 9-11`
   - `all` to convert everything
   - `none` or empty to cancel

6. **Handle cancellation**: If the user selects none or cancels:
   > "No TODOs selected. Exiting."

7. **Convert selected TODOs**: For each selected TODO, invoke the `/add-task` skill using the `Skill` tool:
   - Use the TODO text as the task description
   - Include the source file and line number as context
   - Use the marker type as a hint for the task type (e.g. FIXME/BUG → type `bug`, TODO → type `feature`)
   - Format the skill argument as: `<marker>: <text> (from <file>:<line>)`

   Example Skill invocation:
   ```
   Skill: add-task
   Args: "TODO: implement rate limiting (from src/auth.go:42)"
   ```

8. **Report results**: After all tasks are created, summarize:
   ```
   Created N task(s) from TODOs:
   - Task <ID>: <title> (from <file>:<line>)
   - Task <ID>: <title> (from <file>:<line>)
   ```

See `SPEC_REFERENCE.md` (in the plugin root) for frontmatter schema and valid field values.
