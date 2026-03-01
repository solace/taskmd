package cli

import (
	"fmt"
	"os"
	"strings"

	"github.com/driangle/taskmd/sdk/go/model"
)

// findDuplicatesByID returns all tasks matching the given ID.
func findDuplicatesByID(id string, tasks []*model.Task) []*model.Task {
	var matches []*model.Task
	for _, t := range tasks {
		if t.ID == id {
			matches = append(matches, t)
		}
	}
	return matches
}

// findAllDuplicateIDs returns a map of ID → file paths for IDs that appear more than once.
func findAllDuplicateIDs(tasks []*model.Task) map[string][]string {
	counts := make(map[string][]*model.Task)
	for _, t := range tasks {
		counts[t.ID] = append(counts[t.ID], t)
	}

	dupes := make(map[string][]string)
	for id, group := range counts {
		if len(group) > 1 {
			paths := make([]string, len(group))
			for i, t := range group {
				paths[i] = t.FilePath
			}
			dupes[id] = paths
		}
	}
	return dupes
}

// warnDuplicateIDs prints a warning to stderr if any duplicate IDs exist.
// Returns the duplicate map for callers that need it.
func warnDuplicateIDs(tasks []*model.Task) map[string][]string {
	dupes := findAllDuplicateIDs(tasks)
	if len(dupes) == 0 {
		return dupes
	}

	fmt.Fprintf(os.Stderr, "Warning: found duplicate task IDs:\n")
	for id, paths := range dupes {
		fmt.Fprintf(os.Stderr, "  ID %q in %d files: %s\n", id, len(paths), strings.Join(paths, ", "))
	}
	fmt.Fprintf(os.Stderr, "Run 'taskmd deduplicate' to fix.\n")
	return dupes
}

// formatDuplicatePaths formats task file paths as a bulleted list.
func formatDuplicatePaths(tasks []*model.Task) string {
	lines := make([]string, len(tasks))
	for i, t := range tasks {
		lines[i] = fmt.Sprintf("  - %s", t.FilePath)
	}
	return strings.Join(lines, "\n")
}

// formatDuplicatePathsWithTitles formats task file paths and titles as a bulleted list.
func formatDuplicatePathsWithTitles(tasks []*model.Task) string {
	lines := make([]string, len(tasks))
	for i, t := range tasks {
		lines[i] = fmt.Sprintf("  - %s (%s)", t.FilePath, t.Title)
	}
	return strings.Join(lines, "\n")
}
