package cli

import (
	"bufio"
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
	"unicode"

	"github.com/spf13/cobra"

	"github.com/driangle/taskmd/apps/cli/internal/model"
	"github.com/driangle/taskmd/apps/cli/internal/scanner"
)

var (
	commitMsgTaskID string
	commitMsgType   string
	commitMsgBody   bool
	commitMsgShort  bool
)

var allowedTypes = map[string]bool{
	"feat":     true,
	"fix":      true,
	"chore":    true,
	"docs":     true,
	"test":     true,
	"refactor": true,
}

// gitDiffFunc is the function used to get git diff output.
// Override in tests to avoid running actual git commands.
var gitDiffFunc = runGitDiffCached

var commitMsgCmd = &cobra.Command{
	Use:   "commit-msg",
	Short: "Generate a conventional commit message from task metadata",
	Long: `Generate a conventional commit message derived from one or more tasks.

When --task-id is provided, the message is generated from that task.
When no --task-id is provided, the command inspects staged changes (git diff --cached)
to find task files whose status changed to completed.

Examples:
  taskmd commit-msg --task-id 042
  taskmd commit-msg --task-id 042 --type feat
  taskmd commit-msg --task-id 042 --type feat --body
  taskmd commit-msg --task-id 042 --short
  git commit -m "$(taskmd commit-msg --task-id 042)"`,
	Args: cobra.NoArgs,
	RunE: runCommitMsg,
}

func init() {
	rootCmd.AddCommand(commitMsgCmd)

	commitMsgCmd.Flags().StringVar(&commitMsgTaskID, "task-id", "", "task ID to generate message for")
	commitMsgCmd.Flags().StringVar(&commitMsgType, "type", "chore", "commit type prefix (feat, fix, chore, docs, test, refactor)")
	commitMsgCmd.Flags().BoolVar(&commitMsgBody, "body", false, "include completed subtasks as bullet points")
	commitMsgCmd.Flags().BoolVar(&commitMsgShort, "short", false, "subject line only (no body or footer)")
}

func runCommitMsg(_ *cobra.Command, _ []string) error {
	if !allowedTypes[commitMsgType] {
		return fmt.Errorf("invalid commit type %q (allowed: feat, fix, chore, docs, test, refactor)", commitMsgType)
	}

	flags := GetGlobalFlags()
	scanDir := ResolveScanDir(nil)

	taskScanner := scanner.NewScanner(scanDir, flags.Verbose, flags.IgnoreDirs)
	result, err := taskScanner.Scan()
	if err != nil {
		return fmt.Errorf("scan failed: %w", err)
	}

	tasks := result.Tasks

	var matched []*model.Task
	if commitMsgTaskID != "" {
		task := findExactMatch(commitMsgTaskID, tasks)
		if task == nil {
			return fmt.Errorf("task not found: %s", commitMsgTaskID)
		}
		matched = append(matched, task)
	} else {
		matched, err = findCompletedTasksFromDiff(tasks, scanDir)
		if err != nil {
			return err
		}
		if len(matched) == 0 {
			return fmt.Errorf("no completed tasks found in staged changes")
		}
	}

	msg := buildCommitMessage(matched, commitMsgType, commitMsgBody, commitMsgShort)
	fmt.Print(msg)
	return nil
}

func buildCommitMessage(tasks []*model.Task, commitType string, includeBody, short bool) string {
	if len(tasks) == 1 {
		return buildSingleTaskMessage(tasks[0], commitType, includeBody, short)
	}
	return buildMultiTaskMessage(tasks, commitType, includeBody, short)
}

func buildSingleTaskMessage(task *model.Task, commitType string, includeBody, short bool) string {
	subject := formatSubjectLine(task, commitType)
	if short {
		return subject + "\n"
	}

	var parts []string
	parts = append(parts, subject)

	if includeBody {
		subtasks := extractCompletedSubtasks(task.Body)
		if len(subtasks) > 0 {
			body := formatSubtaskBullets(subtasks)
			parts = append(parts, body)
		}
	}

	return strings.Join(parts, "\n\n") + "\n"
}

