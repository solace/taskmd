//go:build e2e

package e2e

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// runWithHome executes the taskmd binary with a specific HOME directory.
// This allows tests to place a .taskmd.yaml in the home dir and verify
// that global config is picked up.
func runWithHome(t *testing.T, home, dir string, args ...string) runResult {
	t.Helper()

	cmd := buildCmd(dir, args...)

	cmd.Env = []string{
		"HOME=" + home,
		"NO_COLOR=1",
		"PATH=" + os.Getenv("PATH"),
	}

	return execCmd(t, cmd, args)
}

// --- Project-level config tests ---

func TestConfig_ProjectTaskDir(t *testing.T) {
	// A project-level .taskmd.yaml with task-dir should make commands
	// scan that subdirectory instead of ".".
	root := t.TempDir()

	// Create a subdirectory with a task file.
	tasksDir := filepath.Join(root, "my-tasks")
	writeTask(t, tasksDir, "001-alpha.md", "001", "Alpha Task", "pending", nil)

	// Write project config pointing task-dir at the subdirectory.
	writeConfig(t, root, "task-dir: my-tasks\n")

	result := mustRun(t, root, "list")

	if !strings.Contains(result.Stdout, "Alpha Task") {
		t.Errorf("expected project config task-dir to find task, got:\n%s", result.Stdout)
	}
}

func TestConfig_ProjectDirLegacy(t *testing.T) {
	// The legacy "dir" key in config should also work.
	root := t.TempDir()

	tasksDir := filepath.Join(root, "legacy-tasks")
	writeTask(t, tasksDir, "001-beta.md", "001", "Beta Task", "pending", nil)

	writeConfig(t, root, "dir: legacy-tasks\n")

	result := mustRun(t, root, "list")

	if !strings.Contains(result.Stdout, "Beta Task") {
		t.Errorf("expected legacy dir config to find task, got:\n%s", result.Stdout)
	}
}

func TestConfig_ProjectVerbose(t *testing.T) {
	// Setting verbose: true in project config should enable verbose output
	// (scanner logs printed to stderr).
	root := t.TempDir()

	writeTask(t, root, "001-test.md", "001", "Test Task", "pending", nil)
	writeConfig(t, root, "dir: .\nverbose: true\n")

	result := mustRun(t, root, "list")

	// Verbose mode causes scanner to log details to stderr.
	if !strings.Contains(result.Stderr, "Scanning directory:") {
		t.Errorf("expected verbose config to produce scanner logs on stderr, got stderr:\n%s", result.Stderr)
	}

	// Without verbose, stderr should be empty.
	rootQuiet := t.TempDir()
	writeTask(t, rootQuiet, "001-test.md", "001", "Test Task", "pending", nil)
	writeConfig(t, rootQuiet, "dir: .\n")

	quietResult := mustRun(t, rootQuiet, "list")

	if strings.Contains(quietResult.Stderr, "Scanning directory:") {
		t.Errorf("expected no verbose output without verbose config, got stderr:\n%s", quietResult.Stderr)
	}
}

// --- Home-level config tests ---

func TestConfig_HomeFallback(t *testing.T) {
	// When no project-level config exists, the home-level config should
	// be used as a fallback.
	root := t.TempDir()
	homeDir := t.TempDir()

	// Create tasks in a subdirectory.
	tasksDir := filepath.Join(root, "home-tasks")
	writeTask(t, tasksDir, "001-gamma.md", "001", "Gamma Task", "pending", nil)

	// Put the config in the home directory, not the project directory.
	writeConfig(t, homeDir, "task-dir: home-tasks\nverbose: true\n")

	// No .taskmd.yaml in root — should fall back to $HOME/.taskmd.yaml.
	result := runWithHome(t, homeDir, root, "list")

	if result.ExitCode != 0 {
		t.Fatalf("expected exit code 0, got %d\nstdout: %s\nstderr: %s",
			result.ExitCode, result.Stdout, result.Stderr)
	}
	if !strings.Contains(result.Stdout, "Gamma Task") {
		t.Errorf("expected home config task-dir to find task, got:\n%s", result.Stdout)
	}
	// Verbose from home config should produce scanner logs.
	if !strings.Contains(result.Stderr, "Scanning directory:") {
		t.Errorf("expected home config verbose to produce scanner logs, got stderr:\n%s", result.Stderr)
	}
}

