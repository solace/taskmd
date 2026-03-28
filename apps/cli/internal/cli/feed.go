package cli

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/charmbracelet/lipgloss"
	"github.com/spf13/cobra"

	"github.com/driangle/taskmd/sdk/go/worklog"
)

var (
	feedFormat string
	feedLimit  int
	feedSince  string
	feedScope  string
	feedSource string
)

// gitLogFunc is the function used to run git log.
// Override in tests to avoid running actual git commands.
var gitLogFunc = runGitLog

// gitShowFunc is the function used to run git show.
// Override in tests to avoid running actual git commands.
var gitShowFunc = runGitShow

// FeedEntry represents a single event in the activity feed.
type FeedEntry struct {
	Source    string       `json:"source"`
	Hash      string       `json:"hash,omitempty"`
	Author    string       `json:"author,omitempty"`
	Timestamp time.Time    `json:"timestamp"`
	Message   string       `json:"message"`
	TaskID    string       `json:"taskID,omitempty"`
	Files     []FileChange `json:"files,omitempty"`
}

// FileChange represents a file changed in a commit.
type FileChange struct {
	Path           string          `json:"path"`
	Status         string          `json:"status"`
	TaskID         string          `json:"taskID,omitempty"`
	TaskStatus     string          `json:"taskStatus,omitempty"`
	FieldChanges   []FieldChange   `json:"fieldChanges,omitempty"`
	SubtaskChanges []SubtaskChange `json:"subtaskChanges,omitempty"`
}

var taskIDFromFilenameRegex = regexp.MustCompile(`(?:^|/)(\w+)-`)

var feedCmd = &cobra.Command{
	Use:        "feed",
	SuggestFor: []string{"activity", "log", "history"},
	Short:      "Show a chronological activity feed of task changes",
	Long: `Show a chronological activity feed of recent changes to task files.

Uses git log to detect task creation, modification, and renames,
presenting them as a time-ordered feed.

Examples:
  taskmd feed
  taskmd feed --since 7d
  taskmd feed --limit 10
  taskmd feed --scope cli
  taskmd feed --format json
  taskmd feed --source worklog
  taskmd feed --source git`,
	Args: cobra.NoArgs,
	RunE: runFeed,
}

func init() {
	rootCmd.AddCommand(feedCmd)

	feedCmd.Flags().StringVar(&feedFormat, "format", "text", "output format (text, json)")
	feedCmd.Flags().IntVar(&feedLimit, "limit", 20, "maximum number of entries to show")
	feedCmd.Flags().StringVar(&feedSince, "since", "", "show changes since (e.g. 2d, 1w, 2026-02-28)")
	feedCmd.Flags().StringVar(&feedScope, "scope", "", "filter to a tasks subdirectory; supports wildcards (e.g. cli, cli*)")
	feedCmd.Flags().StringVar(&feedSource, "source", "all", "filter by event source (all, git, worklog)")
}

func runFeed(_ *cobra.Command, _ []string) error {
	if err := ValidateFormat(feedFormat, []string{"text", "json"}); err != nil {
		return err
	}

	validSources := map[string]bool{"all": true, "git": true, "worklog": true}
	if !validSources[feedSource] {
		return fmt.Errorf("unsupported source: %q (supported: all, git, worklog)", feedSource)
	}

	flags := GetGlobalFlags()
	tasksDir := flags.TaskDir

	var gitEntries, worklogEntries []FeedEntry

	if feedSource != "worklog" {
		args := buildGitLogArgs(tasksDir, feedLimit, feedSince, feedScope)
		output, err := gitLogFunc(tasksDir, args)
		if err != nil {
			return fmt.Errorf("failed to read git history (is this a git repository?): %w", err)
		}
		gitEntries = parseGitLogOutput(output)
		for i := range gitEntries {
			gitEntries[i].Source = "git"
		}
		enrichEntriesWithDiffAnalysis(gitEntries)
	}

	if feedSource != "git" {
		worklogEntries = scanWorklogEntries(tasksDir, feedScope, feedSince, flags.Verbose)
	}

	entries := mergeEntries(gitEntries, worklogEntries)

	if feedLimit > 0 && len(entries) > feedLimit {
		entries = entries[:feedLimit]
	}

	if len(entries) == 0 {
		if feedFormat == "text" {
			fmt.Println("No recent task changes.")
		} else {
			fmt.Print("[]\n")
		}
		return nil
	}

	switch feedFormat {
	case "json":
		return WriteJSON(os.Stdout, entries)
	default:
		return writeFeedText(entries)
	}
}

