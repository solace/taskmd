//go:build e2e

package e2e

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// --- Unknown / missing command tests ---

func TestError_UnknownCommand(t *testing.T) {
	dir := setupTaskDir(t)

	result := run(t, dir, "nonexistent-command")

	if result.ExitCode == 0 {
		t.Error("expected non-zero exit code for unknown command")
	}
	if !strings.Contains(result.Stderr, "unknown command") {
		t.Errorf("expected stderr to mention 'unknown command', got:\n%s", result.Stderr)
	}
	// Should not contain a stack trace.
	assertNoStackTrace(t, result.Stderr)
}

func TestError_UnknownCommand_SuggestsAlternatives(t *testing.T) {
	dir := setupTaskDir(t)

	// "listt" is close to "list" — cobra may suggest it.
	result := run(t, dir, "listt")

	if result.ExitCode == 0 {
		t.Error("expected non-zero exit code for misspelled command")
	}
	// Cobra typically prints "Did you mean this?" for close matches.
	if !strings.Contains(result.Stderr, "list") {
		t.Errorf("expected stderr to suggest 'list', got:\n%s", result.Stderr)
	}
}

// --- Missing required args tests ---

func TestError_SetNoArgs(t *testing.T) {
	dir := setupTaskDir(t)

	result := run(t, dir, "set")

	if result.ExitCode == 0 {
		t.Error("expected non-zero exit code when 'set' is run without arguments")
	}
	if !strings.Contains(result.Stderr, "task ID required") {
		t.Errorf("expected stderr to mention 'task ID required', got:\n%s", result.Stderr)
	}
	assertNoStackTrace(t, result.Stderr)
}

func TestError_SetNoUpdateFlags(t *testing.T) {
	dir := setupTaskDir(t)

	result := run(t, dir, "set", "001")

	if result.ExitCode == 0 {
		t.Error("expected non-zero exit code when 'set' has no update flags")
	}
	if !strings.Contains(result.Stderr, "nothing to update") {
		t.Errorf("expected stderr to mention 'nothing to update', got:\n%s", result.Stderr)
	}
	assertNoStackTrace(t, result.Stderr)
}

func TestError_SetNonExistentTask(t *testing.T) {
	dir := setupTaskDir(t)

	result := run(t, dir, "set", "999", "--status", "pending")

	if result.ExitCode == 0 {
		t.Error("expected non-zero exit code when setting non-existent task")
	}
	if !strings.Contains(result.Stderr, "task not found") {
		t.Errorf("expected stderr to mention 'task not found', got:\n%s", result.Stderr)
	}
	assertNoStackTrace(t, result.Stderr)
}

func TestError_GetNonExistentTask(t *testing.T) {
	dir := setupTaskDir(t)

	result := run(t, dir, "get", "999")

	if result.ExitCode == 0 {
		t.Error("expected non-zero exit code for getting non-existent task")
	}
	if !strings.Contains(result.Stderr, "task not found") {
		t.Errorf("expected stderr to mention 'task not found', got:\n%s", result.Stderr)
	}
	assertNoStackTrace(t, result.Stderr)
}

// --- Invalid flag value tests ---

func TestError_SetInvalidStatus(t *testing.T) {
	dir := setupTaskDir(t)

	result := run(t, dir, "set", "001", "--status", "bogus")

	if result.ExitCode == 0 {
		t.Error("expected non-zero exit code for invalid status value")
	}
	// Should mention the invalid value and list valid options.
	if !strings.Contains(result.Stderr, "invalid status") {
		t.Errorf("expected stderr to mention 'invalid status', got:\n%s", result.Stderr)
	}
	if !strings.Contains(result.Stderr, "pending") {
		t.Errorf("expected stderr to list valid status values, got:\n%s", result.Stderr)
	}
	assertNoStackTrace(t, result.Stderr)
}

func TestError_InvalidOutputFormat(t *testing.T) {
	dir := setupTaskDir(t)
	writeTask(t, dir, "001-test.md", "001", "Test Task", "pending", nil)

	cmds := []struct {
		name string
		args []string
	}{
		{"validate", []string{"validate", "--format", "bogus"}},
		{"list", []string{"list", "--format", "bogus"}},
	}

	for _, tc := range cmds {
		t.Run(tc.name, func(t *testing.T) {
			result := run(t, dir, tc.args...)

			if result.ExitCode == 0 {
				t.Errorf("expected non-zero exit code for invalid format in %s", tc.name)
			}
			if !strings.Contains(result.Stderr, "unsupported format") {
				t.Errorf("expected stderr to mention 'unsupported format', got:\n%s", result.Stderr)
			}
			assertNoStackTrace(t, result.Stderr)
		})
	}
}