func TestConfig_ProjectOverridesHome(t *testing.T) {
	// When both project and home configs exist, the project config wins.
	root := t.TempDir()
	homeDir := t.TempDir()

	// Create two task directories.
	projectTasks := filepath.Join(root, "project-tasks")
	homeTasks := filepath.Join(root, "home-tasks")
	writeTask(t, projectTasks, "001-project.md", "001", "Project Task", "pending", nil)
	writeTask(t, homeTasks, "001-home.md", "002", "Home Task", "pending", nil)

	// Project config points to project-tasks.
	writeConfig(t, root, "task-dir: project-tasks\n")

	// Home config points to home-tasks.
	writeConfig(t, homeDir, "task-dir: home-tasks\n")

	result := runWithHome(t, homeDir, root, "list")

	if result.ExitCode != 0 {
		t.Fatalf("expected exit code 0, got %d\nstdout: %s\nstderr: %s",
			result.ExitCode, result.Stdout, result.Stderr)
	}
	// Project config should win: we should see "Project Task", not "Home Task".
	if !strings.Contains(result.Stdout, "Project Task") {
		t.Errorf("expected project config to override home config, got:\n%s", result.Stdout)
	}
	if strings.Contains(result.Stdout, "Home Task") {
		t.Errorf("expected home config to NOT be used when project config exists, got:\n%s", result.Stdout)
	}
}

// --- CLI flag override tests ---

func TestConfig_CLIFlagOverridesProjectConfig(t *testing.T) {
	// A --task-dir CLI flag should override the project config value.
	root := t.TempDir()

	// Project config points to "config-tasks".
	configTasks := filepath.Join(root, "config-tasks")
	writeTask(t, configTasks, "001-config.md", "001", "Config Task", "pending", nil)
	writeConfig(t, root, "task-dir: config-tasks\n")

	// CLI flag points to "flag-tasks".
	flagTasks := filepath.Join(root, "flag-tasks")
	writeTask(t, flagTasks, "001-flag.md", "002", "Flag Task", "pending", nil)

	result := mustRun(t, root, "list", "--task-dir", "flag-tasks")

	if !strings.Contains(result.Stdout, "Flag Task") {
		t.Errorf("expected --task-dir flag to override config, got:\n%s", result.Stdout)
	}
	if strings.Contains(result.Stdout, "Config Task") {
		t.Errorf("expected config value to NOT be used when flag is set, got:\n%s", result.Stdout)
	}
}

func TestConfig_CLIFlagOverridesHomeConfig(t *testing.T) {
	// A --task-dir CLI flag should override the home config value.
	root := t.TempDir()
	homeDir := t.TempDir()

	// Home config points to "home-tasks".
	homeTasks := filepath.Join(root, "home-tasks")
	writeTask(t, homeTasks, "001-home.md", "001", "Home Task", "pending", nil)
	writeConfig(t, homeDir, "task-dir: home-tasks\n")

	// CLI flag points to "flag-tasks".
	flagTasks := filepath.Join(root, "flag-tasks")
	writeTask(t, flagTasks, "001-flag.md", "002", "Flag Task", "pending", nil)

	// No project config in root.
	result := runWithHome(t, homeDir, root, "list", "--task-dir", "flag-tasks")

	if result.ExitCode != 0 {
		t.Fatalf("expected exit code 0, got %d\nstdout: %s\nstderr: %s",
			result.ExitCode, result.Stdout, result.Stderr)
	}
	if !strings.Contains(result.Stdout, "Flag Task") {
		t.Errorf("expected --task-dir flag to override home config, got:\n%s", result.Stdout)
	}
	if strings.Contains(result.Stdout, "Home Task") {
		t.Errorf("expected home config to NOT be used when flag is set, got:\n%s", result.Stdout)
	}
}

func TestConfig_VerboseFlagOverridesConfig(t *testing.T) {
	// --verbose flag should work even when config says verbose: false.
	root := t.TempDir()

	writeTask(t, root, "001-test.md", "001", "Test Task", "pending", nil)
	writeConfig(t, root, "dir: .\nverbose: false\n")

	result := mustRun(t, root, "list", "--verbose")

	if !strings.Contains(result.Stderr, "Using config file:") {
		t.Errorf("expected --verbose flag to enable verbose output, got stderr:\n%s", result.Stderr)
	}
}

