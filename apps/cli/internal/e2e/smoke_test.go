//go:build e2e

package e2e

import (
	"strings"
	"testing"
)

func TestSmoke_Help(t *testing.T) {
	dir := setupTaskDir(t)

	result := mustRun(t, dir, "--help")

	// Verify the output contains expected usage text.
	if !strings.Contains(result.Stdout, "taskmd") {
		t.Errorf("expected --help output to mention 'taskmd', got:\n%s", result.Stdout)
	}
	if !strings.Contains(result.Stdout, "Available Commands") {
		t.Errorf("expected --help output to list available commands, got:\n%s", result.Stdout)
	}
}

func TestSmoke_Version(t *testing.T) {
	dir := setupTaskDir(t)

	result := mustRun(t, dir, "--version")

	if !strings.Contains(result.Stdout, "taskmd version") {
		t.Errorf("expected --version to print version info, got:\n%s", result.Stdout)
	}
}

func TestSmoke_UnknownCommand(t *testing.T) {
	dir := setupTaskDir(t)

	result := run(t, dir, "nonexistent-command")

	if result.ExitCode == 0 {
		t.Error("expected non-zero exit code for unknown command")
	}
}

func TestSmoke_ListWithTask(t *testing.T) {
	dir := setupTaskDir(t)
	writeTask(t, dir, "001-hello.md", "001", "Hello Task", "pending", nil)

	result := mustRun(t, dir, "list")

	if !strings.Contains(result.Stdout, "Hello Task") {
		t.Errorf("expected list output to contain task title, got:\n%s", result.Stdout)
	}
}
