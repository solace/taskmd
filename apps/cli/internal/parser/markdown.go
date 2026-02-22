package parser

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"

	"github.com/driangle/taskmd/apps/cli/internal/model"
)

const (
	frontmatterDelimiter = "---"
)

// ParseError represents an error during parsing
type ParseError struct {
	FilePath string
	Message  string
	Err      error
}

func (e *ParseError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("parse error in %s: %s: %v", e.FilePath, e.Message, e.Err)
	}
	return fmt.Sprintf("parse error in %s: %s", e.FilePath, e.Message)
}

// ParseTaskFile reads and parses a markdown file with YAML frontmatter
func ParseTaskFile(filePath string) (*model.Task, error) {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return nil, &ParseError{
			FilePath: filePath,
			Message:  "failed to read file",
			Err:      err,
		}
	}

	return ParseTaskContent(filePath, content)
}

// ParseTaskContent parses task content from bytes
func ParseTaskContent(filePath string, content []byte) (*model.Task, error) {
	if len(content) == 0 {
		return nil, &ParseError{
			FilePath: filePath,
			Message:  "file is empty",
		}
	}

	frontmatter, body, err := extractFrontmatter(content)
	if err != nil {
		return nil, &ParseError{
			FilePath: filePath,
			Message:  "failed to extract frontmatter",
			Err:      err,
		}
	}

	task := &model.Task{
		FilePath: filePath,
		Body:     body,
	}

	if len(frontmatter) > 0 {
		if err := yaml.Unmarshal(frontmatter, task); err != nil {
			return nil, &ParseError{
				FilePath: filePath,
				Message:  "failed to parse YAML frontmatter",
				Err:      err,
			}
		}
	}

	// Derive missing fields from filename
	if task.ID == "" || task.Title == "" {
		deriveFieldsFromFilename(task)
	}

	if !task.IsValid() {
		return nil, &ParseError{
			FilePath: filePath,
			Message:  "task is missing required fields (id or title)",
		}
	}

	return task, nil
}

// deriveFieldsFromFilename extracts ID and title from a filename.
// Supports three patterns:
//  1. Sequential: "009-add-feature.md" → ID="009"
//  2. Prefixed:   "dr-001-fix-login.md" → ID="dr-001"
//  3. Random:     "a3f9x2-slug-title.md" → ID="a3f9x2"
func deriveFieldsFromFilename(task *model.Task) {
	base := filepath.Base(task.FilePath)
	name := strings.TrimSuffix(base, filepath.Ext(base))

	if len(name) == 0 {
		return
	}

	id, slug := splitFilenameID(name)
	if id == "" {
		return
	}

	if task.ID == "" {
		task.ID = id
	}
	if task.Title == "" && slug != "" {
		task.Title = strings.ReplaceAll(slug, "-", " ")
	}
}

// splitFilenameID identifies the ID portion and remaining slug from a filename stem.
// Returns ("", "") if no ID pattern matches.
func splitFilenameID(name string) (id, slug string) {
	parts := strings.SplitN(name, "-", 2)

	// Pattern 1: Sequential — starts with digit (e.g. "009-add-feature")
	if name[0] >= '0' && name[0] <= '9' {
		slug := ""
		if len(parts) == 2 {
			slug = parts[1]
		}
		return parts[0], slug
	}

	if len(parts) < 2 {
		return "", ""
	}

	// Pattern 2: Prefixed — alpha prefix + hyphen + digits (e.g. "dr-001-fix-login")
	if isAlpha(parts[0]) {
		restParts := strings.SplitN(parts[1], "-", 2)
		if isNumeric(restParts[0]) {
			slug := ""
			if len(restParts) == 2 {
				slug = restParts[1]
			}
			return parts[0] + "-" + restParts[0], slug
		}
	}

	// Pattern 3: Random — 3-8 lowercase alphanumeric with at least one digit
	if isAlphanumericID(parts[0]) {
		return parts[0], parts[1]
	}

	return "", ""
}

// isNumeric returns true if s is non-empty and all characters are digits.
func isNumeric(s string) bool {
	if len(s) == 0 {
		return false
	}
	for _, c := range s {
		if c < '0' || c > '9' {
			return false
		}
	}
	return true
}

// isAlpha returns true if s is non-empty and all characters are lowercase letters.
func isAlpha(s string) bool {
	if len(s) == 0 {
		return false
	}
	for _, c := range s {
		if c < 'a' || c > 'z' {
			return false
		}
	}
	return true
}

// isAlphanumericID returns true if s is 3-8 lowercase alphanumeric chars with at least one digit.
// This avoids false-positives on English words like "readme".
func isAlphanumericID(s string) bool {
	if len(s) < 3 || len(s) > 8 {
		return false
	}
	hasDigit := false
	for _, c := range s {
		if c >= '0' && c <= '9' {
			hasDigit = true
		} else if c < 'a' || c > 'z' {
			return false
		}
	}
	return hasDigit
}

// extractFrontmatter splits content into frontmatter and body
func extractFrontmatter(content []byte) (frontmatter []byte, body string, err error) {
	lines := bytes.Split(content, []byte("\n"))

	// Check if content starts with frontmatter delimiter
	if len(lines) == 0 || string(bytes.TrimSpace(lines[0])) != frontmatterDelimiter {
		// No frontmatter, entire content is body
		return nil, string(content), nil
	}

	// Find closing delimiter
	closingIndex := -1
	for i := 1; i < len(lines); i++ {
		if string(bytes.TrimSpace(lines[i])) == frontmatterDelimiter {
			closingIndex = i
			break
		}
	}

	if closingIndex == -1 {
		return nil, "", fmt.Errorf("unclosed frontmatter delimiter")
	}

	// Extract frontmatter (between delimiters)
	frontmatterLines := lines[1:closingIndex]
	frontmatter = bytes.Join(frontmatterLines, []byte("\n"))

	// Extract body (after closing delimiter)
	if closingIndex+1 < len(lines) {
		bodyLines := lines[closingIndex+1:]
		body = strings.TrimSpace(string(bytes.Join(bodyLines, []byte("\n"))))
	}

	return frontmatter, body, nil
}