func buildGitLogArgs(tasksDir string, limit int, since, scope string) []string {
	args := []string{
		"log",
		"--format=%H%n%an%n%ai%n%s",
		"--name-status",
		"--diff-filter=ACMR",
		fmt.Sprintf("-%d", limit),
	}

	if since != "" {
		args = append(args, "--since="+normalizeSince(since))
	}

	args = append(args, "--")

	if scope != "" && containsGlobChars(scope) {
		// Wildcard scope: expand to matching subdirectories.
		matches, _ := filepath.Glob(filepath.Join(tasksDir, scope))
		for _, m := range matches {
			args = append(args, filepath.Join(m, "**", "*.md"))
		}
		// If no directories matched, fall back to the literal pattern
		// so git returns no results rather than all results.
		if len(matches) == 0 {
			args = append(args, filepath.Join(tasksDir, scope, "**", "*.md"))
		}
	} else if scope != "" {
		args = append(args, filepath.Join(tasksDir, scope, "**", "*.md"))
	} else {
		args = append(args, filepath.Join(tasksDir, "**", "*.md"))
	}

	return args
}

func containsGlobChars(s string) bool {
	return strings.ContainsAny(s, "*?[")
}

// normalizeSince converts shorthand durations like "2d" or "1w" into
// git-compatible relative date strings like "2.days.ago" or "1.weeks.ago".
// Values that don't match the shorthand pattern are returned as-is,
// allowing absolute dates to pass through.
func normalizeSince(s string) string {
	unitMap := map[byte]string{
		'd': "days",
		'w': "weeks",
		'm': "months",
		'y': "years",
	}

	if len(s) < 2 {
		return s
	}

	unit := s[len(s)-1]
	numPart := s[:len(s)-1]

	word, ok := unitMap[unit]
	if !ok {
		return s
	}

	// Verify the numeric part is all digits
	for _, c := range numPart {
		if c < '0' || c > '9' {
			return s
		}
	}

	return numPart + "." + word + ".ago"
}

func runGitLog(_ string, args []string) (string, error) {
	cmd := exec.Command("git", args...)
	out, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(out), nil
}

func runGitShow(hash, path string) (string, error) {
	cmd := exec.Command("git", "show", hash+":"+path)
	out, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(out), nil
}

var statusLineRegex = regexp.MustCompile(`(?m)^status:\s*(\S+)`)

// extractStatusFromContent extracts the status field from task file frontmatter.
func extractStatusFromContent(content string) string {
	// Only look within frontmatter (between --- delimiters)
	parts := strings.SplitN(content, "---", 3)
	if len(parts) < 3 {
		return ""
	}
	match := statusLineRegex.FindStringSubmatch(parts[1])
	if len(match) >= 2 {
		return match[1]
	}
	return ""
}

// enrichEntriesWithDiffAnalysis reads task files at each commit and its parent
// to detect field-level changes and subtask completions.
func enrichEntriesWithDiffAnalysis(entries []FeedEntry) {
	for i := range entries {
		for j := range entries[i].Files {
			enrichFileChange(&entries[i].Files[j], entries[i].Hash)
		}
	}
}

func enrichFileChange(fc *FileChange, hash string) {
	newContent, err := gitShowFunc(hash, fc.Path)
	if err != nil {
		return
	}

	if fc.Status != "modified" {
		setTerminalStatus(fc, newContent)
		return
	}

	oldContent, err := gitShowFunc(hash+"^", fc.Path)
	if err != nil {
		setTerminalStatus(fc, newContent)
		return
	}

	fieldChanges, subtaskChanges := analyzeDiff(oldContent, newContent)
	fc.FieldChanges = fieldChanges
	fc.SubtaskChanges = subtaskChanges

	for _, change := range fieldChanges {
		if change.Field == "status" && (change.NewValue == "completed" || change.NewValue == "cancelled") {
			fc.TaskStatus = change.NewValue
		}
	}
}

// setTerminalStatus checks if a file has completed/cancelled status and sets TaskStatus.
func setTerminalStatus(fc *FileChange, content string) {
	status := extractStatusFromContent(content)
	if status == "completed" || status == "cancelled" {
		fc.TaskStatus = status
	}
}

