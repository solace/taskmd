package cli

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/driangle/taskmd/apps/cli/internal/model"
)

func createCommitMsgTestFiles(t *testing.T) string {
	t.Helper()
	tmpDir := t.TempDir()

	tasksDir := filepath.Join(tmpDir, "cli")
	if err := os.MkdirAll(tasksDir, 0755); err != nil {
		t.Fatalf("failed to create tasks dir: %v", err)
	}

	files := map[string]string{
		"cli/042-feature.md": `---
id: "042"
title: "Add commit-msg command"
status: completed
priority: medium
effort: medium
tags: [cli, git]
group: cli
created: 2026-02-16
---

# Add commit-msg command

- [x] Create command scaffolding
- [x] Implement message generation
- [ ] Add documentation
`,
		"cli/043-bugfix.md": `---
id: "043"
title: "Fix output formatting"
status: completed
priority: high
effort: small
tags: [cli, bug]
group: cli
created: 2026-02-16
---

# Fix output formatting

- [x] Fix newline handling
- [ ] Update tests
`,
		"044-no-group.md": `---
id: "044"
title: "Update README"
status: pending
priority: low
effort: small
tags: [docs]
created: 2026-02-16
---

# Update README

- [x] Add installation instructions
- [x] Add usage examples
`,
		"cli/045-new-pending.md": `---
id: "045"
title: "Add search feature"
status: pending
priority: medium
effort: medium
tags: [cli]
group: cli
created: 2026-02-17
---

# Add search feature
`,
		"cli/046-new-pending.md": `---
id: "046"
title: "Add filter feature"
status: pending
priority: medium
effort: small
tags: [cli]
group: cli
created: 2026-02-17
---

# Add filter feature
`,
	}

	for name, content := range files {
		path := filepath.Join(tmpDir, name)
		if err := os.WriteFile(path, []byte(content), 0644); err != nil {
			t.Fatalf("failed to create test file %s: %v", name, err)
		}
	}

	return tmpDir
}

func resetCommitMsgFlags() {
	commitMsgTaskID = ""
	commitMsgType = "chore"
	commitMsgBody = false
	commitMsgShort = false
	taskDir = "."
}

// mockGitDiffAndRoot sets up gitDiffFunc and gitRootFunc for tests.
// diffOutput is the fake diff content. gitRoot is the fake git root directory.
// Returns a cleanup function to restore the originals.
func mockGitDiffAndRoot(t *testing.T, diffOutput string, gitRoot string) {
	t.Helper()
	oldDiff := gitDiffFunc
	oldRoot := gitRootFunc
	gitDiffFunc = func(_ string) (string, error) { return diffOutput, nil }
	gitRootFunc = func(_ string) (string, error) { return gitRoot, nil }
	t.Cleanup(func() {
		gitDiffFunc = oldDiff
		gitRootFunc = oldRoot
	})
}

func captureCommitMsgOutput(t *testing.T) (string, error) {
	t.Helper()

	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runCommitMsg(commitMsgCmd, nil)

	w.Close()
	os.Stdout = oldStdout

	var buf bytes.Buffer
	buf.ReadFrom(r)
	return buf.String(), err
}

func TestCommitMsg_SingleTask(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir
	commitMsgTaskID = "042"

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(output, "chore(cli): add commit-msg command (task 042)") {
		t.Errorf("expected subject line with task ID, got:\n%s", output)
	}
}

func TestCommitMsg_TypeFlag(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir
	commitMsgTaskID = "042"
	commitMsgType = "feat"

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.HasPrefix(output, "feat(cli): add commit-msg command (task 042)") {
		t.Errorf("expected 'feat' prefix with task ID, got:\n%s", output)
	}
}

func TestCommitMsg_InvalidType(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir
	commitMsgTaskID = "042"
	commitMsgType = "invalid"

	_, err := captureCommitMsgOutput(t)
	if err == nil {
		t.Fatal("expected error for invalid type")
	}
	if !strings.Contains(err.Error(), "invalid commit type") {
		t.Errorf("expected 'invalid commit type' error, got: %v", err)
	}
}

