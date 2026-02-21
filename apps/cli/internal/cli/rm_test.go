package cli

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const rmTaskPending = `---
id: "001"
title: "Setup project"
status: pending
priority: high
effort: small
dependencies: []
tags: ["infra"]
created: 2026-02-08
---

# Setup project
`

const rmTaskCompleted = `---
id: "002"
title: "Old feature"
status: completed
priority: low
effort: medium
dependencies: []
tags: ["backend"]
created: 2026-02-08
---

# Old feature
`

func createRmTestFiles(t *testing.T) string {
	t.Helper()
	tmpDir := t.TempDir()

	files := map[string]string{
		"001-setup.md": rmTaskPending,
		"002-old.md":   rmTaskCompleted,
	}

	for name, content := range files {
		if err := os.WriteFile(filepath.Join(tmpDir, name), []byte(content), 0644); err != nil {
			t.Fatalf("failed to create %s: %v", name, err)
		}
	}

	return tmpDir
}

func resetRmFlags() {
	rmForce = false
	rmDryRun = false
	taskDir = "."
}

func captureRmOutput(t *testing.T, args []string) (string, error) {
	t.Helper()

	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runRm(rmCmd, args)

	w.Close()
	os.Stdout = oldStdout

	var buf bytes.Buffer
	buf.ReadFrom(r)
	return buf.String(), err
}

func TestRm_WithForce(t *testing.T) {
	tmpDir := createRmTestFiles(t)
	resetRmFlags()
	taskDir = tmpDir
	rmForce = true

	output, err := captureRmOutput(t, []string{"001"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(output, "Deleted 1 task") {
		t.Errorf("expected delete confirmation, got: %s", output)
	}

	// File should be gone
	if _, err := os.Stat(filepath.Join(tmpDir, "001-setup.md")); !os.IsNotExist(err) {
		t.Error("expected file to be deleted")
	}

	// Other file should remain
	if _, err := os.Stat(filepath.Join(tmpDir, "002-old.md")); err != nil {
		t.Error("expected other file to remain")
	}
}

func TestRm_DryRun(t *testing.T) {
	tmpDir := createRmTestFiles(t)
	resetRmFlags()
	taskDir = tmpDir
	rmDryRun = true

	output, err := captureRmOutput(t, []string{"001"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(output, "Dry run") {
		t.Errorf("expected dry run message, got: %s", output)
	}

	if !strings.Contains(output, "Delete 1 task") {
		t.Errorf("expected preview of task, got: %s", output)
	}

	// File should NOT be deleted
	if _, err := os.Stat(filepath.Join(tmpDir, "001-setup.md")); err != nil {
		t.Error("expected file to remain after dry run")
	}
}

func TestRm_TaskNotFound(t *testing.T) {
	tmpDir := createRmTestFiles(t)
	resetRmFlags()
	taskDir = tmpDir
	rmForce = true

	_, err := captureRmOutput(t, []string{"999"})
	if err == nil {
		t.Fatal("expected error for nonexistent task")
	}
	if !strings.Contains(err.Error(), "task not found") {
		t.Errorf("expected 'task not found' error, got: %v", err)
	}
}

func TestRm_InteractiveConfirmYes(t *testing.T) {
	tmpDir := createRmTestFiles(t)
	resetRmFlags()
	taskDir = tmpDir

	// Simulate user typing "y"
	oldStdin := rmStdinReader
	rmStdinReader = strings.NewReader("y\n")
	defer func() { rmStdinReader = oldStdin }()

	output, err := captureRmOutput(t, []string{"001"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(output, "Deleted 1 task") {
		t.Errorf("expected delete confirmation, got: %s", output)
	}

	// File should be gone
	if _, err := os.Stat(filepath.Join(tmpDir, "001-setup.md")); !os.IsNotExist(err) {
		t.Error("expected file to be deleted after confirming")
	}
}

func TestRm_InteractiveConfirmNo(t *testing.T) {
	tmpDir := createRmTestFiles(t)
	resetRmFlags()
	taskDir = tmpDir

	// Simulate user typing "n"
	oldStdin := rmStdinReader
	rmStdinReader = strings.NewReader("n\n")
	defer func() { rmStdinReader = oldStdin }()

	output, err := captureRmOutput(t, []string{"001"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(output, "Cancelled") {
		t.Errorf("expected cancellation message, got: %s", output)
	}

	// File should remain
	if _, err := os.Stat(filepath.Join(tmpDir, "001-setup.md")); err != nil {
		t.Error("expected file to remain after declining")
	}
}

func TestRm_InteractiveConfirmEmpty(t *testing.T) {
	tmpDir := createRmTestFiles(t)
	resetRmFlags()
	taskDir = tmpDir

	// Simulate user pressing Enter (empty input = default No)
	oldStdin := rmStdinReader
	rmStdinReader = strings.NewReader("\n")
	defer func() { rmStdinReader = oldStdin }()

	output, err := captureRmOutput(t, []string{"001"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(output, "Cancelled") {
		t.Errorf("expected cancellation message, got: %s", output)
	}

	// File should remain
	if _, err := os.Stat(filepath.Join(tmpDir, "001-setup.md")); err != nil {
		t.Error("expected file to remain after empty input")
	}
}

func TestRm_ShowsTaskDetails(t *testing.T) {
	tmpDir := createRmTestFiles(t)
	resetRmFlags()
	taskDir = tmpDir
	rmDryRun = true

	output, err := captureRmOutput(t, []string{"001"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(output, "001") {
		t.Errorf("expected task ID in output, got: %s", output)
	}
	if !strings.Contains(output, "Setup project") {
		t.Errorf("expected task title in output, got: %s", output)
	}
}
