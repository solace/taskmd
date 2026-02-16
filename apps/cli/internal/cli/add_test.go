package cli

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func resetAddFlags() {
	addPriority = "medium"
	addEffort = ""
	addTags = ""
	addStatus = "pending"
	addOwner = ""
	addDependsOn = ""
	addParent = ""
	addGroup = ""
	addFormat = "plain"
	addEdit = false
	taskDir = "."
}

func captureAddOutput(t *testing.T, title string) (string, error) {
	t.Helper()

	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runAdd(addCmd, []string{title})

	w.Close()
	os.Stdout = oldStdout

	var buf bytes.Buffer
	buf.ReadFrom(r)
	return buf.String(), err
}

func TestAdd_HappyPath(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir

	output, err := captureAddOutput(t, "My first task")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(output, "Created task 001") {
		t.Errorf("expected 'Created task 001' in output, got: %s", output)
	}

	// Verify file was created
	files, _ := filepath.Glob(filepath.Join(tmpDir, "001-*.md"))
	if len(files) != 1 {
		t.Fatalf("expected 1 file matching 001-*.md, got %d", len(files))
	}

	content, _ := os.ReadFile(files[0])
	fileStr := string(content)

	// Check frontmatter
	if !strings.Contains(fileStr, `id: "001"`) {
		t.Error("expected id: \"001\" in frontmatter")
	}
	if !strings.Contains(fileStr, `title: "My first task"`) {
		t.Error("expected title in frontmatter")
	}
	if !strings.Contains(fileStr, "status: pending") {
		t.Error("expected status: pending in frontmatter")
	}
	if !strings.Contains(fileStr, "priority: medium") {
		t.Error("expected priority: medium in frontmatter")
	}
	if !strings.Contains(fileStr, "dependencies: []") {
		t.Error("expected dependencies: [] in frontmatter")
	}
	if !strings.Contains(fileStr, "tags: []") {
		t.Error("expected tags: [] in frontmatter")
	}
	if !strings.Contains(fileStr, "created: ") {
		t.Error("expected created date in frontmatter")
	}

	// Check body template
	if !strings.Contains(fileStr, "# My first task") {
		t.Error("expected heading in body")
	}
	if !strings.Contains(fileStr, "## Objective") {
		t.Error("expected Objective section in body")
	}
	if !strings.Contains(fileStr, "## Tasks") {
		t.Error("expected Tasks section in body")
	}
	if !strings.Contains(fileStr, "- [ ] TODO") {
		t.Error("expected TODO checkbox in body")
	}
	if !strings.Contains(fileStr, "## Acceptance Criteria") {
		t.Error("expected Acceptance Criteria section in body")
	}
}

func TestAdd_AllFlags(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir
	addPriority = "high"
	addEffort = "large"
	addTags = "backend,api"
	addStatus = "in-progress"
	addOwner = "alice"
	addDependsOn = "001,002"
	addParent = "010"

	_, err := captureAddOutput(t, "Full featured task")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	files, _ := filepath.Glob(filepath.Join(tmpDir, "001-*.md"))
	if len(files) != 1 {
		t.Fatalf("expected 1 file, got %d", len(files))
	}

	content, _ := os.ReadFile(files[0])
	fileStr := string(content)

	if !strings.Contains(fileStr, "priority: high") {
		t.Error("expected priority: high")
	}
	if !strings.Contains(fileStr, "effort: large") {
		t.Error("expected effort: large")
	}
	if !strings.Contains(fileStr, `tags: ["backend", "api"]`) {
		t.Error("expected tags with backend and api")
	}
	if !strings.Contains(fileStr, "status: in-progress") {
		t.Error("expected status: in-progress")
	}
	if !strings.Contains(fileStr, "owner: alice") {
		t.Error("expected owner: alice")
	}
	if !strings.Contains(fileStr, `dependencies: ["001", "002"]`) {
		t.Error("expected dependencies with 001 and 002")
	}
	if !strings.Contains(fileStr, `parent: "010"`) {
		t.Error("expected parent: \"010\"")
	}
}

func TestAdd_GroupFlag(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir
	addGroup = "cli"

	output, err := captureAddOutput(t, "CLI task")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Verify file created in subdirectory
	files, _ := filepath.Glob(filepath.Join(tmpDir, "cli", "001-*.md"))
	if len(files) != 1 {
		t.Fatalf("expected 1 file in cli/, got %d", len(files))
	}

	if !strings.Contains(output, filepath.Join("cli", "001-")) {
		t.Errorf("expected path with cli/ in output, got: %s", output)
	}
}

func TestAdd_JSONOutput(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir
	addFormat = "json"

	output, err := captureAddOutput(t, "JSON task")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	var result addResult
	if err := json.Unmarshal([]byte(output), &result); err != nil {
		t.Fatalf("failed to parse JSON output: %v\nOutput: %s", err, output)
	}

	if result.ID != "001" {
		t.Errorf("expected id 001, got %s", result.ID)
	}
	if result.Title != "JSON task" {
		t.Errorf("expected title 'JSON task', got %s", result.Title)
	}
	if result.Status != "pending" {
		t.Errorf("expected status pending, got %s", result.Status)
	}
	if result.Priority != "medium" {
		t.Errorf("expected priority medium, got %s", result.Priority)
	}
	if result.FilePath == "" {
		t.Error("expected non-empty file_path")
	}
}

func TestAdd_InvalidPriority(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir
	addPriority = "urgent"

	_, err := captureAddOutput(t, "Bad priority")
	if err == nil {
		t.Fatal("expected error for invalid priority")
	}
	if !strings.Contains(err.Error(), "invalid priority") {
		t.Errorf("expected 'invalid priority' error, got: %v", err)
	}
}