func TestCommitMsg_BodyFlag(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir
	commitMsgTaskID = "042"
	commitMsgBody = true

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(output, "- Create command scaffolding") {
		t.Errorf("expected completed subtask in body, got:\n%s", output)
	}
	if !strings.Contains(output, "- Implement message generation") {
		t.Errorf("expected second completed subtask in body, got:\n%s", output)
	}
	// Unchecked subtask should NOT be included
	if strings.Contains(output, "Add documentation") {
		t.Errorf("unchecked subtask should not appear in body, got:\n%s", output)
	}
}

func TestCommitMsg_BodyFlagNoSubtasks(t *testing.T) {
	tmpDir := t.TempDir()
	content := `---
id: "099"
title: "Empty task"
status: pending
created: 2026-02-16
---

# Empty task

No subtasks here.
`
	if err := os.WriteFile(filepath.Join(tmpDir, "099-empty.md"), []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	resetCommitMsgFlags()
	taskDir = tmpDir
	commitMsgTaskID = "099"
	commitMsgBody = true

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Should still produce a valid message with subject line only (no body section)
	lines := strings.Split(strings.TrimSpace(output), "\n")
	if len(lines) < 1 {
		t.Fatal("expected at least a subject line")
	}
	if !strings.Contains(lines[0], "(task 099)") {
		t.Errorf("expected task ID in subject line, got: %s", lines[0])
	}
}

func TestCommitMsg_ShortFlag(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir
	commitMsgTaskID = "042"
	commitMsgShort = true

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	trimmed := strings.TrimSpace(output)
	if strings.Contains(trimmed, "\n") {
		t.Errorf("--short should produce single line, got:\n%s", output)
	}
	if !strings.HasPrefix(trimmed, "chore(cli):") || !strings.Contains(trimmed, "(task 042)") {
		t.Errorf("expected subject line with task ID, got: %s", trimmed)
	}
}

func TestCommitMsg_ShortWithBody(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir
	commitMsgTaskID = "042"
	commitMsgShort = true
	commitMsgBody = true

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// --short should override --body: single line only
	trimmed := strings.TrimSpace(output)
	if strings.Contains(trimmed, "\n") {
		t.Errorf("--short should suppress body even when --body is set, got:\n%s", output)
	}
}

func TestCommitMsg_NoGroupScope(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir
	commitMsgTaskID = "044"

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.HasPrefix(output, "chore: update README (task 044)") {
		t.Errorf("expected no scope for task without group, got:\n%s", output)
	}
}

func TestCommitMsg_TaskNotFound(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir
	commitMsgTaskID = "999"

	_, err := captureCommitMsgOutput(t)
	if err == nil {
		t.Fatal("expected error for nonexistent task")
	}
	if !strings.Contains(err.Error(), "task not found") {
		t.Errorf("expected 'task not found' error, got: %v", err)
	}
}

func TestCommitMsg_MultiTask(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir

	mockGitDiffAndRoot(t,
		"diff --git a/cli/042-feature.md b/cli/042-feature.md\n"+
			"--- a/cli/042-feature.md\n"+
			"+++ b/cli/042-feature.md\n"+
			"@@ -4 +4 @@\n"+
			"-status: pending\n"+
			"+status: completed\n"+
			"diff --git a/cli/043-bugfix.md b/cli/043-bugfix.md\n"+
			"--- a/cli/043-bugfix.md\n"+
			"+++ b/cli/043-bugfix.md\n"+
			"@@ -4 +4 @@\n"+
			"-status: pending\n"+
			"+status: completed\n",
		tmpDir)

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(output, "chore: complete tasks 042, 043") {
		t.Errorf("expected multi-task subject, got:\n%s", output)
	}
}

func TestCommitMsg_MultiTaskWithBody(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir
	commitMsgBody = true

	mockGitDiffAndRoot(t,
		"diff --git a/cli/042-feature.md b/cli/042-feature.md\n"+
			"+++ b/cli/042-feature.md\n"+
			"+status: completed\n"+
			"diff --git a/cli/043-bugfix.md b/cli/043-bugfix.md\n"+
			"+++ b/cli/043-bugfix.md\n"+
			"+status: completed\n",
		tmpDir)

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(output, "Add commit-msg command:") {
		t.Errorf("expected task title section in body, got:\n%s", output)
	}
	if !strings.Contains(output, "- Create command scaffolding") {
		t.Errorf("expected subtask from first task, got:\n%s", output)
	}
	if !strings.Contains(output, "Fix output formatting:") {
		t.Errorf("expected second task title section, got:\n%s", output)
	}
}

func TestCommitMsg_MultiTaskShort(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir
	commitMsgShort = true

	mockGitDiffAndRoot(t,
		"+++ b/cli/042-feature.md\n+status: completed\n"+
			"+++ b/cli/043-bugfix.md\n+status: completed\n",
		tmpDir)

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	trimmed := strings.TrimSpace(output)
	if strings.Contains(trimmed, "\n") {
		t.Errorf("--short should produce single line, got:\n%s", output)
	}
}

func TestCommitMsg_AutoInferFromDiff(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir

	mockGitDiffAndRoot(t,
		"diff --git a/cli/042-feature.md b/cli/042-feature.md\n"+
			"+++ b/cli/042-feature.md\n"+
			"@@ -4 +4 @@\n"+
			"-status: pending\n"+
			"+status: completed\n",
		tmpDir)

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(output, "chore(cli): add commit-msg command (task 042)") {
		t.Errorf("expected auto-detected task message with ID in header, got:\n%s", output)
	}
}

func TestCommitMsg_EmptyDiff(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir

	mockGitDiffAndRoot(t, "", tmpDir)

	_, err := captureCommitMsgOutput(t)
	if err == nil {
		t.Fatal("expected error for empty diff")
	}
	if !strings.Contains(err.Error(), "no completed tasks found") {
		t.Errorf("expected 'no completed tasks found' error, got: %v", err)
	}
}

func TestCommitMsg_DiffNoCompletedTasks(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir

	mockGitDiffAndRoot(t, "+++ b/cli/042-feature.md\n+status: in-progress\n", tmpDir)

	_, err := captureCommitMsgOutput(t)
	if err == nil {
		t.Fatal("expected error when no tasks changed to completed")
	}
	if !strings.Contains(err.Error(), "no completed tasks found") {
		t.Errorf("expected 'no completed tasks found' error, got: %v", err)
	}
}

// Unit tests for helper functions

func TestExtractCompletedSubtasks(t *testing.T) {
	tests := []struct {
		name string
		body string
		want []string
	}{
		{
			name: "mixed checked and unchecked",
			body: "- [x] Done one\n- [ ] Not done\n- [x] Done two\n",
			want: []string{"Done one", "Done two"},
		},
		{
			name: "uppercase X",
			body: "- [X] Done with uppercase\n",
			want: []string{"Done with uppercase"},
		},
		{
			name: "no subtasks",
			body: "Just some text\n",
			want: nil,
		},
		{
			name: "empty body",
			body: "",
			want: nil,
		},
		{
			name: "indented checkboxes",
			body: "  - [x] Indented item\n",
			want: []string{"Indented item"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := extractCompletedSubtasks(tt.body)
			if len(got) != len(tt.want) {
				t.Fatalf("extractCompletedSubtasks() = %v, want %v", got, tt.want)
			}
			for i := range got {
				if got[i] != tt.want[i] {
					t.Errorf("extractCompletedSubtasks()[%d] = %q, want %q", i, got[i], tt.want[i])
				}
			}
		})
	}
}

func TestParseCompletedFilesFromDiff(t *testing.T) {
	tests := []struct {
		name string
		diff string
		want []string
	}{
		{
			name: "single completed file",
			diff: "+++ b/tasks/cli/042.md\n@@ -4 +4 @@\n-status: pending\n+status: completed\n",
			want: []string{"tasks/cli/042.md"},
		},
		{
			name: "multiple completed files",
			diff: "+++ b/a.md\n+status: completed\n+++ b/b.md\n+status: completed\n",
			want: []string{"a.md", "b.md"},
		},
		{
			name: "non-completed status change",
			diff: "+++ b/a.md\n+status: in-progress\n",
			want: nil,
		},
		{
			name: "empty diff",
			diff: "",
			want: nil,
		},
		{
			name: "no status line",
			diff: "+++ b/a.md\n+title: something\n",
			want: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseCompletedFilesFromDiff(tt.diff)
			if len(got) != len(tt.want) {
				t.Fatalf("parseCompletedFilesFromDiff() = %v, want %v", got, tt.want)
			}
			for i := range got {
				if got[i] != tt.want[i] {
					t.Errorf("parseCompletedFilesFromDiff()[%d] = %q, want %q", i, got[i], tt.want[i])
				}
			}
		})
	}
}

