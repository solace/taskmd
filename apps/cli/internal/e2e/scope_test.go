//go:build e2e

package e2e

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestListScope(t *testing.T) {
	dir := setupTaskDir(t)

	writeTaskWithTouches(t, dir, "001-web.md", "001", "Web feature", "pending", "high", []string{"web", "api"})
	writeTaskWithTouches(t, dir, "002-cli.md", "002", "CLI feature", "pending", "medium", []string{"cli"})
	writeTaskWithTouches(t, dir, "003-web.md", "003", "Web styling", "pending", "low", []string{"web"})
	writeTask(t, dir, "004-noscope.md", "004", "No scope task", "pending", nil)

	t.Run("scope filters to matching tasks", func(t *testing.T) {
		result := mustRun(t, dir, "list", "--scope", "web", "--format", "json")

		var tasks []struct {
			ID string `json:"id"`
		}
		if err := json.Unmarshal([]byte(result.Stdout), &tasks); err != nil {
			t.Fatalf("Failed to parse JSON: %v\nOutput: %s", err, result.Stdout)
		}

		if len(tasks) != 2 {
			t.Fatalf("Expected 2 tasks for scope 'web', got %d", len(tasks))
		}

		ids := map[string]bool{}
		for _, task := range tasks {
			ids[task.ID] = true
		}
		if !ids["001"] || !ids["003"] {
			t.Errorf("Expected tasks 001 and 003, got %v", ids)
		}
	})

	t.Run("scope with wildcard", func(t *testing.T) {
		result := mustRun(t, dir, "list", "--scope", "w*", "--format", "json")

		var tasks []struct {
			ID string `json:"id"`
		}
		if err := json.Unmarshal([]byte(result.Stdout), &tasks); err != nil {
			t.Fatalf("Failed to parse JSON: %v", err)
		}

		if len(tasks) != 2 {
			t.Fatalf("Expected 2 tasks for scope 'w*', got %d", len(tasks))
		}
	})

	t.Run("scope with no matches shows empty", func(t *testing.T) {
		result := mustRun(t, dir, "list", "--scope", "nonexistent")

		if !strings.Contains(result.Stdout, "No tasks found") {
			t.Errorf("Expected 'No tasks found', got: %s", result.Stdout)
		}
	})

	t.Run("scope combined with filter", func(t *testing.T) {
		result := mustRun(t, dir, "list", "--scope", "web", "--filter", "priority=high", "--format", "json")

		var tasks []struct {
			ID string `json:"id"`
		}
		if err := json.Unmarshal([]byte(result.Stdout), &tasks); err != nil {
			t.Fatalf("Failed to parse JSON: %v", err)
		}

		if len(tasks) != 1 {
			t.Fatalf("Expected 1 task (web + high), got %d", len(tasks))
		}
		if tasks[0].ID != "001" {
			t.Errorf("Expected task 001, got %s", tasks[0].ID)
		}
	})
}

func TestGraphScope(t *testing.T) {
	dir := setupTaskDir(t)

	writeTaskWithTouches(t, dir, "001-web.md", "001", "Web feature", "pending", "high", []string{"web", "api"})
	writeTaskWithTouches(t, dir, "002-cli.md", "002", "CLI feature", "pending", "medium", []string{"cli"})
	writeTaskWithTouches(t, dir, "003-web.md", "003", "Web styling", "pending", "low", []string{"web"})
	writeTask(t, dir, "004-noscope.md", "004", "No scope task", "pending", nil)

	t.Run("scope filters graph nodes", func(t *testing.T) {
		result := mustRun(t, dir, "graph", "--scope", "web", "--format", "json", "--all")

		var graph struct {
			Nodes []struct {
				ID string `json:"id"`
			} `json:"nodes"`
		}
		if err := json.Unmarshal([]byte(result.Stdout), &graph); err != nil {
			t.Fatalf("Failed to parse JSON: %v\nOutput: %s", err, result.Stdout)
		}

		if len(graph.Nodes) != 2 {
			t.Fatalf("Expected 2 nodes for scope 'web', got %d", len(graph.Nodes))
		}

		ids := map[string]bool{}
		for _, node := range graph.Nodes {
			ids[node.ID] = true
		}
		if !ids["001"] || !ids["003"] {
			t.Errorf("Expected nodes 001 and 003, got %v", ids)
		}
	})

	t.Run("scope with wildcard", func(t *testing.T) {
		result := mustRun(t, dir, "graph", "--scope", "c*", "--format", "json", "--all")

		var graph struct {
			Nodes []struct {
				ID string `json:"id"`
			} `json:"nodes"`
		}
		if err := json.Unmarshal([]byte(result.Stdout), &graph); err != nil {
			t.Fatalf("Failed to parse JSON: %v", err)
		}

		if len(graph.Nodes) != 1 {
			t.Fatalf("Expected 1 node for scope 'c*', got %d", len(graph.Nodes))
		}
		if graph.Nodes[0].ID != "002" {
			t.Errorf("Expected node 002, got %s", graph.Nodes[0].ID)
		}
	})

	t.Run("scope in ascii format", func(t *testing.T) {
		result := mustRun(t, dir, "graph", "--scope", "cli", "--all")

		if !strings.Contains(result.Stdout, "002") {
			t.Error("Expected task 002 in ASCII output")
		}
		if strings.Contains(result.Stdout, "[001]") {
			t.Error("Task 001 should not appear (does not touch cli)")
		}
	})
}