func TestAdd_InvalidEffort(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir
	addEffort = "huge"

	_, err := captureAddOutput(t, "Bad effort")
	if err == nil {
		t.Fatal("expected error for invalid effort")
	}
	if !strings.Contains(err.Error(), "invalid effort") {
		t.Errorf("expected 'invalid effort' error, got: %v", err)
	}
}

func TestAdd_InvalidStatus(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir
	addStatus = "invalid"

	_, err := captureAddOutput(t, "Bad status")
	if err == nil {
		t.Fatal("expected error for invalid status")
	}
	if !strings.Contains(err.Error(), "invalid status") {
		t.Errorf("expected 'invalid status' error, got: %v", err)
	}
}

func TestAdd_SpecialCharactersInTitle(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir

	_, err := captureAddOutput(t, "Fix bug: login/auth (urgent!)")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	files, _ := filepath.Glob(filepath.Join(tmpDir, "001-*.md"))
	if len(files) != 1 {
		t.Fatalf("expected 1 file, got %d", len(files))
	}

	filename := filepath.Base(files[0])
	// Slug should only contain lowercase alphanumeric and hyphens
	if strings.ContainsAny(filename, ":/(!)") {
		t.Errorf("filename should not contain special chars, got: %s", filename)
	}
}

func TestAdd_EmptyDirectory(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir

	output, err := captureAddOutput(t, "First task ever")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(output, "Created task 001") {
		t.Errorf("expected ID 001 for first task, got: %s", output)
	}
}

func TestAdd_SequentialIDs(t *testing.T) {
	tmpDir := t.TempDir()

	// Create an existing task file
	existing := `---
id: "005"
title: "Existing task"
status: pending
priority: medium
dependencies: []
tags: []
created: 2026-02-16
---

# Existing task
`
	if err := os.WriteFile(filepath.Join(tmpDir, "005-existing.md"), []byte(existing), 0644); err != nil {
		t.Fatal(err)
	}

	resetAddFlags()
	taskDir = tmpDir

	output, err := captureAddOutput(t, "Next task")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(output, "Created task 006") {
		t.Errorf("expected ID 006 (next after 005), got: %s", output)
	}
}

func TestAdd_DependsOnParsing(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir
	addDependsOn = "001, 002, 003"

	_, err := captureAddOutput(t, "Dependent task")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	files, _ := filepath.Glob(filepath.Join(tmpDir, "001-*.md"))
	if len(files) != 1 {
		t.Fatalf("expected 1 file, got %d", len(files))
	}

	content, _ := os.ReadFile(files[0])
	if !strings.Contains(string(content), `dependencies: ["001", "002", "003"]`) {
		t.Errorf("expected dependencies list, got:\n%s", string(content))
	}
}

func TestAdd_TagsParsing(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir
	addTags = "frontend, backend, api"

	_, err := captureAddOutput(t, "Tagged task")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	files, _ := filepath.Glob(filepath.Join(tmpDir, "001-*.md"))
	if len(files) != 1 {
		t.Fatalf("expected 1 file, got %d", len(files))
	}

	content, _ := os.ReadFile(files[0])
	if !strings.Contains(string(content), `tags: ["frontend", "backend", "api"]`) {
		t.Errorf("expected tags list, got:\n%s", string(content))
	}
}

func TestAdd_InvalidFormat(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir
	addFormat = "xml"

	_, err := captureAddOutput(t, "Bad format")
	if err == nil {
		t.Fatal("expected error for invalid format")
	}
	if !strings.Contains(err.Error(), "unsupported format") {
		t.Errorf("expected 'unsupported format' error, got: %v", err)
	}
}

func TestAdd_EditorNotSet(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir
	addEdit = true

	// Ensure EDITOR is not set
	origEditor := os.Getenv("EDITOR")
	os.Unsetenv("EDITOR")
	defer func() {
		if origEditor != "" {
			os.Setenv("EDITOR", origEditor)
		}
	}()

	_, err := captureAddOutput(t, "Edit task")
	if err == nil {
		t.Fatal("expected error when $EDITOR is not set")
	}
	if !strings.Contains(err.Error(), "$EDITOR is not set") {
		t.Errorf("expected '$EDITOR is not set' error, got: %v", err)
	}
}

func TestAdd_EffortOmittedWhenEmpty(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir

	_, err := captureAddOutput(t, "No effort task")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	files, _ := filepath.Glob(filepath.Join(tmpDir, "001-*.md"))
	if len(files) != 1 {
		t.Fatalf("expected 1 file, got %d", len(files))
	}

	content, _ := os.ReadFile(files[0])
	if strings.Contains(string(content), "effort:") {
		t.Error("effort should not appear in frontmatter when not set")
	}
}

func TestAdd_SuggestionOnTypo(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir
	addPriority = "hihg"

	_, err := captureAddOutput(t, "Typo task")
	if err == nil {
		t.Fatal("expected error for invalid priority")
	}
	if !strings.Contains(err.Error(), `did you mean "high"`) {
		t.Errorf("expected suggestion for 'high', got: %v", err)
	}
}

func TestAdd_GroupCreatesDirectory(t *testing.T) {
	tmpDir := t.TempDir()
	resetAddFlags()
	taskDir = tmpDir
	addGroup = "new-group"

	_, err := captureAddOutput(t, "Group task")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Verify directory was created
	info, err := os.Stat(filepath.Join(tmpDir, "new-group"))
	if err != nil {
		t.Fatalf("expected group directory to be created: %v", err)
	}
	if !info.IsDir() {
		t.Error("expected new-group to be a directory")
	}
}