func parseGitLogOutput(output string) []FeedEntry {
	if strings.TrimSpace(output) == "" {
		return nil
	}

	var entries []FeedEntry
	var current *FeedEntry
	lineAfterHash := 0

	s := bufio.NewScanner(strings.NewReader(output))
	for s.Scan() {
		line := s.Text()

		if len(line) == 40 && isHexString(line) {
			if current != nil {
				entries = append(entries, *current)
			}
			current = &FeedEntry{Hash: line}
			lineAfterHash = 1
			continue
		}

		if current == nil || len(line) == 0 {
			continue
		}

		lineAfterHash = parseEntryLine(current, line, lineAfterHash)
	}

	if current != nil {
		entries = append(entries, *current)
	}

	return entries
}

// parseEntryLine parses a single line within a commit entry and returns the
// updated line position counter.
func parseEntryLine(entry *FeedEntry, line string, pos int) int {
	switch pos {
	case 1:
		entry.Author = line
		return 2
	case 2:
		t, err := time.Parse("2006-01-02 15:04:05 -0700", line)
		if err == nil {
			entry.Timestamp = t
		}
		return 3
	case 3:
		entry.Message = line
		return 4
	default:
		if fc := parseFileChangeLine(line); fc != nil {
			entry.Files = append(entry.Files, *fc)
		}
		return pos
	}
}

func parseFileChangeLine(line string) *FileChange {
	parts := strings.Split(line, "\t")
	if len(parts) < 2 {
		return nil
	}

	statusCode := parts[0]
	var path, status string

	switch {
	case statusCode == "A":
		status = "created"
		path = parts[1]
	case statusCode == "M":
		status = "modified"
		path = parts[1]
	case strings.HasPrefix(statusCode, "R"):
		status = "renamed"
		if len(parts) >= 3 {
			path = parts[2] // new path
		} else {
			path = parts[1]
		}
	default:
		return nil
	}

	taskID := extractTaskIDFromPath(path)

	return &FileChange{
		Path:   path,
		Status: status,
		TaskID: taskID,
	}
}

func extractTaskIDFromPath(path string) string {
	base := filepath.Base(path)
	base = strings.TrimSuffix(base, filepath.Ext(base))
	match := taskIDFromFilenameRegex.FindStringSubmatch(base)
	if len(match) >= 2 {
		return match[1]
	}
	return ""
}

func isHexString(s string) bool {
	for _, c := range s {
		if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')) {
			return false
		}
	}
	return true
}

// scanWorklogEntries finds .worklogs/*.md files under tasksDir and converts
// their entries into FeedEntry values with Source "worklog".
func scanWorklogEntries(tasksDir, scope, since string, verbose bool) []FeedEntry {
	var sinceTime time.Time
	if since != "" {
		sinceTime = parseSinceTime(since)
	}

	pattern := buildWorklogGlobPattern(tasksDir, scope)
	files, _ := filepath.Glob(pattern)

	var entries []FeedEntry
	for _, f := range files {
		wl, err := worklog.ParseWorklog(f)
		if err != nil {
			if verbose {
				fmt.Fprintf(os.Stderr, "warning: failed to parse worklog %s: %v\n", f, err)
			}
			continue
		}

		for _, e := range wl.Entries {
			if !sinceTime.IsZero() && e.Timestamp.Before(sinceTime) {
				continue
			}
			entries = append(entries, FeedEntry{
				Source:    "worklog",
				TaskID:    wl.TaskID,
				Timestamp: e.Timestamp,
				Message:   truncateFirstLine(e.Content),
			})
		}
	}

	sort.Slice(entries, func(i, j int) bool {
		return entries[i].Timestamp.After(entries[j].Timestamp)
	})

	return entries
}

func buildWorklogGlobPattern(tasksDir, scope string) string {
	if scope != "" && containsGlobChars(scope) {
		// For wildcard scopes, we can't easily expand here; use a broad pattern.
		// The worklog files live under .worklogs/ inside each scope dir.
		return filepath.Join(tasksDir, scope, ".worklogs", "*.md")
	}
	if scope != "" {
		return filepath.Join(tasksDir, scope, ".worklogs", "*.md")
	}
	// Match worklogs in any subdirectory (one level deep) or root
	return filepath.Join(tasksDir, "*", ".worklogs", "*.md")
}

// truncateFirstLine returns the first non-empty line of content.
func truncateFirstLine(content string) string {
	for _, line := range strings.Split(content, "\n") {
		line = strings.TrimSpace(line)
		if line != "" {
			return line
		}
	}
	return ""
}

