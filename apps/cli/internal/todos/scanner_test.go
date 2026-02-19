package todos

import (
	"os"
	"path/filepath"
	"testing"
)

func TestScan_BasicDirectory(t *testing.T) {
	dir := t.TempDir()

	writeFile(t, dir, "main.go", `package main
// TODO: implement main
func main() {}
`)
	writeFile(t, dir, "app.py", `# FIXME: broken import
import os
`)
	writeFile(t, dir, "style.css", `/* HACK: z-index workaround */
.modal { z-index: 9999; }
`)

	items, err := Scan(ScanOptions{Dir: dir})
	if err != nil {
		t.Fatal(err)
	}

	if len(items) != 3 {
		t.Fatalf("expected 3 items, got %d", len(items))
	}
}

func TestScan_SkipsNodeModules(t *testing.T) {
	dir := t.TempDir()

	writeFile(t, dir, "main.go", `package main
// TODO: real todo
`)
	mkdirAll(t, dir, "node_modules")
	writeFile(t, dir, "node_modules/lib.js", `// TODO: should be skipped
`)

	items, err := Scan(ScanOptions{Dir: dir})
	if err != nil {
		t.Fatal(err)
	}

	if len(items) != 1 {
		t.Fatalf("expected 1 item (node_modules skipped), got %d", len(items))
	}
	if items[0].FilePath != "main.go" {
		t.Errorf("expected file main.go, got %s", items[0].FilePath)
	}
}

func TestScan_SkipsHiddenDirs(t *testing.T) {
	dir := t.TempDir()

	writeFile(t, dir, "main.go", `package main
// TODO: visible
`)
	mkdirAll(t, dir, ".hidden")
	writeFile(t, dir, ".hidden/secret.go", `package secret
// TODO: invisible
`)

	items, err := Scan(ScanOptions{Dir: dir})
	if err != nil {
		t.Fatal(err)
	}

	if len(items) != 1 {
		t.Fatalf("expected 1 item (hidden dir skipped), got %d", len(items))
	}
}

func TestScan_IncludeGlob(t *testing.T) {
	dir := t.TempDir()

	writeFile(t, dir, "main.go", `package main
// TODO: in go file
`)
	writeFile(t, dir, "app.py", `# TODO: in python file
`)

	items, err := Scan(ScanOptions{
		Dir:          dir,
		IncludeGlobs: []string{"*.go"},
	})
	if err != nil {
		t.Fatal(err)
	}

	if len(items) != 1 {
		t.Fatalf("expected 1 item (only .go), got %d", len(items))
	}
	if items[0].FilePath != "main.go" {
		t.Errorf("expected file main.go, got %s", items[0].FilePath)
	}
}

func TestScan_ExcludeGlob(t *testing.T) {
	dir := t.TempDir()

	writeFile(t, dir, "main.go", `package main
// TODO: keep this
`)
	writeFile(t, dir, "main_test.go", `package main
// TODO: exclude this
`)

	items, err := Scan(ScanOptions{
		Dir:          dir,
		ExcludeGlobs: []string{"*_test.go"},
	})
	if err != nil {
		t.Fatal(err)
	}

	if len(items) != 1 {
		t.Fatalf("expected 1 item (test excluded), got %d", len(items))
	}
	if items[0].FilePath != "main.go" {
		t.Errorf("expected file main.go, got %s", items[0].FilePath)
	}
}

func TestScan_UnsupportedExtensionSkipped(t *testing.T) {
	dir := t.TempDir()

	writeFile(t, dir, "main.go", `package main
// TODO: real todo
`)
	writeFile(t, dir, "data.txt", `TODO: not in a supported file
`)
	writeFile(t, dir, "image.png", "\x89PNG\r\n\x1a\nTODO: not text\n")

	items, err := Scan(ScanOptions{Dir: dir})
	if err != nil {
		t.Fatal(err)
	}

	if len(items) != 1 {
		t.Fatalf("expected 1 item (unsupported skipped), got %d", len(items))
	}
}

func TestScan_EmptyDirectory(t *testing.T) {
	dir := t.TempDir()

	items, err := Scan(ScanOptions{Dir: dir})
	if err != nil {
		t.Fatal(err)
	}

	if len(items) != 0 {
		t.Fatalf("expected 0 items, got %d", len(items))
	}
}

func TestScan_MarkerFilter(t *testing.T) {
	dir := t.TempDir()

	writeFile(t, dir, "main.go", `package main
// TODO: first
// FIXME: second
// HACK: third
`)

	items, err := Scan(ScanOptions{
		Dir:     dir,
		Markers: []string{"TODO"},
	})
	if err != nil {
		t.Fatal(err)
	}

	if len(items) != 1 {
		t.Fatalf("expected 1 item (marker filter), got %d", len(items))
	}
	if items[0].Marker != "TODO" {
		t.Errorf("expected marker TODO, got %s", items[0].Marker)
	}
}

func TestScan_MixedLanguages(t *testing.T) {
	dir := t.TempDir()

	writeFile(t, dir, "main.go", `package main
// TODO: go todo
`)
	writeFile(t, dir, "app.js", `// FIXME: js fixme
const x = 1;
`)
	writeFile(t, dir, "script.sh", `#!/bin/bash
# NOTE: shell note
`)
	writeFile(t, dir, "config.yaml", `# BUG: yaml bug
name: test
`)

	items, err := Scan(ScanOptions{Dir: dir})
	if err != nil {
		t.Fatal(err)
	}

	if len(items) != 4 {
		t.Fatalf("expected 4 items across languages, got %d", len(items))
	}
}

func TestScan_RelativePaths(t *testing.T) {
	dir := t.TempDir()
	mkdirAll(t, dir, "sub")

	writeFile(t, dir, "sub/deep.go", `package sub
// TODO: deep file
`)

	items, err := Scan(ScanOptions{Dir: dir})
	if err != nil {
		t.Fatal(err)
	}

	if len(items) != 1 {
		t.Fatalf("expected 1 item, got %d", len(items))
	}
	expected := filepath.Join("sub", "deep.go")
	if items[0].FilePath != expected {
		t.Errorf("expected relative path %q, got %q", expected, items[0].FilePath)
	}
}

func writeFile(t *testing.T, dir, name, content string) {
	t.Helper()
	path := filepath.Join(dir, name)
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
}

func mkdirAll(t *testing.T, dir, name string) {
	t.Helper()
	if err := os.MkdirAll(filepath.Join(dir, name), 0o755); err != nil {
		t.Fatal(err)
	}
}