// --- Validate with malformed task files ---

func TestError_ValidateInvalidStatus(t *testing.T) {
	dir := setupTaskDir(t)

	writeTaskWithContent(t, dir, "bad-status.md", `---
id: "001"
title: "Bad Status Task"
status: bogus-status
priority: medium
---

# Bad Status Task
`)

	result := run(t, dir, "validate", "--format", "json")

	if result.ExitCode == 0 {
		t.Error("expected non-zero exit code for task with invalid status")
	}

	var validation struct {
		Errors int `json:"errors"`
		Issues []struct {
			Level   string `json:"level"`
			Message string `json:"message"`
		} `json:"issues"`
	}
	mustParseJSON(t, result.Stdout, &validation)

	if validation.Errors == 0 {
		t.Error("expected validation errors for invalid status")
	}

	found := false
	for _, issue := range validation.Issues {
		if strings.Contains(issue.Message, "invalid status") {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("expected an issue about invalid status, got: %+v", validation.Issues)
	}
}

func TestError_ValidateDuplicateIDs(t *testing.T) {
	dir := setupTaskDir(t)

	writeTask(t, dir, "001-first.md", "001", "First Task", "pending", nil)
	writeTask(t, dir, "001-second.md", "001", "Second Task", "pending", nil)

	result := run(t, dir, "validate", "--format", "json")

	if result.ExitCode == 0 {
		t.Error("expected non-zero exit code for duplicate task IDs")
	}

	var validation struct {
		Errors int `json:"errors"`
		Issues []struct {
			Message string `json:"message"`
		} `json:"issues"`
	}
	mustParseJSON(t, result.Stdout, &validation)

	if validation.Errors == 0 {
		t.Error("expected validation errors for duplicate IDs")
	}

	found := false
	for _, issue := range validation.Issues {
		if strings.Contains(issue.Message, "duplicate task ID") {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("expected an issue about duplicate IDs, got: %+v", validation.Issues)
	}
}

func TestError_ValidateMissingDependency(t *testing.T) {
	dir := setupTaskDir(t)

	writeTask(t, dir, "001-dep.md", "001", "Dependent Task", "pending", []string{"999"})

	result := run(t, dir, "validate", "--format", "json")

	if result.ExitCode == 0 {
		t.Error("expected non-zero exit code for missing dependency")
	}

	var validation struct {
		Errors int `json:"errors"`
		Issues []struct {
			Message string `json:"message"`
		} `json:"issues"`
	}
	mustParseJSON(t, result.Stdout, &validation)

	found := false
	for _, issue := range validation.Issues {
		if strings.Contains(issue.Message, "non-existent task") {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("expected an issue about non-existent dependency, got: %+v", validation.Issues)
	}
}

func TestError_ValidateCircularDependency(t *testing.T) {
	dir := setupTaskDir(t)

	writeTask(t, dir, "001-a.md", "001", "Task A", "pending", []string{"002"})
	writeTask(t, dir, "002-b.md", "002", "Task B", "pending", []string{"001"})

	result := run(t, dir, "validate", "--format", "json")

	if result.ExitCode == 0 {
		t.Error("expected non-zero exit code for circular dependency")
	}

	var validation struct {
		Errors int `json:"errors"`
		Issues []struct {
			Message string `json:"message"`
		} `json:"issues"`
	}
	mustParseJSON(t, result.Stdout, &validation)

	found := false
	for _, issue := range validation.Issues {
		if strings.Contains(issue.Message, "circular dependency") {
			found = true
			break
		}
	}
	if !found {
		t.Errorf("expected an issue about circular dependency, got: %+v", validation.Issues)
	}
}

func TestError_ValidateStrictWarnings(t *testing.T) {
	dir := setupTaskDir(t)

	// A minimal valid task — strict mode should produce warnings about
	// missing optional fields (effort, group, tags).
	writeTaskWithContent(t, dir, "001-minimal.md", `---
id: "001"
title: "Minimal Task"
status: pending
priority: medium
---

# Minimal Task
`)

	result := run(t, dir, "validate", "--strict", "--format", "json")

	// Exit code 2 means valid but with warnings in strict mode.
	if result.ExitCode != 2 {
		t.Errorf("expected exit code 2 for strict warnings, got %d\nstdout: %s\nstderr: %s",
			result.ExitCode, result.Stdout, result.Stderr)
	}

	var validation struct {
		Errors   int `json:"errors"`
		Warnings int `json:"warnings"`
	}
	mustParseJSON(t, result.Stdout, &validation)

	if validation.Errors != 0 {
		t.Errorf("expected 0 errors, got %d", validation.Errors)
	}
	if validation.Warnings == 0 {
		t.Error("expected warnings in strict mode for minimal task")
	}
}

// --- Empty directory tests ---

func TestError_EmptyDir_ListSucceeds(t *testing.T) {
	dir := setupTaskDir(t)

	result := run(t, dir, "list")

	if result.ExitCode != 0 {
		t.Errorf("expected exit code 0 for list on empty dir, got %d\nstderr: %s",
			result.ExitCode, result.Stderr)
	}
	// Should indicate no tasks found, not error out.
	if !strings.Contains(result.Stdout, "No tasks found") {
		t.Errorf("expected 'No tasks found' message, got stdout:\n%s", result.Stdout)
	}
}

func TestError_EmptyDir_NextSucceeds(t *testing.T) {
	dir := setupTaskDir(t)

	result := run(t, dir, "next")

	if result.ExitCode != 0 {
		t.Errorf("expected exit code 0 for next on empty dir, got %d\nstderr: %s",
			result.ExitCode, result.Stderr)
	}
}

func TestError_EmptyDir_GraphSucceeds(t *testing.T) {
	dir := setupTaskDir(t)

	result := run(t, dir, "graph")

	if result.ExitCode != 0 {
		t.Errorf("expected exit code 0 for graph on empty dir, got %d\nstderr: %s",
			result.ExitCode, result.Stderr)
	}
}

func TestError_EmptyDir_ValidateSucceeds(t *testing.T) {
	dir := setupTaskDir(t)

	result := run(t, dir, "validate", "--format", "json")

	if result.ExitCode != 0 {
		t.Errorf("expected exit code 0 for validate on empty dir, got %d\nstderr: %s",
			result.ExitCode, result.Stderr)
	}

	var validation struct {
		Errors    int `json:"errors"`
		TaskCount int `json:"task_count"`
	}
	mustParseJSON(t, result.Stdout, &validation)

	if validation.Errors != 0 {
		t.Errorf("expected 0 errors on empty dir, got %d", validation.Errors)
	}
	if validation.TaskCount != 0 {
		t.Errorf("expected task_count 0 on empty dir, got %d", validation.TaskCount)
	}
}

// --- Invalid --task-dir tests ---

func TestError_InvalidTaskDir(t *testing.T) {
	dir := setupTaskDir(t)

	cmds := []struct {
		name string
		args []string
	}{
		{"list", []string{"list", "--task-dir", "/nonexistent/path"}},
		{"next", []string{"next", "--task-dir", "/nonexistent/path"}},
		{"validate", []string{"validate", "--task-dir", "/nonexistent/path"}},
	}

	for _, tc := range cmds {
		t.Run(tc.name, func(t *testing.T) {
			result := run(t, dir, tc.args...)

			// The scanner may or may not fail depending on implementation,
			// but it should never panic.
			assertNoStackTrace(t, result.Stderr)

			// If it succeeds, it should show no tasks. Either way is acceptable.
			if result.ExitCode != 0 && result.ExitCode != 1 {
				t.Errorf("expected exit code 0 or 1, got %d", result.ExitCode)
			}
		})
	}
}

// --- Exit code verification ---

func TestError_ExitCodes(t *testing.T) {
	dir := setupTaskDir(t)
	writeTask(t, dir, "001-test.md", "001", "Test Task", "pending", nil)

	t.Run("success_is_zero", func(t *testing.T) {
		result := run(t, dir, "list")
		if result.ExitCode != 0 {
			t.Errorf("expected exit code 0, got %d", result.ExitCode)
		}
	})

	t.Run("error_is_nonzero", func(t *testing.T) {
		result := run(t, dir, "nonexistent-command")
		if result.ExitCode == 0 {
			t.Error("expected non-zero exit code for error case")
		}
	})

	t.Run("set_invalid_status_is_nonzero", func(t *testing.T) {
		result := run(t, dir, "set", "001", "--status", "bogus")
		if result.ExitCode == 0 {
			t.Error("expected non-zero exit code for invalid status")
		}
	})

	t.Run("validate_error_is_one", func(t *testing.T) {
		errDir := setupTaskDir(t)
		writeTask(t, errDir, "001-a.md", "001", "Task A", "pending", nil)
		writeTask(t, errDir, "001-b.md", "001", "Task B Dupe", "pending", nil)

		result := run(t, errDir, "validate")
		if result.ExitCode != 1 {
			t.Errorf("expected exit code 1 for validation errors, got %d", result.ExitCode)
		}
	})

	t.Run("validate_strict_warning_is_two", func(t *testing.T) {
		warnDir := setupTaskDir(t)
		writeTaskWithContent(t, warnDir, "001-min.md", `---
id: "001"
title: "Minimal"
status: pending
priority: medium
---

# Minimal
`)

		result := run(t, warnDir, "validate", "--strict")
		if result.ExitCode != 2 {
			t.Errorf("expected exit code 2 for strict warnings, got %d", result.ExitCode)
		}
	})
}

// --- Stderr quality tests ---

func TestError_StderrIsActionable(t *testing.T) {
	dir := setupTaskDir(t)

	tests := []struct {
		name     string
		args     []string
		contains string
	}{
		{
			name:     "unknown_command_mentions_command_name",
			args:     []string{"nonexistent-command"},
			contains: "nonexistent-command",
		},
		{
			name:     "set_no_args_explains_fix",
			args:     []string{"set"},
			contains: "task ID required",
		},
		{
			name:     "set_invalid_status_lists_valid_values",
			args:     []string{"set", "001", "--status", "bogus"},
			contains: "pending",
		},
		{
			name:     "set_no_update_flags_lists_options",
			args:     []string{"set", "001"},
			contains: "--status",
		},
		{
			name:     "invalid_format_lists_supported",
			args:     []string{"validate", "--format", "bogus"},
			contains: "supported",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			result := run(t, dir, tc.args...)

			if result.ExitCode == 0 {
				t.Error("expected non-zero exit code")
			}
			if !strings.Contains(result.Stderr, tc.contains) {
				t.Errorf("expected stderr to contain %q, got:\n%s", tc.contains, result.Stderr)
			}
			assertNoStackTrace(t, result.Stderr)
		})
	}
}

// --- Stdin/pipe behavior ---

func TestError_StdinFlagWithValidate(t *testing.T) {
	dir := setupTaskDir(t)
	writeTask(t, dir, "001-test.md", "001", "Test Task", "pending", nil)

	// The --stdin flag is a global flag but validate still scans the directory.
	// It should not crash or produce unexpected output.
	cmd := buildCmd(dir, "validate", "--stdin", "--format", "json")
	homeDir := t.TempDir()
	cmd.Env = []string{
		"HOME=" + homeDir,
		"NO_COLOR=1",
		"PATH=" + os.Getenv("PATH"),
	}
	// Provide empty stdin so it doesn't hang.
	cmd.Stdin = strings.NewReader("")

	result := execCmd(t, cmd, []string{"validate", "--stdin", "--format", "json"})

	// Should not crash — either succeed or fail gracefully.
	assertNoStackTrace(t, result.Stderr)
}

func TestError_PipeToValidate(t *testing.T) {
	dir := setupTaskDir(t)
	writeTask(t, dir, "001-test.md", "001", "Test Task", "pending", nil)

	// Pipe content into validate without --stdin. Should work normally
	// (validate reads files, not stdin by default).
	cmd := buildCmd(dir, "validate", "--format", "json")
	homeDir := t.TempDir()
	cmd.Env = []string{
		"HOME=" + homeDir,
		"NO_COLOR=1",
		"PATH=" + os.Getenv("PATH"),
	}
	cmd.Stdin = strings.NewReader("piped content that should be ignored")

	result := execCmd(t, cmd, []string{"validate", "--format", "json"})

	if result.ExitCode != 0 {
		t.Errorf("expected exit code 0 when piping to validate, got %d\nstderr: %s",
			result.ExitCode, result.Stderr)
	}
	assertNoStackTrace(t, result.Stderr)
}

// --- Helpers ---

// writeTaskWithContent creates a task file with arbitrary content.
func writeTaskWithContent(t *testing.T, dir, filename, content string) {
	t.Helper()
	path := filepath.Join(dir, filename)
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatalf("failed to create directory for %s: %v", path, err)
	}
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatalf("failed to write task file %s: %v", path, err)
	}
}

// assertNoStackTrace checks that output does not contain Go stack trace
// indicators — panics or goroutine dumps should never reach the user.
func assertNoStackTrace(t *testing.T, output string) {
	t.Helper()
	indicators := []string{
		"goroutine ",
		"panic:",
		"runtime error:",
		".go:",
		"stack trace",
	}
	for _, indicator := range indicators {
		if strings.Contains(output, indicator) {
			t.Errorf("output contains stack trace indicator %q:\n%s", indicator, output)
		}
	}
}
