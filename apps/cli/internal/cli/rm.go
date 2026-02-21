package cli

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/cobra"

	"github.com/driangle/taskmd/apps/cli/internal/scanner"
)

var (
	rmForce  bool
	rmDryRun bool
)

// rmStdinReader is the reader used for interactive confirmation.
// Override in tests to simulate user input.
var rmStdinReader io.Reader = os.Stdin

var rmCmd = &cobra.Command{
	Use:   "rm <task-id>",
	Short: "Delete a task file permanently",
	Long: `Remove permanently deletes a task file by ID.

The command looks up the task, displays its details, and asks for confirmation
before deleting. Use --force to skip the confirmation prompt.

Examples:
  taskmd rm 042
  taskmd rm 042 --force
  taskmd rm 042 -f
  taskmd rm 042 --dry-run`,
	Args: cobra.ExactArgs(1),
	RunE: runRm,
}

func init() {
	rootCmd.AddCommand(rmCmd)

	rmCmd.Flags().BoolVarP(&rmForce, "force", "f", false, "skip confirmation prompt")
	rmCmd.Flags().BoolVar(&rmDryRun, "dry-run", false, "preview what would be deleted without acting")
}

func runRm(_ *cobra.Command, args []string) error {
	taskID := args[0]

	flags := GetGlobalFlags()
	scanDir := ResolveScanDir(nil)

	taskScanner := scanner.NewScanner(scanDir, flags.Verbose, flags.IgnoreDirs)
	result, err := taskScanner.Scan()
	if err != nil {
		return fmt.Errorf("scan failed: %w", err)
	}

	task := findExactMatch(taskID, result.Tasks)
	if task == nil {
		return fmt.Errorf("task not found: %s", taskID)
	}

	absScanDir, err := filepath.Abs(scanDir)
	if err != nil {
		return fmt.Errorf("failed to resolve scan directory: %w", err)
	}

	relPath, err := filepath.Rel(absScanDir, task.FilePath)
	if err != nil {
		relPath = task.FilePath
	}

	r := getRenderer()
	fmt.Printf("Delete 1 task:\n")
	fmt.Printf("  %s  %s  %s\n", formatTaskID(task.ID, r), task.Title, formatDim("("+relPath+")", r))

	if rmDryRun {
		fmt.Println("\n" + formatWarning("Dry run — no changes made.", r))
		return nil
	}

	if !rmForce {
		fmt.Printf("\nConfirm delete? [y/N] ")
		reader := bufio.NewReader(rmStdinReader)
		line, _ := reader.ReadString('\n')
		line = strings.TrimSpace(strings.ToLower(line))
		if line != "y" && line != "yes" {
			fmt.Println("Cancelled.")
			return nil
		}
	}

	if err := os.Remove(task.FilePath); err != nil {
		return fmt.Errorf("failed to delete %s: %w", relPath, err)
	}

	fmt.Println(formatSuccess("Deleted 1 task.", r))
	return nil
}
