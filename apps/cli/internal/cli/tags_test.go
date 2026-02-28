package cli

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/driangle/taskmd/sdk/go/model"
)

func resetTagsFlags() {
	tagsFilters = []string{}
	noColor = true
}

func captureTagsTableOutput(t *testing.T, tagInfos []TagInfo) string {
	t.Helper()

	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := outputTagsTable(tagInfos)
	if err != nil {
		w.Close()
		os.Stdout = oldStdout
		t.Fatalf("outputTagsTable failed: %v", err)
	}

	w.Close()
	os.Stdout = oldStdout

	var buf bytes.Buffer
	buf.ReadFrom(r)
	return buf.String()
}

func TestAggregateTags_HappyPath(t *testing.T) {
	tasks := []*model.Task{
		{ID: "001", Tags: []string{"cli", "mvp", "go"}},
		{ID: "002", Tags: []string{"cli", "mvp"}},
		{ID: "003", Tags: []string{"cli", "web"}},
		{ID: "004", Tags: []string{"docs"}},
	}

	result := aggregateTags(tasks)

	if len(result) != 5 {
		t.Fatalf("expected 5 tags, got %d", len(result))
	}

	// cli should be first with count 3
	if result[0].Tag != "cli" || result[0].Count != 3 {
		t.Errorf("expected first tag cli:3, got %s:%d", result[0].Tag, result[0].Count)
	}

	// mvp should be second with count 2
	if result[1].Tag != "mvp" || result[1].Count != 2 {
		t.Errorf("expected second tag mvp:2, got %s:%d", result[1].Tag, result[1].Count)
	}
}

func TestAggregateTags_NoTags(t *testing.T) {
	tasks := []*model.Task{
		{ID: "001", Tags: []string{}},
		{ID: "002"},
	}

	result := aggregateTags(tasks)

	if len(result) != 0 {
		t.Fatalf("expected 0 tags, got %d", len(result))
	}
}

func TestAggregateTags_SingleTag(t *testing.T) {
	tasks := []*model.Task{
		{ID: "001", Tags: []string{"cli"}},
		{ID: "002", Tags: []string{"cli"}},
		{ID: "003", Tags: []string{"cli"}},
	}

	result := aggregateTags(tasks)

	if len(result) != 1 {
		t.Fatalf("expected 1 tag, got %d", len(result))
	}
	if result[0].Tag != "cli" || result[0].Count != 3 {
		t.Errorf("expected cli:3, got %s:%d", result[0].Tag, result[0].Count)
	}
}

func TestAggregateTags_TieBreakAlphabetical(t *testing.T) {
	tasks := []*model.Task{
		{ID: "001", Tags: []string{"beta", "alpha"}},
		{ID: "002", Tags: []string{"beta", "alpha"}},
	}

	result := aggregateTags(tasks)

	if len(result) != 2 {
		t.Fatalf("expected 2 tags, got %d", len(result))
	}

	// Same count, should be sorted alphabetically
	if result[0].Tag != "alpha" {
		t.Errorf("expected alpha first (alphabetical tie-break), got %s", result[0].Tag)
	}
	if result[1].Tag != "beta" {
		t.Errorf("expected beta second, got %s", result[1].Tag)
	}
}

func TestOutputTagsTable_HappyPath(t *testing.T) {
	resetTagsFlags()

	tagInfos := []TagInfo{
		{Tag: "cli", Count: 12},
		{Tag: "mvp", Count: 8},
		{Tag: "commands", Count: 5},
	}

	output := captureTagsTableOutput(t, tagInfos)

	if !strings.Contains(output, "TAG") || !strings.Contains(output, "COUNT") {
		t.Error("expected header with TAG and COUNT")
	}
	if !strings.Contains(output, "cli") || !strings.Contains(output, "12") {
		t.Error("expected cli with count 12")
	}
	if !strings.Contains(output, "mvp") || !strings.Contains(output, "8") {
		t.Error("expected mvp with count 8")
	}
	if !strings.Contains(output, "commands") || !strings.Contains(output, "5") {
		t.Error("expected commands with count 5")
	}
}