// --- Default behavior (no config) ---

func TestConfig_NoConfigFile(t *testing.T) {
	// When no .taskmd.yaml exists anywhere, commands should still work
	// with defaults (task-dir = ".").
	root := t.TempDir()

	// Put a task directly in the root (default task-dir = ".").
	writeTask(t, root, "001-default.md", "001", "Default Task", "pending", nil)

	// Don't create any .taskmd.yaml — should use defaults.
	result := mustRun(t, root, "list")

	if !strings.Contains(result.Stdout, "Default Task") {
		t.Errorf("expected default task-dir to scan '.', got:\n%s", result.Stdout)
	}
}

func TestConfig_NoConfigFileNoError(t *testing.T) {
	// Missing config should not produce any error output.
	root := t.TempDir()
	writeTask(t, root, "001-test.md", "001", "Test Task", "pending", nil)

	result := mustRun(t, root, "list")

	// No error or warning about missing config.
	if strings.Contains(result.Stderr, "config") || strings.Contains(result.Stderr, "error") {
		t.Errorf("expected no config-related errors, got stderr:\n%s", result.Stderr)
	}
}

// --- Config options that affect output ---

func TestConfig_WorkflowSetting(t *testing.T) {
	// The workflow setting should be respected from config.
	// We test this indirectly by verifying the config loads without error
	// and the command succeeds.
	root := t.TempDir()

	writeTask(t, root, "001-test.md", "001", "Test Task", "pending", nil)
	writeConfig(t, root, "dir: .\nworkflow: pr-review\n")

	result := mustRun(t, root, "list")

	if !strings.Contains(result.Stdout, "Test Task") {
		t.Errorf("expected list to work with workflow config, got:\n%s", result.Stdout)
	}
}

func TestConfig_IgnoreDirs(t *testing.T) {
	// The "ignore" config option should skip specified directories.
	root := t.TempDir()

	// Create tasks in two directories.
	writeTask(t, root, "001-visible.md", "001", "Visible Task", "pending", nil)
	writeTask(t, filepath.Join(root, "ignored-dir"), "002-hidden.md", "002", "Hidden Task", "pending", nil)

	writeConfig(t, root, "dir: .\nignore:\n  - ignored-dir\n")

	result := mustRun(t, root, "list")

	if !strings.Contains(result.Stdout, "Visible Task") {
		t.Errorf("expected visible task to appear, got:\n%s", result.Stdout)
	}
	if strings.Contains(result.Stdout, "Hidden Task") {
		t.Errorf("expected ignored-dir tasks to be hidden, got:\n%s", result.Stdout)
	}
}

func TestConfig_ExplicitConfigFlag(t *testing.T) {
	// The --config flag should load a specific config file, overriding
	// both project and home configs.
	root := t.TempDir()

	// Create two task directories.
	configTasks := filepath.Join(root, "explicit-tasks")
	projectTasks := filepath.Join(root, "project-tasks")
	writeTask(t, configTasks, "001-explicit.md", "001", "Explicit Task", "pending", nil)
	writeTask(t, projectTasks, "001-project.md", "002", "Project Task", "pending", nil)

	// Project config points to project-tasks.
	writeConfig(t, root, "task-dir: project-tasks\n")

	// Write a separate config file that points to explicit-tasks.
	explicitConfig := filepath.Join(root, "custom-config.yaml")
	if err := os.WriteFile(explicitConfig, []byte("task-dir: explicit-tasks\n"), 0o644); err != nil {
		t.Fatalf("failed to write explicit config: %v", err)
	}

	result := mustRun(t, root, "list", "--config", explicitConfig)

	if !strings.Contains(result.Stdout, "Explicit Task") {
		t.Errorf("expected --config to use explicit config file, got:\n%s", result.Stdout)
	}
	if strings.Contains(result.Stdout, "Project Task") {
		t.Errorf("expected project config to NOT be used with --config, got:\n%s", result.Stdout)
	}
}

// --- Helper ---

// writeConfig creates a .taskmd.yaml file in the given directory.
func writeConfig(t *testing.T, dir, content string) {
	t.Helper()
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatalf("failed to create config dir %s: %v", dir, err)
	}
	path := filepath.Join(dir, ".taskmd.yaml")
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatalf("failed to write config %s: %v", path, err)
	}
}