// parseSinceTime converts a since string into a time.Time cutoff.
func parseSinceTime(since string) time.Time {
	unitDurations := map[byte]time.Duration{
		'd': 24 * time.Hour,
		'w': 7 * 24 * time.Hour,
		'm': 30 * 24 * time.Hour,
		'y': 365 * 24 * time.Hour,
	}

	if len(since) >= 2 {
		unit := since[len(since)-1]
		numPart := since[:len(since)-1]
		if d, ok := unitDurations[unit]; ok {
			allDigits := true
			for _, c := range numPart {
				if c < '0' || c > '9' {
					allDigits = false
					break
				}
			}
			if allDigits {
				n := 0
				for _, c := range numPart {
					n = n*10 + int(c-'0')
				}
				return time.Now().Add(-time.Duration(n) * d)
			}
		}
	}

	// Try absolute date
	if t, err := time.Parse("2006-01-02", since); err == nil {
		return t
	}

	return time.Time{}
}

// mergeEntries merges two slices of FeedEntry sorted by timestamp descending.
func mergeEntries(a, b []FeedEntry) []FeedEntry {
	if len(b) == 0 {
		return a
	}
	if len(a) == 0 {
		return b
	}

	result := make([]FeedEntry, 0, len(a)+len(b))
	i, j := 0, 0
	for i < len(a) && j < len(b) {
		if a[i].Timestamp.After(b[j].Timestamp) || a[i].Timestamp.Equal(b[j].Timestamp) {
			result = append(result, a[i])
			i++
		} else {
			result = append(result, b[j])
			j++
		}
	}
	result = append(result, a[i:]...)
	result = append(result, b[j:]...)
	return result
}

func writeFeedText(entries []FeedEntry) error {
	r := getRenderer()

	fmt.Println(formatDim("Recent task activity", r))
	fmt.Println()

	for i, entry := range entries {
		if i > 0 {
			fmt.Println()
		}

		if entry.Source == "worklog" {
			writeWorklogEntryText(entry, r)
			continue
		}

		date := formatDim(entry.Timestamp.Format("2006-01-02 15:04"), r)
		author := formatLabel(entry.Author, r)
		fmt.Printf("%s %s: %s\n", date, author, entry.Message)

		for _, f := range entry.Files {
			writeFileChangeText(f, r)
		}
	}

	return nil
}

func writeWorklogEntryText(entry FeedEntry, r *lipgloss.Renderer) {
	date := formatDim(entry.Timestamp.Format("2006-01-02 15:04"), r)
	taskRef := ""
	if entry.TaskID != "" {
		taskRef = fmt.Sprintf(" (%s)", formatTaskID(entry.TaskID, r))
	}
	fmt.Printf("%s [Worklog]%s %s\n", date, taskRef, entry.Message)
}

func writeFileChangeText(f FileChange, r *lipgloss.Renderer) {
	statusTag := fileStatusTag(f)
	taskRef := ""
	if f.TaskID != "" {
		taskRef = fmt.Sprintf(" (%s)", formatTaskID(f.TaskID, r))
	}

	summary := formatChangeSummary(f)
	if summary != "" {
		fmt.Printf("  %s %s%s: %s\n", statusTag, f.Path, taskRef, summary)
	} else {
		fmt.Printf("  %s %s%s\n", statusTag, f.Path, taskRef)
	}
}

// formatChangeSummary builds a compact one-line summary of field and subtask changes.
func formatChangeSummary(f FileChange) string {
	var parts []string
	for _, fc := range f.FieldChanges {
		parts = append(parts, fmt.Sprintf("%s %s \u2192 %s", fc.Field, fc.OldValue, fc.NewValue))
	}
	done := 0
	undone := 0
	for _, sc := range f.SubtaskChanges {
		if sc.Done {
			done++
		} else {
			undone++
		}
	}
	if done > 0 {
		parts = append(parts, fmt.Sprintf("%d subtask(s) completed", done))
	}
	if undone > 0 {
		parts = append(parts, fmt.Sprintf("%d subtask(s) unchecked", undone))
	}
	return strings.Join(parts, ", ")
}

func fileStatusTag(fc FileChange) string {
	if fc.TaskStatus == "completed" {
		return "[Completed]"
	}
	if fc.TaskStatus == "cancelled" {
		return "[Cancelled]"
	}
	switch fc.Status {
	case "created":
		return "[Added]"
	case "modified":
		return "[Modified]"
	case "renamed":
		return "[Renamed]"
	default:
		return "[?]"
	}
}
