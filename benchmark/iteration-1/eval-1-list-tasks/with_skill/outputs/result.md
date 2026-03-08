# Eval 1: list-tasks skill benchmark

## Prompt

"show me all my tasks"

## Skill Output

The skill ran `taskmd list` and produced a table of all 5 baseline tasks:

```
id   title                                  status       priority  file
---  -------------------------------------  -----------  --------  ------------------------------
001  Fix login SSO bug                      in-progress  high      001-fix-login-sso-bug.md
002  Add full-text search                   pending      medium    002-add-search-feature.md
003  Patch XSS vulnerability in comments    pending      critical  003-critical-security-patch.md
004  Update README with setup instructions  pending      low       004-update-readme.md
005  Refactor authentication module         completed    high      005-refactor-auth-module.md
```

## Assertion Results

| Assertion | Pass/Fail | Notes |
|-----------|-----------|-------|
| runs-list-command | PASS | Skill correctly runs `taskmd list` to display tasks |
| displays-task-table | PASS | Output is a readable table with aligned columns |
| shows-key-fields | PASS | Shows ID, title, status, priority, and file for each task |

## Evaluation Notes

- **Environment**: Isolated temp directory with `taskmd init` + 5 fixture tasks
- **All 5 tasks displayed**: Yes — IDs 001-005 all present with correct metadata
- **Format quality**: Clean table format with aligned columns; includes all key fields (id, title, status, priority, file)
- **Correctness**: All statuses and priorities match the fixture data exactly

## Previous Run Issue

The previous result.md contained output from the real project (117 tasks) instead of the isolated fixture project (5 tasks). This was due to the skill being invoked without proper environment isolation. This run corrects that by using a temp directory with `taskmd init` and only the fixture tasks.

## Verdict

**PASS** — All 3 assertions satisfied. The list-tasks skill correctly runs `taskmd list` and displays all baseline tasks in a readable format.
