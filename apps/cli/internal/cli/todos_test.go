package cli

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/driangle/taskmd/apps/cli/internal/todos"
)

func resetTodosFlags() {
	todosDir = "."
	todosMarkers = nil
	todosInclude = nil
	todosExclude = nil
	todosFormat = "table"
	noColor = true
}

func createTodosTestDir(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()

	writeTodosTestFile(t, filepath.Join(dir, "main.go"), `package main

// TODO: implement main logic
func main() {}

// FIXME: handle error case
func process() error { return nil }
`)

	writeTodosTestFile(t, filepath.Join(dir, "app.py"), `# HACK: workaround for upstream bug
import os
`)

	writeTodosTestFile(t, filepath.Join(dir, "style.css"), `/* NOTE: using hardcoded values */
.container { width: 100%; }
`)

	return dir
}

func writeTodosTestFile(t *testing.T, path, content string) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
}

func captureTodosTableOutput(t *testing.T, items []todos.TodoItem) string {
	t.Helper()

	oldStdout := os.Stdout
	oldStderr := os.Stderr
	r, w, _ := os.Pipe()
	rErr, wErr, _ := os.Pipe()
	os.Stdout = w
	os.Stderr = wErr

	err := outputTodosTable(items)
	if err != nil {
		w.Close()
		wErr.Close()
		os.Stdout = oldStdout
		os.Stderr = oldStderr
		t.Fatalf("outputTodosTable failed: %v", err)
	}

	w.Close()
	wErr.Close()
	os.Stdout = oldStdout
	os.Stderr = oldStderr

	var buf bytes.Buffer
	buf.ReadFrom(r)
	// drain stderr too
	var stderrBuf bytes.Buffer
	stderrBuf.ReadFrom(rErr)
	return buf.String()
}

func TestTodosList_TableOutput(t *testing.T) {
	resetTodosFlags()
	dir := createTodosTestDir(t)
	todosDir = dir

	// Scan and capture output
	items, err := todos.Scan(todos.ScanOptions{Dir: dir})
	if err != nil {
		t.Fatal(err)
	}

	output := captureTodosTableOutput(t, items)

	if !strings.Contains(output, "FILE") || !strings.Contains(output, "LINE") {
		t.Error("expected header with FILE and LINE")
	}
	if !strings.Contains(output, "MARKER") || !strings.Contains(output, "TEXT") {
		t.Error("expected header with MARKER and TEXT")
	}
	if !strings.Contains(output, "TODO") {
		t.Error("expected TODO marker in output")
	}
	if !strings.Contains(output, "FIXME") {
		t.Error("expected FIXME marker in output")
	}
}

func TestTodosList_TableOutputEmpty(t *testing.T) {
	resetTodosFlags()

	output := captureTodosTableOutput(t, nil)
	if !strings.Contains(output, "No TODO comments found") {
		t.Error("expected 'No TODO comments found' message")
	}
}

func TestTodosList_JSONOutput(t *testing.T) {
	resetTodosFlags()
	dir := createTodosTestDir(t)

	items, err := todos.Scan(todos.ScanOptions{Dir: dir})
	if err != nil {
		t.Fatal(err)
	}

	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err = WriteJSON(os.Stdout, items)
	w.Close()
	os.Stdout = oldStdout

	if err != nil {
		t.Fatalf("WriteJSON failed: %v", err)
	}

	var buf bytes.Buffer
	buf.ReadFrom(r)

	var parsed []todos.TodoItem
	if err := json.Unmarshal(buf.Bytes(), &parsed); err != nil {
		t.Fatalf("failed to parse JSON: %v\noutput: %s", err, buf.String())
	}

	if len(parsed) == 0 {
		t.Fatal("expected items in JSON output")
	}

	// Verify fields are present
	for _, item := range parsed {
		if item.FilePath == "" {
			t.Error("expected non-empty file path")
		}
		if item.Line == 0 {
			t.Error("expected non-zero line number")
		}
		if item.Marker == "" {
			t.Error("expected non-empty marker")
		}
	}
}