func TestOutputTagsTable_NoTags(t *testing.T) {
	resetTagsFlags()

	output := captureTagsTableOutput(t, []TagInfo{})

	if !strings.Contains(output, "No tags found") {
		t.Error("expected 'No tags found' message for empty tags")
	}
}

func TestOutputTagsJSON(t *testing.T) {
	resetTagsFlags()

	tagInfos := []TagInfo{
		{Tag: "cli", Count: 5},
		{Tag: "web", Count: 3},
	}

	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := outputTagsJSON(tagInfos)
	if err != nil {
		w.Close()
		os.Stdout = oldStdout
		t.Fatalf("outputTagsJSON failed: %v", err)
	}

	w.Close()
	os.Stdout = oldStdout

	var buf bytes.Buffer
	buf.ReadFrom(r)

	var parsed []TagInfo
	if err := json.Unmarshal(buf.Bytes(), &parsed); err != nil {
		t.Fatalf("failed to parse JSON output: %v", err)
	}

	if len(parsed) != 2 {
		t.Fatalf("expected 2 tags in JSON, got %d", len(parsed))
	}
	if parsed[0].Tag != "cli" || parsed[0].Count != 5 {
		t.Errorf("expected cli:5, got %s:%d", parsed[0].Tag, parsed[0].Count)
	}
	if parsed[1].Tag != "web" || parsed[1].Count != 3 {
		t.Errorf("expected web:3, got %s:%d", parsed[1].Tag, parsed[1].Count)
	}
}

func createTagsTestFiles(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()

	task1 := `---
id: "001"
title: "Task One"
status: pending
tags:
  - cli
  - mvp
---
# Task One
`
	task2 := `---
id: "002"
title: "Task Two"
status: completed
tags:
  - cli
  - web
---
# Task Two
`
	task3 := `---
id: "003"
title: "Task Three"
status: pending
tags:
  - mvp
  - docs
---
# Task Three
`
	os.WriteFile(filepath.Join(dir, "001-task-one.md"), []byte(task1), 0644)
	os.WriteFile(filepath.Join(dir, "002-task-two.md"), []byte(task2), 0644)
	os.WriteFile(filepath.Join(dir, "003-task-three.md"), []byte(task3), 0644)
	return dir
}

func captureRunTagsOutput(t *testing.T, args []string) string {
	t.Helper()

	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runTags(tagsCmd, args)
	w.Close()
	os.Stdout = oldStdout

	if err != nil {
		t.Fatalf("runTags failed: %v", err)
	}

	var buf bytes.Buffer
	buf.ReadFrom(r)
	return buf.String()
}

func TestRunTags_TableOutput(t *testing.T) {
	dir := createTagsTestFiles(t)
	resetTagsFlags()
	tagsFormat = "table"

	output := captureRunTagsOutput(t, []string{dir})

	if !strings.Contains(output, "TAG") || !strings.Contains(output, "COUNT") {
		t.Error("expected TAG and COUNT headers in table output")
	}
	if !strings.Contains(output, "cli") {
		t.Error("expected 'cli' tag in output")
	}
	if !strings.Contains(output, "mvp") {
		t.Error("expected 'mvp' tag in output")
	}
}

func TestRunTags_JSONOutput(t *testing.T) {
	dir := createTagsTestFiles(t)
	resetTagsFlags()
	tagsFormat = "json"

	output := captureRunTagsOutput(t, []string{dir})

	var parsed []TagInfo
	if err := json.Unmarshal([]byte(output), &parsed); err != nil {
		t.Fatalf("failed to parse JSON output: %v", err)
	}

	if len(parsed) != 4 {
		t.Fatalf("expected 4 tags, got %d", len(parsed))
	}

	// cli and mvp should have count 2
	tagMap := make(map[string]int)
	for _, ti := range parsed {
		tagMap[ti.Tag] = ti.Count
	}
	if tagMap["cli"] != 2 {
		t.Errorf("expected cli:2, got %d", tagMap["cli"])
	}
	if tagMap["mvp"] != 2 {
		t.Errorf("expected mvp:2, got %d", tagMap["mvp"])
	}
}

