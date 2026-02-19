package todos

import (
	"bytes"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// DefaultMarkers lists the markers recognized by default.
var DefaultMarkers = []string{"TODO", "FIXME", "HACK", "XXX", "NOTE", "BUG", "OPTIMIZE"}

// ScanOptions configures the todo scanner.
type ScanOptions struct {
	Dir          string
	Markers      []string
	IncludeGlobs []string
	ExcludeGlobs []string
	Verbose      bool
}

// skipDirs are directories always skipped during scanning.
var skipDirs = map[string]bool{
	"node_modules": true,
	".git":         true,
	"vendor":       true,
	"dist":         true,
	"build":        true,
	".next":        true,
	"__pycache__":  true,
	".venv":        true,
}

// Scan walks a directory tree and returns all TODO items found.
func Scan(opts ScanOptions) ([]TodoItem, error) {
	if len(opts.Markers) == 0 {
		opts.Markers = DefaultMarkers
	}

	files, err := collectFiles(opts)
	if err != nil {
		return nil, err
	}

	files = filterGitIgnored(files, opts.Dir)
	files = filterBinary(files)

	return parseAllFiles(files, opts)
}

// collectFiles walks the directory and returns paths of supported source files.
func collectFiles(opts ScanOptions) ([]string, error) {
	var files []string
	err := filepath.WalkDir(opts.Dir, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		if d.IsDir() {
			return shouldSkipDir(d.Name())
		}
		if LookupSyntax(filepath.Ext(path)) == nil {
			return nil
		}
		rel := relPath(opts.Dir, path)
		if !matchGlobs(rel, opts.IncludeGlobs, opts.ExcludeGlobs) {
			return nil
		}
		files = append(files, path)
		return nil
	})
	return files, err
}

func shouldSkipDir(name string) error {
	if skipDirs[name] || (strings.HasPrefix(name, ".") && name != ".") {
		return filepath.SkipDir
	}
	return nil
}

// parseAllFiles parses each file and returns all found items with relative paths.
func parseAllFiles(files []string, opts ScanOptions) ([]TodoItem, error) {
	var items []TodoItem
	for _, path := range files {
		syntax := LookupSyntax(filepath.Ext(path))
		found, parseErr := ParseFile(path, syntax, opts.Markers)
		if parseErr != nil {
			continue
		}
		rel := relPath(opts.Dir, path)
		for i := range found {
			found[i].FilePath = rel
		}
		items = append(items, found...)
	}
	return items, nil
}

func relPath(base, path string) string {
	rel, err := filepath.Rel(base, path)
	if err != nil {
		return path
	}
	return rel
}

// matchGlobs returns true if rel matches include globs (or include is empty)
// and does not match any exclude glob.
func matchGlobs(rel string, include, exclude []string) bool {
	if len(include) > 0 && !matchesAny(rel, include) {
		return false
	}
	return !matchesAny(rel, exclude)
}

// matchesAny returns true if rel or its base name matches any glob pattern.
func matchesAny(rel string, patterns []string) bool {
	base := filepath.Base(rel)
	for _, p := range patterns {
		if m, _ := filepath.Match(p, rel); m {
			return true
		}
		if m, _ := filepath.Match(p, base); m {
			return true
		}
	}
	return false
}

// filterGitIgnored removes gitignored files using git check-ignore.
func filterGitIgnored(files []string, dir string) []string {
	if len(files) == 0 {
		return files
	}

	relPaths := make([]string, len(files))
	for i, f := range files {
		relPaths[i] = relPath(dir, f)
	}

	cmd := exec.Command("git", "check-ignore", "--stdin")
	cmd.Dir = dir
	cmd.Stdin = strings.NewReader(strings.Join(relPaths, "\n"))

	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		return files
	}

	ignored := make(map[string]bool)
	for _, line := range strings.Split(strings.TrimSpace(out.String()), "\n") {
		if line != "" {
			ignored[line] = true
		}
	}

	var filtered []string
	for i, f := range files {
		if !ignored[relPaths[i]] {
			filtered = append(filtered, f)
		}
	}
	return filtered
}

// filterBinary removes files that appear to be binary (null bytes in first 8KB).
func filterBinary(files []string) []string {
	var result []string
	for _, path := range files {
		if !isBinary(path) {
			result = append(result, path)
		}
	}
	return result
}

func isBinary(path string) bool {
	f, err := os.Open(path)
	if err != nil {
		return false
	}
	defer f.Close()

	buf := make([]byte, 8192)
	n, _ := f.Read(buf)
	if n == 0 {
		return false
	}
	return bytes.ContainsRune(buf[:n], 0)
}
