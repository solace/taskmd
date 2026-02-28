package cli

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func createCurrentTestFiles(t *testing.T, tasks map[string]string) string {
	t.Helper()
	tmpDir := t.TempDir()
	for name, content := range tasks {
		err := os.WriteFile(filepath.Join(tmpDir, name), []byte(content), 0644)
		if err != nil {
			t.Fatalf("failed to write %s: %v", name, err)
		}
	}
	return tmpDir
}

func captureCurrentOutput(t *testing.T, args []string) (string, error) {
	t.Helper()

	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	err := runCurrent(currentCmd, args)

	w.Close()
	os.Stdout = oldStdout

	var buf bytes.Buffer
	buf.ReadFrom(r)
	return buf.String(), err
}

func TestCurrent_InProgressTask(t *testing.T) {
	tmpDir := createCurrentTestFiles(t, map[string]string{
		"001.md": `---
id: "001"
title: "Setup infrastructure"
status: completed
priority: high
created: 2026-02-01
---`,
		"002.md": `---
id: "002"
title: "Build the feature"
status: in-progress
priority: medium
created: 2026-02-02
---`,
	})

	output, err := captureCurrentOutput(t, []string{tmpDir})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expected := "#002 Build the feature\n"
	if output != expected {
		t.Errorf("expected %q, got: %q", expected, output)
	}
}

func TestCurrent_NoInProgressTask(t *testing.T) {
	tmpDir := createCurrentTestFiles(t, map[string]string{
		"001.md": `---
id: "001"
title: "Setup infrastructure"
status: completed
priority: high
created: 2026-02-01
---`,
		"002.md": `---
id: "002"
title: "Pending task"
status: pending
priority: medium
created: 2026-02-02
---`,
	})

	output, err := captureCurrentOutput(t, []string{tmpDir})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if output != "" {
		t.Errorf("expected empty output, got: %q", output)
	}
}

func TestCurrent_LongTitleTruncation(t *testing.T) {
	longTitle := "This is a very long task title that exceeds thirty characters"
	tmpDir := createCurrentTestFiles(t, map[string]string{
		"001.md": `---
id: "001"
title: "` + longTitle + `"
status: in-progress
priority: medium
created: 2026-02-01
---`,
	})

	output, err := captureCurrentOutput(t, []string{tmpDir})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	output = strings.TrimSpace(output)
	expected := "#001 " + longTitle[:maxTitleLen] + "..."
	if output != expected {
		t.Errorf("expected %q, got: %q", expected, output)
	}
}