func TestRunTags_YAMLOutput(t *testing.T) {
	dir := createTagsTestFiles(t)
	resetTagsFlags()
	tagsFormat = "yaml"

	output := captureRunTagsOutput(t, []string{dir})

	if !strings.Contains(output, "tag:") || !strings.Contains(output, "count:") {
		t.Error("expected YAML keys 'tag:' and 'count:' in output")
	}
}

func TestRunTags_InvalidFormat(t *testing.T) {
	dir := createTagsTestFiles(t)
	resetTagsFlags()
	tagsFormat = "invalid"

	err := runTags(tagsCmd, []string{dir})
	if err == nil {
		t.Fatal("expected error for invalid format")
	}
	if !strings.Contains(err.Error(), "unsupported format") {
		t.Errorf("expected 'unsupported format' error, got: %v", err)
	}
}

func TestRunTags_WithFilter(t *testing.T) {
	dir := createTagsTestFiles(t)
	resetTagsFlags()
	tagsFormat = "json"
	tagsFilters = []string{"status=pending"}

	output := captureRunTagsOutput(t, []string{dir})

	var parsed []TagInfo
	if err := json.Unmarshal([]byte(output), &parsed); err != nil {
		t.Fatalf("failed to parse JSON output: %v", err)
	}

	tagMap := make(map[string]int)
	for _, ti := range parsed {
		tagMap[ti.Tag] = ti.Count
	}

	// Only pending tasks: 001 (cli, mvp) and 003 (mvp, docs)
	if tagMap["cli"] != 1 {
		t.Errorf("expected cli:1, got %d", tagMap["cli"])
	}
	if tagMap["mvp"] != 2 {
		t.Errorf("expected mvp:2, got %d", tagMap["mvp"])
	}
	if _, ok := tagMap["web"]; ok {
		t.Error("expected 'web' tag to be absent after filtering to pending")
	}
}

func TestRunTags_EmptyDir(t *testing.T) {
	dir := t.TempDir()
	resetTagsFlags()
	tagsFormat = "table"

	output := captureRunTagsOutput(t, []string{dir})

	if !strings.Contains(output, "No tags found") {
		t.Error("expected 'No tags found' for empty directory")
	}
}

func TestAggregateTags_WithFiltering(t *testing.T) {
	tasks := []*model.Task{
		{ID: "001", Status: model.StatusPending, Tags: []string{"cli", "mvp"}},
		{ID: "002", Status: model.StatusCompleted, Tags: []string{"cli", "web"}},
		{ID: "003", Status: model.StatusPending, Tags: []string{"mvp", "docs"}},
	}

	// Filter to pending only, then aggregate
	filtered, err := applyFilters(tasks, []string{"status=pending"})
	if err != nil {
		t.Fatalf("filter failed: %v", err)
	}

	result := aggregateTags(filtered)

	// Should only have tags from tasks 001 and 003
	tagMap := make(map[string]int)
	for _, ti := range result {
		tagMap[ti.Tag] = ti.Count
	}

	if tagMap["cli"] != 1 {
		t.Errorf("expected cli:1 after filter, got %d", tagMap["cli"])
	}
	if tagMap["mvp"] != 2 {
		t.Errorf("expected mvp:2 after filter, got %d", tagMap["mvp"])
	}
	if tagMap["docs"] != 1 {
		t.Errorf("expected docs:1 after filter, got %d", tagMap["docs"])
	}
	if _, ok := tagMap["web"]; ok {
		t.Error("expected web tag to be absent after filtering to pending only")
	}
}