func TestLowerFirst(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"Add feature", "add feature"},
		{"fix bug", "fix bug"},
		{"", ""},
		{"A", "a"},
		{"already lower", "already lower"},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			got := lowerFirst(tt.input)
			if got != tt.want {
				t.Errorf("lowerFirst(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}

func TestCommitMsg_AllowedTypes(t *testing.T) {
	types := []string{"feat", "fix", "chore", "docs", "test", "refactor"}
	for _, typ := range types {
		t.Run(typ, func(t *testing.T) {
			tmpDir := createCommitMsgTestFiles(t)
			resetCommitMsgFlags()
			taskDir = tmpDir
			commitMsgTaskID = "042"
			commitMsgType = typ

			output, err := captureCommitMsgOutput(t)
			if err != nil {
				t.Fatalf("unexpected error for type %q: %v", typ, err)
			}

			if !strings.HasPrefix(output, typ+"(cli):") {
				t.Errorf("expected prefix %q, got:\n%s", typ+"(cli):", output)
			}
			if !strings.Contains(output, "(task 042)") {
				t.Errorf("expected task ID in header, got:\n%s", output)
			}
		})
	}
}

func TestCommitMsg_MessageFormat(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir
	commitMsgTaskID = "042"
	commitMsgType = "feat"
	commitMsgBody = true

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Verify format: subject, blank line, body
	parts := strings.Split(strings.TrimSpace(output), "\n\n")
	if len(parts) != 2 {
		t.Fatalf("expected 2 parts (subject, body), got %d: %v", len(parts), parts)
	}

	subject := parts[0]
	if subject != "feat(cli): add commit-msg command (task 042)" {
		t.Errorf("unexpected subject: %s", subject)
	}

	body := parts[1]
	if !strings.Contains(body, "- Create command scaffolding") {
		t.Errorf("unexpected body: %s", body)
	}
}

// Tests for new pending task detection

func TestCommitMsg_SingleNewPendingTask(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir

	mockGitDiffAndRoot(t,
		"diff --git a/cli/045-new-pending.md b/cli/045-new-pending.md\n"+
			"new file mode 100644\n"+
			"--- /dev/null\n"+
			"+++ b/cli/045-new-pending.md\n"+
			"@@ -0,0 +1,10 @@\n"+
			"+---\n"+
			"+id: \"045\"\n"+
			"+title: \"Add search feature\"\n"+
			"+status: pending\n"+
			"+---\n",
		tmpDir)

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := "chore: added task 045\n"
	if output != expected {
		t.Errorf("expected %q, got %q", expected, output)
	}
}

func TestCommitMsg_MultipleNewPendingTasks(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir

	mockGitDiffAndRoot(t,
		"diff --git a/cli/045-new-pending.md b/cli/045-new-pending.md\n"+
			"new file mode 100644\n"+
			"--- /dev/null\n"+
			"+++ b/cli/045-new-pending.md\n"+
			"@@ -0,0 +1,10 @@\n"+
			"+status: pending\n"+
			"diff --git a/cli/046-new-pending.md b/cli/046-new-pending.md\n"+
			"new file mode 100644\n"+
			"--- /dev/null\n"+
			"+++ b/cli/046-new-pending.md\n"+
			"@@ -0,0 +1,10 @@\n"+
			"+status: pending\n",
		tmpDir)

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := "chore: added tasks 045, 046\n"
	if output != expected {
		t.Errorf("expected %q, got %q", expected, output)
	}
}

func TestCommitMsg_NewPendingWithTypeFlag(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir
	commitMsgType = "feat"

	mockGitDiffAndRoot(t,
		"diff --git a/cli/045-new-pending.md b/cli/045-new-pending.md\n"+
			"new file mode 100644\n"+
			"--- /dev/null\n"+
			"+++ b/cli/045-new-pending.md\n"+
			"+status: pending\n",
		tmpDir)

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := "feat: added task 045\n"
	if output != expected {
		t.Errorf("expected %q, got %q", expected, output)
	}
}

func TestCommitMsg_CompletedTakesPriorityOverNewPending(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir

	// Diff contains both a completed task and a new pending task
	mockGitDiffAndRoot(t,
		"diff --git a/cli/042-feature.md b/cli/042-feature.md\n"+
			"--- a/cli/042-feature.md\n"+
			"+++ b/cli/042-feature.md\n"+
			"@@ -4 +4 @@\n"+
			"-status: pending\n"+
			"+status: completed\n"+
			"diff --git a/cli/045-new-pending.md b/cli/045-new-pending.md\n"+
			"new file mode 100644\n"+
			"--- /dev/null\n"+
			"+++ b/cli/045-new-pending.md\n"+
			"+status: pending\n",
		tmpDir)

	output, err := captureCommitMsgOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Should use completed-task message, not "added task" message
	if !strings.Contains(output, "chore(cli): add commit-msg command (task 042)") {
		t.Errorf("expected completed task message to take priority, got:\n%s", output)
	}
	if strings.Contains(output, "added task") {
		t.Errorf("should not contain 'added task' when completed tasks exist, got:\n%s", output)
	}
}

func TestCommitMsg_ModifiedPendingNotDetected(t *testing.T) {
	tmpDir := createCommitMsgTestFiles(t)
	resetCommitMsgFlags()
	taskDir = tmpDir

	// File was modified (not new) with status: pending — should NOT be detected
	mockGitDiffAndRoot(t,
		"diff --git a/cli/045-new-pending.md b/cli/045-new-pending.md\n"+
			"--- a/cli/045-new-pending.md\n"+
			"+++ b/cli/045-new-pending.md\n"+
			"@@ -4 +4 @@\n"+
			"+status: pending\n",
		tmpDir)

	_, err := captureCommitMsgOutput(t)
	if err == nil {
		t.Fatal("expected error when only modified (not new) pending file staged")
	}
	if !strings.Contains(err.Error(), "no completed tasks found") {
		t.Errorf("expected 'no completed tasks found' error, got: %v", err)
	}
}

func TestParseNewPendingFilesFromDiff(t *testing.T) {
	tests := []struct {
		name string
		diff string
		want []string
	}{
		{
			name: "single new pending file",
			diff: "--- /dev/null\n+++ b/tasks/cli/045.md\n+status: pending\n",
			want: []string{"tasks/cli/045.md"},
		},
		{
			name: "multiple new pending files",
			diff: "--- /dev/null\n+++ b/a.md\n+status: pending\n--- /dev/null\n+++ b/b.md\n+status: pending\n",
			want: []string{"a.md", "b.md"},
		},
		{
			name: "modified file with pending status ignored",
			diff: "--- a/tasks/cli/045.md\n+++ b/tasks/cli/045.md\n+status: pending\n",
			want: nil,
		},
		{
			name: "new file with non-pending status ignored",
			diff: "--- /dev/null\n+++ b/a.md\n+status: completed\n",
			want: nil,
		},
		{
			name: "empty diff",
			diff: "",
			want: nil,
		},
		{
			name: "mixed new and modified files",
			diff: "--- /dev/null\n+++ b/new.md\n+status: pending\n--- a/old.md\n+++ b/old.md\n+status: pending\n",
			want: []string{"new.md"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseNewPendingFilesFromDiff(tt.diff)
			if len(got) != len(tt.want) {
				t.Fatalf("parseNewPendingFilesFromDiff() = %v, want %v", got, tt.want)
			}
			for i := range got {
				if got[i] != tt.want[i] {
					t.Errorf("parseNewPendingFilesFromDiff()[%d] = %q, want %q", i, got[i], tt.want[i])
				}
			}
		})
	}
}

func TestBuildAddedTaskMessage(t *testing.T) {
	tests := []struct {
		name       string
		taskIDs    []string
		commitType string
		want       string
	}{
		{
			name:       "single task",
			taskIDs:    []string{"045"},
			commitType: "chore",
			want:       "chore: added task 045\n",
		},
		{
			name:       "multiple tasks",
			taskIDs:    []string{"045", "046"},
			commitType: "chore",
			want:       "chore: added tasks 045, 046\n",
		},
		{
			name:       "custom type",
			taskIDs:    []string{"045"},
			commitType: "feat",
			want:       "feat: added task 045\n",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var tasks []*model.Task
			for _, id := range tt.taskIDs {
				tasks = append(tasks, &model.Task{ID: id})
			}
			got := buildAddedTaskMessage(tasks, tt.commitType)
			if got != tt.want {
				t.Errorf("buildAddedTaskMessage() = %q, want %q", got, tt.want)
			}
		})
	}
}
