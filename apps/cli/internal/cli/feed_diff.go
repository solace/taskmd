package cli

import (
	"regexp"
	"sort"
	"strings"
)

// FieldChange represents a frontmatter field that changed between two versions.
type FieldChange struct {
	Field    string `json:"field"`
	OldValue string `json:"oldValue"`
	NewValue string `json:"newValue"`
}

// SubtaskChange represents a subtask checkbox that was toggled.
type SubtaskChange struct {
	Text string `json:"text"`
	Done bool   `json:"done"`
}

var subtaskRegex = regexp.MustCompile(`^- \[([ xX])\] (.+)$`)

// analyzeDiff compares old and new task file content, returning detected
// frontmatter field changes and subtask checkbox toggles.
func analyzeDiff(oldContent, newContent string) ([]FieldChange, []SubtaskChange) {
	oldFields := extractFrontmatterFields(oldContent)
	newFields := extractFrontmatterFields(newContent)

	var fieldChanges []FieldChange

	// Check all fields in new version for changes
	allKeys := make(map[string]struct{})
	for k := range oldFields {
		allKeys[k] = struct{}{}
	}
	for k := range newFields {
		allKeys[k] = struct{}{}
	}

	// Sort keys for deterministic output
	keys := make([]string, 0, len(allKeys))
	for k := range allKeys {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	for _, key := range keys {
		oldVal := oldFields[key]
		newVal := newFields[key]
		if oldVal != newVal {
			fieldChanges = append(fieldChanges, FieldChange{
				Field:    key,
				OldValue: oldVal,
				NewValue: newVal,
			})
		}
	}

	oldSubtasks := extractSubtasks(oldContent)
	newSubtasks := extractSubtasks(newContent)

	var subtaskChanges []SubtaskChange
	for text, newDone := range newSubtasks {
		oldDone, exists := oldSubtasks[text]
		if exists && oldDone != newDone {
			subtaskChanges = append(subtaskChanges, SubtaskChange{
				Text: text,
				Done: newDone,
			})
		}
	}

	// Sort subtask changes by text for deterministic output
	sort.Slice(subtaskChanges, func(i, j int) bool {
		return subtaskChanges[i].Text < subtaskChanges[j].Text
	})

	return fieldChanges, subtaskChanges
}

// extractFrontmatterFields parses YAML frontmatter (between --- delimiters)
// into a map of field name to value. Only handles simple key: value lines.
func extractFrontmatterFields(content string) map[string]string {
	fields := make(map[string]string)

	parts := strings.SplitN(content, "---", 3)
	if len(parts) < 3 {
		return fields
	}

	frontmatter := parts[1]
	for _, line := range strings.Split(frontmatter, "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		idx := strings.Index(line, ":")
		if idx < 1 {
			continue
		}
		key := strings.TrimSpace(line[:idx])
		value := strings.TrimSpace(line[idx+1:])
		// Strip surrounding quotes
		value = strings.Trim(value, `"'`)
		fields[key] = value
	}

	return fields
}

// extractSubtasks finds all markdown checkbox lines (- [ ] or - [x]) in the
// body (after frontmatter) and returns a map of subtask text to checked state.
func extractSubtasks(content string) map[string]bool {
	subtasks := make(map[string]bool)

	// Get body after frontmatter
	body := content
	parts := strings.SplitN(content, "---", 3)
	if len(parts) >= 3 {
		body = parts[2]
	}

	for _, line := range strings.Split(body, "\n") {
		line = strings.TrimSpace(line)
		match := subtaskRegex.FindStringSubmatch(line)
		if match != nil {
			checked := match[1] == "x" || match[1] == "X"
			text := match[2]
			subtasks[text] = checked
		}
	}

	return subtasks
}
