package cli

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/driangle/taskmd/sdk/go/scanner"
)

const maxTitleLen = 30

var currentCmd = &cobra.Command{
	Use:   "current",
	Short: "Show the current in-progress task",
	Long: `Current outputs the in-progress task in a compact format for statusline integrations.

Output format: #<ID> <title>

If no task is in-progress, nothing is printed and the exit code is 0.
Titles longer than 30 characters are truncated with "...".

Examples:
  taskmd current
  # Output: #135 Windows installation support

  # Use in a shell statusline:
  echo "$(taskmd current)"`,
	Args: cobra.MaximumNArgs(1),
	RunE: runCurrent,
}

func init() {
	rootCmd.AddCommand(currentCmd)
}

func runCurrent(cmd *cobra.Command, args []string) error {
	flags := GetGlobalFlags()
	scanDir := ResolveScanDir(args)

	taskScanner := scanner.NewScanner(scanDir, flags.Verbose, flags.IgnoreDirs)
	result, err := taskScanner.Scan()
	if err != nil {
		return fmt.Errorf("scan failed: %w", err)
	}

	filtered, err := applyFilters(result.Tasks, []string{"status=in-progress"})
	if err != nil {
		return fmt.Errorf("filter failed: %w", err)
	}

	if len(filtered) == 0 {
		return nil
	}

	task := filtered[0]
	title := task.Title
	if len(title) > maxTitleLen {
		title = title[:maxTitleLen] + "..."
	}

	fmt.Printf("#%s %s\n", task.ID, title)
	return nil
}
