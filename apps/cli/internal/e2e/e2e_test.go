//go:build e2e

// Package e2e provides end-to-end tests for the taskmd CLI binary.
//
// These tests build the real binary and invoke it as a subprocess, testing
// the full command-line interface including argument parsing, output formatting,
// and exit codes.
//
// Run with: make e2e (from apps/cli directory)
// Or directly: go test -tags e2e ./internal/e2e/...
package e2e

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"testing"
)

// binaryPath is the path to the built taskmd binary, set by TestMain.
var binaryPath string

func TestMain(m *testing.M) {
	// Build the binary once into a temp directory.
	tmpDir, err := os.MkdirTemp("", "taskmd-e2e-*")
	if err != nil {
		fmt.Fprintf(os.Stderr, "e2e: failed to create temp dir: %v\n", err)
		os.Exit(1)
	}
	defer os.RemoveAll(tmpDir)

	binaryPath = filepath.Join(tmpDir, "taskmd")
	buildCmd := exec.Command("go", "build", "-o", binaryPath, "./cmd/taskmd")
	buildCmd.Dir = filepath.Join(findModuleRoot(), "apps", "cli")
	buildCmd.Stdout = os.Stdout
	buildCmd.Stderr = os.Stderr

	if err := buildCmd.Run(); err != nil {
		fmt.Fprintf(os.Stderr, "e2e: failed to build binary: %v\n", err)
		os.Exit(1)
	}

	os.Exit(m.Run())
}

// findModuleRoot walks up from the current working directory to find the
// repository root (the directory containing apps/cli/go.mod).
func findModuleRoot() string {
	// When running tests, the working directory is the package directory.
	// Walk up to find the repo root.
	dir, err := os.Getwd()
	if err != nil {
		panic(fmt.Sprintf("e2e: cannot get working directory: %v", err))
	}
	for {
		if _, err := os.Stat(filepath.Join(dir, "apps", "cli", "go.mod")); err == nil {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			panic("e2e: cannot find repository root (no apps/cli/go.mod found)")
		}
		dir = parent
	}
}

// runResult holds the output and exit information from a command execution.
type runResult struct {
	Stdout   string
	Stderr   string
	ExitCode int
}

// run executes the taskmd binary with the given arguments in the specified
// working directory. It returns stdout, stderr, and any error.
//
// The subprocess environment is isolated:
//   - HOME is set to a temp directory (prevents loading user config)
//   - NO_COLOR=1 is set for deterministic output
//   - XDG_CONFIG_HOME is cleared
func run(t *testing.T, dir string, args ...string) runResult {
	t.Helper()

	cmd := exec.Command(binaryPath, args...)
	cmd.Dir = dir

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	// Isolate from user environment.
	homeDir := t.TempDir()
	cmd.Env = []string{
		"HOME=" + homeDir,
		"NO_COLOR=1",
		"PATH=" + os.Getenv("PATH"),
	}

	err := cmd.Run()

	exitCode := 0
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		} else {
			t.Fatalf("failed to execute taskmd: %v", err)
		}
	}

	return runResult{
		Stdout:   stdout.String(),
		Stderr:   stderr.String(),
		ExitCode: exitCode,
	}
}

// mustRun executes the taskmd binary and fails the test if it returns a
// non-zero exit code. Returns the runResult for further assertions.
func mustRun(t *testing.T, dir string, args ...string) runResult {
	t.Helper()
	result := run(t, dir, args...)
	if result.ExitCode != 0 {
		t.Fatalf("taskmd %v exited with code %d\nstdout: %s\nstderr: %s",
			args, result.ExitCode, result.Stdout, result.Stderr)
	}
	return result
}

// writeTask creates a task markdown file in the specified directory.
// It generates a properly formatted task file with frontmatter.
func writeTask(t *testing.T, dir, filename, id, title, status string, deps []string) {
	t.Helper()

	depsYAML := "[]"
	if len(deps) > 0 {
		depsYAML = "["
		for i, d := range deps {
			if i > 0 {
				depsYAML += ", "
			}
			depsYAML += fmt.Sprintf("%q", d)
		}
		depsYAML += "]"
	}

	content := fmt.Sprintf(`---
id: %q
title: %q
status: %s
priority: medium
effort: small
dependencies: %s
tags: ["e2e"]
created: 2026-01-01
---

# %s

Test task for e2e tests.
`, id, title, status, depsYAML, title)

	path := filepath.Join(dir, filename)
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatalf("failed to create directory for %s: %v", path, err)
	}
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatalf("failed to write task file %s: %v", path, err)
	}
}

// setupTaskDir creates an isolated temporary directory with a .taskmd.yaml
// config file, ready for use as a task project root.
func setupTaskDir(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()

	config := "dir: .\n"
	if err := os.WriteFile(filepath.Join(dir, ".taskmd.yaml"), []byte(config), 0o644); err != nil {
		t.Fatalf("failed to write .taskmd.yaml: %v", err)
	}

	return dir
}