func buildMultiTaskMessage(tasks []*model.Task, commitType string, includeBody, short bool) string {
	ids := make([]string, len(tasks))
	for i, t := range tasks {
		ids[i] = t.ID
	}

	subject := fmt.Sprintf("%s: complete tasks %s", commitType, strings.Join(ids, ", "))
	if short {
		return subject + "\n"
	}

	var parts []string
	parts = append(parts, subject)

	if includeBody {
		var bodyParts []string
		for _, t := range tasks {
			subtasks := extractCompletedSubtasks(t.Body)
			if len(subtasks) > 0 {
				section := fmt.Sprintf("%s:\n%s", t.Title, formatSubtaskBullets(subtasks))
				bodyParts = append(bodyParts, section)
			}
		}
		if len(bodyParts) > 0 {
			parts = append(parts, strings.Join(bodyParts, "\n\n"))
		}
	}

	return strings.Join(parts, "\n\n") + "\n"
}

func formatSubjectLine(task *model.Task, commitType string) string {
	title := lowerFirst(task.Title)
	group := task.GetGroup()
	if group != "" {
		return fmt.Sprintf("%s(%s): %s (task %s)", commitType, group, title, task.ID)
	}
	return fmt.Sprintf("%s: %s (task %s)", commitType, title, task.ID)
}

func extractCompletedSubtasks(body string) []string {
	var subtasks []string
	s := bufio.NewScanner(strings.NewReader(body))
	for s.Scan() {
		line := strings.TrimSpace(s.Text())
		if strings.HasPrefix(line, "- [x]") || strings.HasPrefix(line, "- [X]") {
			text := strings.TrimSpace(line[5:])
			if text != "" {
				subtasks = append(subtasks, text)
			}
		}
	}
	return subtasks
}

func formatSubtaskBullets(subtasks []string) string {
	lines := make([]string, len(subtasks))
	for i, s := range subtasks {
		lines[i] = "- " + s
	}
	return strings.Join(lines, "\n")
}

func lowerFirst(s string) string {
	if s == "" {
		return s
	}
	runes := []rune(s)
	runes[0] = unicode.ToLower(runes[0])
	return string(runes)
}

// findCompletedTasksFromDiff runs git diff --cached, parses for files with
// +status: completed, and matches them against scanned tasks.
func findCompletedTasksFromDiff(tasks []*model.Task, scanDir string) ([]*model.Task, error) {
	diffOutput, err := gitDiffFunc(scanDir)
	if err != nil {
		return nil, fmt.Errorf("git diff failed: %w", err)
	}

	completedFiles := parseCompletedFilesFromDiff(diffOutput)
	if len(completedFiles) == 0 {
		return nil, nil
	}

	// Git diff paths are relative to the git repo root, not scanDir.
	// Resolve the git toplevel to build absolute paths for matching.
	gitRoot, err := resolveGitRoot(scanDir)
	if err != nil {
		return nil, err
	}

	absCompletedFiles := make(map[string]bool)
	for _, f := range completedFiles {
		abs := filepath.Join(gitRoot, f)
		absCompletedFiles[filepath.Clean(abs)] = true
	}

	var matched []*model.Task
	for _, t := range tasks {
		cleaned := filepath.Clean(t.FilePath)
		if absCompletedFiles[cleaned] {
			matched = append(matched, t)
		}
	}
	return matched, nil
}

// gitRootFunc resolves the git repository root. Override in tests.
var gitRootFunc = defaultGitRoot

func resolveGitRoot(scanDir string) (string, error) {
	return gitRootFunc(scanDir)
}

func defaultGitRoot(scanDir string) (string, error) {
	cmd := exec.Command("git", "rev-parse", "--show-toplevel")
	cmd.Dir = scanDir
	out, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("failed to find git root: %w", err)
	}
	return strings.TrimSpace(string(out)), nil
}

// parseCompletedFilesFromDiff parses unified diff output and returns file paths
// that have a line matching "+status: completed".
func parseCompletedFilesFromDiff(diff string) []string {
	var files []string
	var currentFile string

	s := bufio.NewScanner(strings.NewReader(diff))
	for s.Scan() {
		line := s.Text()
		if strings.HasPrefix(line, "+++ b/") {
			currentFile = strings.TrimPrefix(line, "+++ b/")
		} else if strings.HasPrefix(line, "+status: completed") && currentFile != "" {
			files = append(files, currentFile)
			currentFile = "" // avoid duplicates from same file
		}
	}
	return files
}

func runGitDiffCached(scanDir string) (string, error) {
	cmd := exec.Command("git", "diff", "--cached", "--unified=0")
	cmd.Dir = scanDir
	out, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(out), nil
}
