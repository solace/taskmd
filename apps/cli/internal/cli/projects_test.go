package cli

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func resetProjectsFlags() {
	projectsFormat = "table"
}

// setupGlobalRegistry creates a temporary global config file with the given YAML content
// and sets TASKMD_HOME_CONFIG to point to it.
func setupGlobalRegistry(t *testing.T, configYAML string) {
	t.Helper()
	configDir := t.TempDir()
	configPath := filepath.Join(configDir, ".taskmd.yaml")
	if err := os.WriteFile(configPath, []byte(configYAML), 0644); err != nil {
		t.Fatalf("failed to create global config: %v", err)
	}
	t.Setenv("TASKMD_HOME_CONFIG", configPath)
}

// setupEmptyGlobalRegistry points TASKMD_HOME_CONFIG to a non-existent file.
func setupEmptyGlobalRegistry(t *testing.T) {
	t.Helper()
	configDir := t.TempDir()
	t.Setenv("TASKMD_HOME_CONFIG", filepath.Join(configDir, "nonexistent.yaml"))
}

// createProjectWithTasks creates a project directory with .taskmd.yaml and task files.
func createProjectWithTasks(t *testing.T, taskDir string, tasks map[string]string) string {
	t.Helper()
	projectDir := t.TempDir()

	tasksPath := filepath.Join(projectDir, taskDir)
	if err := os.MkdirAll(tasksPath, 0755); err != nil {
		t.Fatalf("failed to create tasks dir: %v", err)
	}

	// Write .taskmd.yaml pointing to the task directory
	configContent := "task-dir: " + taskDir + "\n"
	if err := os.WriteFile(filepath.Join(projectDir, ".taskmd.yaml"), []byte(configContent), 0644); err != nil {
		t.Fatalf("failed to write .taskmd.yaml: %v", err)
	}

	for filename, content := range tasks {
		if err := os.WriteFile(filepath.Join(tasksPath, filename), []byte(content), 0644); err != nil {
			t.Fatalf("failed to create task file %s: %v", filename, err)
		}
	}

	return projectDir
}

func captureProjectsOutput(t *testing.T) (string, string, error) {
	t.Helper()

	oldStdout := os.Stdout
	rOut, wOut, _ := os.Pipe()
	os.Stdout = wOut

	oldStderr := os.Stderr
	rErr, wErr, _ := os.Pipe()
	os.Stderr = wErr

	err := runProjects(projectsCmd, nil)

	wOut.Close()
	wErr.Close()
	os.Stdout = oldStdout
	os.Stderr = oldStderr

	var bufOut, bufErr bytes.Buffer
	bufOut.ReadFrom(rOut)
	bufErr.ReadFrom(rErr)
	return bufOut.String(), bufErr.String(), err
}

func TestProjects_NoProjectsRegistered(t *testing.T) {
	resetProjectsFlags()
	setupEmptyGlobalRegistry(t)

	_, stderr, err := captureProjectsOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(stderr, "No projects registered") {
		t.Errorf("expected 'No projects registered' message, got:\n%s", stderr)
	}
}

func TestProjects_EmptyProjectsList(t *testing.T) {
	resetProjectsFlags()
	setupGlobalRegistry(t, "projects: []\n")

	_, stderr, err := captureProjectsOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(stderr, "No projects registered") {
		t.Errorf("expected 'No projects registered' message, got:\n%s", stderr)
	}
}

func TestProjects_ValidProjectsTable(t *testing.T) {
	resetProjectsFlags()

	projectDir := createProjectWithTasks(t, "tasks", map[string]string{
		"001.md": taskFile("001", "Task A", "pending"),
		"002.md": taskFile("002", "Task B", "in-progress"),
		"003.md": taskFile("003", "Task C", "completed"),
		"004.md": taskFile("004", "Task D", "pending"),
	})

	setupGlobalRegistry(t, "projects:\n"+
		"  - id: proj1\n"+
		"    name: \"Test Project\"\n"+
		"    path: "+projectDir+"\n")

	stdout, _, err := captureProjectsOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	for _, expected := range []string{"PROJECT", "PATH", "TASKS", "PENDING", "IN-PROGRESS", "COMPLETED"} {
		if !strings.Contains(stdout, expected) {
			t.Errorf("table output missing header %q:\n%s", expected, stdout)
		}
	}

	if !strings.Contains(stdout, "Test Project") {
		t.Errorf("table output missing project name:\n%s", stdout)
	}
	if !strings.Contains(stdout, projectDir) {
		t.Errorf("table output missing project path:\n%s", stdout)
	}
}

