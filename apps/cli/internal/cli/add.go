package cli

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/spf13/cobra"

	"github.com/driangle/taskmd/apps/cli/internal/nextid"
	"github.com/driangle/taskmd/apps/cli/internal/scanner"
	"github.com/driangle/taskmd/apps/cli/internal/slug"
	"github.com/driangle/taskmd/apps/cli/internal/taskfile"
)

var (
	addPriority  string
	addEffort    string
	addTags      string
	addStatus    string
	addOwner     string
	addDependsOn string
	addParent    string
	addGroup     string
	addFormat    string
	addEdit      bool
)

var addCmd = &cobra.Command{
	Use:   "add <title>",
	Short: "Create a new task",
	Long: `Add creates a new task markdown file with proper frontmatter.

The title is used to generate both the task title and the filename slug.
A sequential ID is automatically assigned based on existing tasks.

Examples:
  taskmd add "Fix the login bug"
  taskmd add "Implement OAuth" --priority high --tags backend,auth
  taskmd add "Design mockups" --group design --effort large
  taskmd add "Quick fix" --edit`,
	Args: cobra.ExactArgs(1),
	RunE: runAdd,
}

func init() {
	rootCmd.AddCommand(addCmd)

	addCmd.Flags().StringVar(&addPriority, "priority", "medium", "task priority (low, medium, high, critical)")
	addCmd.Flags().StringVar(&addEffort, "effort", "", "task effort (small, medium, large)")
	addCmd.Flags().StringVar(&addTags, "tags", "", "comma-separated tags")
	addCmd.Flags().StringVar(&addStatus, "status", "pending", "task status (pending, in-progress, completed, blocked, cancelled)")
	addCmd.Flags().StringVar(&addOwner, "owner", "", "task owner/assignee")
	addCmd.Flags().StringVar(&addDependsOn, "depends-on", "", "comma-separated dependency task IDs")
	addCmd.Flags().StringVar(&addParent, "parent", "", "parent task ID")
	addCmd.Flags().StringVar(&addGroup, "group", "", "subdirectory to create the task in")
	addCmd.Flags().StringVar(&addFormat, "format", "plain", "output format (plain, json)")
	addCmd.Flags().BoolVar(&addEdit, "edit", false, "open the new task in $EDITOR")

	_ = addCmd.RegisterFlagCompletionFunc("priority", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return validPriorityValues, cobra.ShellCompDirectiveNoFileComp
	})
	_ = addCmd.RegisterFlagCompletionFunc("effort", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return validEffortValues, cobra.ShellCompDirectiveNoFileComp
	})
	_ = addCmd.RegisterFlagCompletionFunc("status", func(_ *cobra.Command, _ []string, _ string) ([]string, cobra.ShellCompDirective) {
		return validStatusValues, cobra.ShellCompDirectiveNoFileComp
	})
}

type addResult struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	FilePath string `json:"file_path"`
	Status   string `json:"status"`
	Priority string `json:"priority"`
}

func runAdd(_ *cobra.Command, args []string) error {
	title := args[0]

	if err := validateAddEnums(); err != nil {
		return err
	}
	if err := ValidateFormat(addFormat, []string{"plain", "json"}); err != nil {
		return err
	}

	flags := GetGlobalFlags()
	scanDir := ResolveScanDir(nil)

	taskScanner := scanner.NewScanner(scanDir, flags.Verbose, flags.IgnoreDirs)
	result, err := taskScanner.Scan()
	if err != nil {
		return fmt.Errorf("scan failed: %w", err)
	}

	ids := make([]string, len(result.Tasks))
	for i, task := range result.Tasks {
		ids[i] = task.ID
	}
	nextResult := nextid.Calculate(ids)
	id := nextResult.NextID

	outputDir := scanDir
	if addGroup != "" {
		outputDir = filepath.Join(scanDir, addGroup)
	}

	s := slug.Slugify(title)
	filename := fmt.Sprintf("%s-%s.md", id, s)
	filePath := filepath.Join(outputDir, filename)

	content := buildTaskFileContent(id, title)

	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}
	if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
		return fmt.Errorf("failed to write task file: %w", err)
	}

	if err := outputAddResult(id, title, filePath); err != nil {
		return err
	}

	if addEdit {
		return openInEditor(filePath)
	}

	return nil
}

func validateAddEnums() error {
	if !contains(validPriorityValues, addPriority) {
		return invalidValueError("priority", addPriority, validPriorityValues)
	}
	if !contains(validStatusValues, addStatus) {
		return invalidValueError("status", addStatus, validStatusValues)
	}
	if addEffort != "" && !contains(validEffortValues, addEffort) {
		return invalidValueError("effort", addEffort, validEffortValues)
	}
	return nil
}

func buildTaskFileContent(id, title string) string {
	var b strings.Builder
	b.WriteString("---\n")
	fmt.Fprintf(&b, "id: %q\n", id)
	fmt.Fprintf(&b, "title: %q\n", title)
	fmt.Fprintf(&b, "status: %s\n", addStatus)
	fmt.Fprintf(&b, "priority: %s\n", addPriority)

	if addEffort != "" {
		fmt.Fprintf(&b, "effort: %s\n", addEffort)
	}
	if addOwner != "" {
		fmt.Fprintf(&b, "owner: %s\n", addOwner)
	}
	if addParent != "" {
		fmt.Fprintf(&b, "parent: %q\n", addParent)
	}

	deps := parseDependsOn()
	b.WriteString(formatDependencies(deps) + "\n")

	tags := parseTags()
	b.WriteString(taskfile.FormatInlineTags(tags) + "\n")

	fmt.Fprintf(&b, "created: %s\n", time.Now().Format("2006-01-02"))
	b.WriteString("---\n")

	b.WriteString("\n")
	fmt.Fprintf(&b, "# %s\n", title)
	b.WriteString("\n")
	b.WriteString("## Objective\n")
	b.WriteString("\n")
	b.WriteString("<!-- Describe the goal of this task -->\n")
	b.WriteString("\n")
	b.WriteString("## Tasks\n")
	b.WriteString("\n")
	b.WriteString("- [ ] TODO\n")
	b.WriteString("\n")
	b.WriteString("## Acceptance Criteria\n")
	b.WriteString("\n")
	b.WriteString("- TODO\n")

	return b.String()
}

func parseTags() []string {
	if addTags == "" {
		return nil
	}
	parts := strings.Split(addTags, ",")
	var tags []string
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			tags = append(tags, p)
		}
	}
	return tags
}

func parseDependsOn() []string {
	if addDependsOn == "" {
		return nil
	}
	parts := strings.Split(addDependsOn, ",")
	var deps []string
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			deps = append(deps, p)
		}
	}
	return deps
}

func formatDependencies(deps []string) string {
	if len(deps) == 0 {
		return "dependencies: []"
	}
	quoted := make([]string, len(deps))
	for i, d := range deps {
		quoted[i] = `"` + d + `"`
	}
	return "dependencies: [" + strings.Join(quoted, ", ") + "]"
}

func outputAddResult(id, title, filePath string) error {
	switch addFormat {
	case "json":
		return WriteJSON(os.Stdout, addResult{
			ID:       id,
			Title:    title,
			FilePath: filePath,
			Status:   addStatus,
			Priority: addPriority,
		})
	default:
		fmt.Printf("Created task %s: %s\n", id, filePath)
		return nil
	}
}

func openInEditor(filePath string) error {
	editor := os.Getenv("EDITOR")
	if editor == "" {
		return fmt.Errorf("$EDITOR is not set; cannot open file for editing")
	}
	cmd := exec.Command(editor, filePath)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}