func TestTodosList_YAMLOutput(t *testing.T) {
	resetTodosFlags()
	dir := createTodosTestDir(t)

	items, err := todos.Scan(todos.ScanOptions{Dir: dir})
	if err != nil {
		t.Fatal(err)
	}

	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err = WriteYAML(os.Stdout, items)
	w.Close()
	os.Stdout = oldStdout

	if err != nil {
		t.Fatalf("WriteYAML failed: %v", err)
	}

	var buf bytes.Buffer
	buf.ReadFrom(r)
	output := buf.String()

	if !strings.Contains(output, "file:") || !strings.Contains(output, "line:") {
		t.Error("expected YAML with file and line fields")
	}
	if !strings.Contains(output, "marker:") || !strings.Contains(output, "text:") {
		t.Error("expected YAML with marker and text fields")
	}
}

func TestTodosList_MarkerFilter(t *testing.T) {
	resetTodosFlags()
	dir := createTodosTestDir(t)

	items, err := todos.Scan(todos.ScanOptions{
		Dir:     dir,
		Markers: []string{"TODO"},
	})
	if err != nil {
		t.Fatal(err)
	}

	for _, item := range items {
		if item.Marker != "TODO" {
			t.Errorf("expected only TODO markers, got %s", item.Marker)
		}
	}
}

func TestTodosList_InvalidMarker(t *testing.T) {
	resetTodosFlags()

	err := validateMarkers([]string{"INVALID"})
	if err == nil {
		t.Fatal("expected error for invalid marker")
	}

	if !strings.Contains(err.Error(), "invalid marker") {
		t.Errorf("expected 'invalid marker' in error, got: %s", err.Error())
	}
}

func TestTodosList_ValidMarkers(t *testing.T) {
	resetTodosFlags()

	err := validateMarkers(todos.DefaultMarkers)
	if err != nil {
		t.Fatalf("expected no error for valid markers, got: %v", err)
	}
}

func TestTodosList_RunCommand(t *testing.T) {
	resetTodosFlags()
	dir := createTodosTestDir(t)
	todosDir = dir
	todosFormat = "json"

	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runTodosList(nil, nil)
	w.Close()
	os.Stdout = oldStdout

	if err != nil {
		t.Fatalf("runTodosList failed: %v", err)
	}

	var buf bytes.Buffer
	buf.ReadFrom(r)

	var parsed []todos.TodoItem
	if err := json.Unmarshal(buf.Bytes(), &parsed); err != nil {
		t.Fatalf("failed to parse JSON: %v", err)
	}

	if len(parsed) == 0 {
		t.Fatal("expected items from runTodosList")
	}
}

func TestTodosList_EmptyDirectory(t *testing.T) {
	resetTodosFlags()
	dir := t.TempDir()
	todosDir = dir
	todosFormat = "json"

	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runTodosList(nil, nil)
	w.Close()
	os.Stdout = oldStdout

	if err != nil {
		t.Fatalf("runTodosList failed: %v", err)
	}

	var buf bytes.Buffer
	buf.ReadFrom(r)

	var parsed []todos.TodoItem
	if err := json.Unmarshal(buf.Bytes(), &parsed); err != nil {
		t.Fatalf("failed to parse JSON: %v", err)
	}

	if len(parsed) != 0 {
		t.Fatalf("expected 0 items for empty dir, got %d", len(parsed))
	}
}

func TestTodosList_InvalidFormat(t *testing.T) {
	resetTodosFlags()
	todosDir = t.TempDir()
	todosFormat = "xml"

	err := runTodosList(nil, nil)
	if err == nil {
		t.Fatal("expected error for invalid format")
	}
	if !strings.Contains(err.Error(), "unsupported format") {
		t.Errorf("expected 'unsupported format' error, got: %s", err.Error())
	}
}