func TestProjects_JSONOutput(t *testing.T) {
	resetProjectsFlags()
	projectsFormat = "json"

	projectDir := createProjectWithTasks(t, "tasks", map[string]string{
		"001.md": taskFile("001", "Task A", "pending"),
		"002.md": taskFile("002", "Task B", "in-progress"),
		"003.md": taskFile("003", "Task C", "completed"),
	})

	setupGlobalRegistry(t, "projects:\n"+
		"  - id: proj1\n"+
		"    name: \"My Project\"\n"+
		"    path: "+projectDir+"\n")

	stdout, _, err := captureProjectsOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	var summaries []ProjectSummary
	if err := json.Unmarshal([]byte(stdout), &summaries); err != nil {
		t.Fatalf("failed to parse JSON: %v\noutput: %s", err, stdout)
	}

	if len(summaries) != 1 {
		t.Fatalf("expected 1 project, got %d", len(summaries))
	}

	s := summaries[0]
	if s.ID != "proj1" {
		t.Errorf("expected id 'proj1', got %q", s.ID)
	}
	if s.Name != "My Project" {
		t.Errorf("expected name 'My Project', got %q", s.Name)
	}
	if s.Tasks != 3 {
		t.Errorf("expected 3 tasks, got %d", s.Tasks)
	}
	if s.Pending != 1 {
		t.Errorf("expected 1 pending, got %d", s.Pending)
	}
	if s.InProgress != 1 {
		t.Errorf("expected 1 in-progress, got %d", s.InProgress)
	}
	if s.Completed != 1 {
		t.Errorf("expected 1 completed, got %d", s.Completed)
	}
}

func TestProjects_UnreachablePath(t *testing.T) {
	resetProjectsFlags()

	// Create one valid project
	projectDir := createProjectWithTasks(t, "tasks", map[string]string{
		"001.md": taskFile("001", "Task A", "pending"),
	})

	setupGlobalRegistry(t, "projects:\n"+
		"  - id: missing\n"+
		"    name: \"Missing Project\"\n"+
		"    path: /nonexistent/path/that/does/not/exist\n"+
		"  - id: valid\n"+
		"    name: \"Valid Project\"\n"+
		"    path: "+projectDir+"\n")

	stdout, stderr, err := captureProjectsOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(stderr, "Warning") {
		t.Errorf("expected warning for missing project, got stderr:\n%s", stderr)
	}
	if !strings.Contains(stderr, "Missing Project") {
		t.Errorf("expected warning to mention 'Missing Project', got stderr:\n%s", stderr)
	}

	// Valid project should still appear
	if !strings.Contains(stdout, "Valid Project") {
		t.Errorf("expected valid project in output, got:\n%s", stdout)
	}
}

func TestProjects_YAMLOutput(t *testing.T) {
	resetProjectsFlags()
	projectsFormat = "yaml"

	projectDir := createProjectWithTasks(t, "tasks", map[string]string{
		"001.md": taskFile("001", "Task A", "completed"),
	})

	setupGlobalRegistry(t, "projects:\n"+
		"  - id: proj1\n"+
		"    name: \"YAML Project\"\n"+
		"    path: "+projectDir+"\n")

	stdout, _, err := captureProjectsOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !strings.Contains(stdout, "name: YAML Project") {
		t.Errorf("expected YAML output with project name, got:\n%s", stdout)
	}
	if !strings.Contains(stdout, "completed: 1") {
		t.Errorf("expected YAML output with completed count, got:\n%s", stdout)
	}
}

func TestProjects_DefaultTaskDir(t *testing.T) {
	resetProjectsFlags()
	projectsFormat = "json"

	// Create project without .taskmd.yaml — should default to ./tasks
	projectDir := t.TempDir()
	tasksDir := filepath.Join(projectDir, "tasks")
	if err := os.MkdirAll(tasksDir, 0755); err != nil {
		t.Fatalf("failed to create tasks dir: %v", err)
	}
	if err := os.WriteFile(
		filepath.Join(tasksDir, "001.md"),
		[]byte(taskFile("001", "Default Dir Task", "pending")),
		0644,
	); err != nil {
		t.Fatalf("failed to write task: %v", err)
	}

	setupGlobalRegistry(t, "projects:\n"+
		"  - id: proj1\n"+
		"    name: \"Default Dir Project\"\n"+
		"    path: "+projectDir+"\n")

	stdout, _, err := captureProjectsOutput(t)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	var summaries []ProjectSummary
	if err := json.Unmarshal([]byte(stdout), &summaries); err != nil {
		t.Fatalf("failed to parse JSON: %v\noutput: %s", err, stdout)
	}

	if len(summaries) != 1 {
		t.Fatalf("expected 1 project, got %d", len(summaries))
	}
	if summaries[0].Tasks != 1 {
		t.Errorf("expected 1 task (from default tasks/ dir), got %d", summaries[0].Tasks)
	}
}

func TestProjects_InvalidFormat(t *testing.T) {
	resetProjectsFlags()
	projectsFormat = "csv"

	setupGlobalRegistry(t, "projects:\n"+
		"  - id: proj1\n"+
		"    name: \"Test\"\n"+
		"    path: /tmp\n")

	// Create the /tmp path so it passes stat check, but the format error should come first
	// since collectProjectSummaries runs before format switch — actually format switch is after.
	// We need a valid project for the format branch to be reached.
	projectDir := createProjectWithTasks(t, "tasks", map[string]string{
		"001.md": taskFile("001", "Task", "pending"),
	})
	setupGlobalRegistry(t, "projects:\n"+
		"  - id: proj1\n"+
		"    name: \"Test\"\n"+
		"    path: "+projectDir+"\n")

	_, _, err := captureProjectsOutput(t)
	if err == nil {
		t.Fatal("expected error for invalid format")
	}
	if !strings.Contains(err.Error(), "unsupported format") {
		t.Errorf("expected 'unsupported format' error, got: %v", err)
	}
}

// taskFile is a helper to generate task markdown content.
func taskFile(id, title, status string) string {
	return "---\nid: \"" + id + "\"\ntitle: \"" + title + "\"\nstatus: " + status + "\n---\n"
}
