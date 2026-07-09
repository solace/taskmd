package graph

import (
	"strings"
	"testing"
	"time"

	"github.com/driangle/taskmd/sdk/go/model"
)

func createTestTasks() []*model.Task {
	return []*model.Task{
		{
			ID:           "T1",
			Title:        "Task 1",
			Status:       model.StatusCompleted,
			Dependencies: []string{},
		},
		{
			ID:           "T2",
			Title:        "Task 2",
			Status:       model.StatusCompleted,
			Dependencies: []string{"T1"},
		},
		{
			ID:           "T3",
			Title:        "Task 3",
			Status:       model.StatusInProgress,
			Dependencies: []string{"T1", "T2"},
		},
		{
			ID:           "T4",
			Title:        "Task 4",
			Status:       model.StatusPending,
			Dependencies: []string{"T2"},
		},
		{
			ID:           "T5",
			Title:        "Task 5",
			Status:       model.StatusPending,
			Dependencies: []string{"T3", "T4"},
		},
	}
}

func TestNewGraph(t *testing.T) {
	tasks := createTestTasks()
	g := NewGraph(tasks)

	if len(g.Tasks) != 5 {
		t.Errorf("Expected 5 tasks, got %d", len(g.Tasks))
	}

	if len(g.TaskMap) != 5 {
		t.Errorf("Expected 5 tasks in map, got %d", len(g.TaskMap))
	}

	// Check adjacency (T1 blocks T2 and T3)
	if len(g.Adjacency["T1"]) != 2 {
		t.Errorf("Expected T1 to block 2 tasks, got %d", len(g.Adjacency["T1"]))
	}

	// Check reverse adjacency (T3 depends on T1 and T2)
	if len(g.RevAdjacency["T3"]) != 2 {
		t.Errorf("Expected T3 to depend on 2 tasks, got %d", len(g.RevAdjacency["T3"]))
	}
}

func TestGetDownstream(t *testing.T) {
	tasks := createTestTasks()
	g := NewGraph(tasks)

	// T1 blocks T2, T3, T4 (via T2), T5 (via T3, T4)
	downstream := g.GetDownstream("T1")

	expectedDownstream := map[string]bool{
		"T2": true,
		"T3": true,
		"T4": true,
		"T5": true,
	}

	if len(downstream) != len(expectedDownstream) {
		t.Errorf("Expected %d downstream tasks for T1, got %d", len(expectedDownstream), len(downstream))
	}

	for taskID := range expectedDownstream {
		if !downstream[taskID] {
			t.Errorf("Expected %s to be downstream of T1", taskID)
		}
	}
}

func TestGetUpstream(t *testing.T) {
	tasks := createTestTasks()
	g := NewGraph(tasks)

	// T5 depends on T3, T4, T2 (via T3, T4), T1 (via T2, T3)
	upstream := g.GetUpstream("T5")

	expectedUpstream := map[string]bool{
		"T1": true,
		"T2": true,
		"T3": true,
		"T4": true,
	}

	if len(upstream) != len(expectedUpstream) {
		t.Errorf("Expected %d upstream tasks for T5, got %d", len(expectedUpstream), len(upstream))
	}

	for taskID := range expectedUpstream {
		if !upstream[taskID] {
			t.Errorf("Expected %s to be upstream of T5", taskID)
		}
	}
}

func TestDetectCycles(t *testing.T) {
	// Create tasks with a cycle: T1 -> T2 -> T3 -> T1
	cyclicTasks := []*model.Task{
		{
			ID:           "T1",
			Title:        "Task 1",
			Dependencies: []string{"T3"},
		},
		{
			ID:           "T2",
			Title:        "Task 2",
			Dependencies: []string{"T1"},
		},
		{
			ID:           "T3",
			Title:        "Task 3",
			Dependencies: []string{"T2"},
		},
	}

	g := NewGraph(cyclicTasks)
	cycles := g.DetectCycles()

	if len(cycles) == 0 {
		t.Error("Expected to detect at least one cycle")
	}
}

func TestDetectNoCycles(t *testing.T) {
	tasks := createTestTasks()
	g := NewGraph(tasks)

	cycles := g.DetectCycles()

	if len(cycles) != 0 {
		t.Errorf("Expected no cycles, found %d", len(cycles))
	}
}

func TestFilterTasks(t *testing.T) {
	tasks := createTestTasks()
	g := NewGraph(tasks)

	// Filter to only T1 and T2
	filtered := g.FilterTasks(map[string]bool{
		"T1": true,
		"T2": true,
	})

	if len(filtered.Tasks) != 2 {
		t.Errorf("Expected 2 filtered tasks, got %d", len(filtered.Tasks))
	}

	if _, exists := filtered.TaskMap["T1"]; !exists {
		t.Error("Expected T1 in filtered graph")
	}

	if _, exists := filtered.TaskMap["T2"]; !exists {
		t.Error("Expected T2 in filtered graph")
	}

	if _, exists := filtered.TaskMap["T3"]; exists {
		t.Error("Did not expect T3 in filtered graph")
	}
}

func TestToMermaid(t *testing.T) {
	tasks := []*model.Task{
		{
			ID:           "T1",
			Title:        "Task 1",
			Status:       model.StatusCompleted,
			Dependencies: []string{},
		},
		{
			ID:           "T2",
			Title:        "Task 2",
			Status:       model.StatusPending,
			Dependencies: []string{"T1"},
		},
	}

	g := NewGraph(tasks)
	output := g.ToMermaid(RenderOptions{FocusTaskID: "T2", ShowRelated: true, ShowSpawnedBy: true})

	if !strings.Contains(output, "graph TD") {
		t.Error("Expected mermaid output to contain 'graph TD'")
	}

	if !strings.Contains(output, "T1") {
		t.Error("Expected mermaid output to contain T1")
	}

	if !strings.Contains(output, "T2") {
		t.Error("Expected mermaid output to contain T2")
	}

	if !strings.Contains(output, "T1 --> T2") {
		t.Error("Expected mermaid output to contain edge T1 --> T2")
	}

	if !strings.Contains(output, ":::focus") {
		t.Error("Expected mermaid output to highlight focus task")
	}
}

func TestToDot(t *testing.T) {
	tasks := []*model.Task{
		{
			ID:           "T1",
			Title:        "Task 1",
			Status:       model.StatusCompleted,
			Dependencies: []string{},
		},
		{
			ID:           "T2",
			Title:        "Task 2",
			Status:       model.StatusPending,
			Dependencies: []string{"T1"},
		},
	}

	g := NewGraph(tasks)
	output := g.ToDot(RenderOptions{FocusTaskID: "T2", ShowRelated: true, ShowSpawnedBy: true})

	if !strings.Contains(output, "digraph tasks") {
		t.Error("Expected DOT output to contain 'digraph tasks'")
	}

	if !strings.Contains(output, "T1") {
		t.Error("Expected DOT output to contain T1")
	}

	if !strings.Contains(output, "T2") {
		t.Error("Expected DOT output to contain T2")
	}

	if !strings.Contains(output, "T1 -> T2") {
		t.Error("Expected DOT output to contain edge T1 -> T2")
	}

	if !strings.Contains(output, "fillcolor=red") {
		t.Error("Expected DOT output to highlight focus task in red")
	}
}

func TestToASCII(t *testing.T) {
	tasks := []*model.Task{
		{
			ID:           "T1",
			Title:        "Task 1",
			Status:       model.StatusCompleted,
			Dependencies: []string{},
		},
		{
			ID:           "T2",
			Title:        "Task 2",
			Status:       model.StatusInProgress,
			Dependencies: []string{"T1"},
		},
	}

	g := NewGraph(tasks)
	output := g.ToASCII("T1", true, nil, DefaultRenderOptions())

	if !strings.Contains(output, "T1") {
		t.Error("Expected ASCII output to contain T1")
	}

	if !strings.Contains(output, "T2") {
		t.Error("Expected ASCII output to contain T2")
	}

	if !strings.Contains(output, "✓") {
		t.Error("Expected ASCII output to contain completed checkmark")
	}

	if !strings.Contains(output, "⋯") {
		t.Error("Expected ASCII output to contain in-progress indicator")
	}
}

func TestToJSON(t *testing.T) {
	tasks := []*model.Task{
		{
			ID:           "T1",
			Title:        "Task 1",
			Status:       model.StatusCompleted,
			Priority:     model.PriorityHigh,
			Dependencies: []string{},
			Created:      model.NewFlexibleTime(time.Now()),
		},
		{
			ID:           "T2",
			Title:        "Task 2",
			Status:       model.StatusPending,
			Dependencies: []string{"T1"},
			Created:      model.NewFlexibleTime(time.Now()),
		},
	}

	g := NewGraph(tasks)
	jsonOutput := g.ToJSON(DefaultRenderOptions())

	nodes, ok := jsonOutput["nodes"].([]map[string]any)
	if !ok {
		t.Fatal("Expected nodes to be a slice of maps")
	}

	if len(nodes) != 2 {
		t.Errorf("Expected 2 nodes in JSON output, got %d", len(nodes))
	}

	edges, ok := jsonOutput["edges"].([]map[string]string)
	if !ok {
		t.Fatal("Expected edges to be a slice of maps")
	}

	if len(edges) != 1 {
		t.Errorf("Expected 1 edge in JSON output, got %d", len(edges))
	}

	// Check edge structure
	if edges[0]["from"] != "T1" || edges[0]["to"] != "T2" {
		t.Error("Expected edge from T1 to T2")
	}
}

func TestToASCII_NilFormatter_PlainText(t *testing.T) {
	tasks := createTestTasks()
	g := NewGraph(tasks)

	output := g.ToASCII("T1", true, nil, DefaultRenderOptions())

	// Verify plain text output (no ANSI codes)
	if strings.Contains(output, "\033[") {
		t.Error("Expected plain text output with nil formatter, but found ANSI escape codes")
	}

	// Verify content is present
	if !strings.Contains(output, "[T1]") {
		t.Error("Expected output to contain [T1]")
	}
	if !strings.Contains(output, "Task 1") {
		t.Error("Expected output to contain 'Task 1'")
	}
	if !strings.Contains(output, "✓") {
		t.Error("Expected output to contain completed checkmark")
	}
}

func TestToASCII_WithFormatter(t *testing.T) {
	tasks := []*model.Task{
		{
			ID:           "T1",
			Title:        "Root",
			Status:       model.StatusCompleted,
			Dependencies: []string{},
		},
		{
			ID:           "T2",
			Title:        "Child",
			Status:       model.StatusInProgress,
			Dependencies: []string{"T1"},
		},
	}

	g := NewGraph(tasks)

	f := &ASCIIFormatter{
		FormatID: func(id string) string {
			return "<ID:" + id + ">"
		},
		FormatTitle: func(title, status string) string {
			return "<T:" + title + ":" + status + ">"
		},
		FormatStatusIndicator: func(indicator, _ string) string {
			return "<S:" + strings.TrimSpace(indicator) + ">"
		},
		FormatConnector: func(connector string) string {
			return "<C:" + connector + ">"
		},
		FormatReference: func(text string) string {
			return "<R:" + text + ">"
		},
	}

	output := g.ToASCII("T1", true, f, DefaultRenderOptions())

	if !strings.Contains(output, "<ID:T1>") {
		t.Errorf("Expected formatted ID for T1, got:\n%s", output)
	}
	if !strings.Contains(output, "<ID:T2>") {
		t.Errorf("Expected formatted ID for T2, got:\n%s", output)
	}
	if !strings.Contains(output, "<T:Root:completed>") {
		t.Errorf("Expected formatted title for Root, got:\n%s", output)
	}
	if !strings.Contains(output, "<T:Child:in-progress>") {
		t.Errorf("Expected formatted title for Child, got:\n%s", output)
	}
	if !strings.Contains(output, "<S:✓>") {
		t.Errorf("Expected formatted status indicator for completed, got:\n%s", output)
	}
	if !strings.Contains(output, "<S:⋯>") {
		t.Errorf("Expected formatted status indicator for in-progress, got:\n%s", output)
	}
	// Test connector formatting with multiple children.
	tasksMulti := []*model.Task{
		{ID: "A", Title: "Root", Status: model.StatusPending, Dependencies: []string{}},
		{ID: "B", Title: "Child1", Status: model.StatusPending, Dependencies: []string{"A"}},
		{ID: "C", Title: "Child2", Status: model.StatusPending, Dependencies: []string{"A"}},
	}
	gMulti := NewGraph(tasksMulti)
	outputMulti := gMulti.ToASCII("A", true, f, DefaultRenderOptions())

	if !strings.Contains(outputMulti, "<C:├── >") {
		t.Errorf("Expected formatted ├── connector, got:\n%s", outputMulti)
	}
	if !strings.Contains(outputMulti, "<C:└── >") {
		t.Errorf("Expected formatted └── connector, got:\n%s", outputMulti)
	}
}

func TestToASCII_SingleChildChain_ShowsIndentation(t *testing.T) {
	// A linear chain A → B → C should render with tree connectors,
	// not as flat root-level nodes.
	tasks := []*model.Task{
		{ID: "A", Title: "Root", Status: model.StatusPending, Dependencies: []string{}},
		{ID: "B", Title: "Middle", Status: model.StatusPending, Dependencies: []string{"A"}},
		{ID: "C", Title: "Leaf", Status: model.StatusPending, Dependencies: []string{"B"}},
	}

	g := NewGraph(tasks)

	// Without a specified root — auto-detected roots
	output := g.ToASCII("", true, nil, DefaultRenderOptions())

	// B should be indented under A with a tree connector
	if !strings.Contains(output, "└── [B]") {
		t.Errorf("Expected B to be indented under A with └── connector, got:\n%s", output)
	}

	// C should be indented under B with a tree connector
	if !strings.Contains(output, "└── [C]") {
		t.Errorf("Expected C to be indented under B with └── connector, got:\n%s", output)
	}

	// With a specified root
	outputRooted := g.ToASCII("A", true, nil, DefaultRenderOptions())

	if !strings.Contains(outputRooted, "└── [B]") {
		t.Errorf("Expected B to be indented under A with └── connector (rooted), got:\n%s", outputRooted)
	}

	if !strings.Contains(outputRooted, "└── [C]") {
		t.Errorf("Expected C to be indented under B with └── connector (rooted), got:\n%s", outputRooted)
	}
}

func TestToASCII_WithFormatter_Reference(t *testing.T) {
	// Create a graph with a diamond shape so a node is visited twice
	tasks := []*model.Task{
		{
			ID:           "T1",
			Title:        "Root",
			Status:       model.StatusPending,
			Dependencies: []string{},
		},
		{
			ID:           "T2",
			Title:        "Left",
			Status:       model.StatusPending,
			Dependencies: []string{"T1"},
		},
		{
			ID:           "T3",
			Title:        "Right",
			Status:       model.StatusPending,
			Dependencies: []string{"T1"},
		},
		{
			ID:           "T4",
			Title:        "Bottom",
			Status:       model.StatusPending,
			Dependencies: []string{"T2", "T3"},
		},
	}

	g := NewGraph(tasks)

	f := &ASCIIFormatter{
		FormatReference: func(text string) string {
			return "<REF:" + text + ">"
		},
	}

	output := g.ToASCII("T1", true, f, DefaultRenderOptions())

	// T4 appears under both T2 and T3, so the second occurrence should have "(see above)"
	if !strings.Contains(output, "<REF:(see above)>") {
		t.Errorf("Expected formatted reference text, got:\n%s", output)
	}
}

func TestNewGraph_RelatedEdges(t *testing.T) {
	tasks := []*model.Task{
		{ID: "A", Title: "Task A", Related: []string{"B", "C"}},
		{ID: "B", Title: "Task B", Related: []string{"A"}},
		{ID: "C", Title: "Task C"},
		{ID: "D", Title: "Task D", Related: []string{"A"}},
	}
	g := NewGraph(tasks)

	// A-B is bidirectionally declared — should appear once
	// A-C is unidirectional — should appear once
	// A-D is unidirectionally declared by D — should appear once
	if len(g.RelatedEdges) != 3 {
		t.Errorf("expected 3 deduplicated related edges, got %d: %v", len(g.RelatedEdges), g.RelatedEdges)
	}

	// RelatedMap should be bidirectional
	if len(g.RelatedMap["A"]) != 3 {
		t.Errorf("expected A to have 3 related tasks, got %d: %v", len(g.RelatedMap["A"]), g.RelatedMap["A"])
	}
	if len(g.RelatedMap["B"]) != 1 {
		t.Errorf("expected B to have 1 related task, got %d: %v", len(g.RelatedMap["B"]), g.RelatedMap["B"])
	}
}

func TestNewGraph_RelatedEdges_IgnoresMissingTasks(t *testing.T) {
	tasks := []*model.Task{
		{ID: "A", Title: "Task A", Related: []string{"B", "MISSING"}},
		{ID: "B", Title: "Task B"},
	}
	g := NewGraph(tasks)

	if len(g.RelatedEdges) != 1 {
		t.Errorf("expected 1 related edge (ignoring missing ref), got %d", len(g.RelatedEdges))
	}
}

func TestToMermaid_RelatedEdges(t *testing.T) {
	tasks := []*model.Task{
		{ID: "A", Title: "Task A", Related: []string{"B"}},
		{ID: "B", Title: "Task B"},
	}
	g := NewGraph(tasks)
	output := g.ToMermaid(DefaultRenderOptions())

	if !strings.Contains(output, "A -.- B") {
		t.Errorf("expected dashed undirected edge 'A -.- B' in mermaid output, got:\n%s", output)
	}
}

func TestToDot_RelatedEdges(t *testing.T) {
	tasks := []*model.Task{
		{ID: "A", Title: "Task A", Related: []string{"B"}},
		{ID: "B", Title: "Task B"},
	}
	g := NewGraph(tasks)
	output := g.ToDot(DefaultRenderOptions())

	if !strings.Contains(output, "style=dashed") {
		t.Errorf("expected dashed style in dot output, got:\n%s", output)
	}
	if !strings.Contains(output, "dir=none") {
		t.Errorf("expected dir=none in dot output, got:\n%s", output)
	}
}

func TestToASCII_RelatedAnnotation(t *testing.T) {
	tasks := []*model.Task{
		{ID: "A", Title: "Root", Related: []string{"B"}},
		{ID: "B", Title: "Other"},
	}
	g := NewGraph(tasks)
	output := g.ToASCII("", true, nil, DefaultRenderOptions())

	if !strings.Contains(output, "~ B") {
		t.Errorf("expected '~ B' related annotation in ASCII output, got:\n%s", output)
	}
}

func TestToJSON_RelatedEdges(t *testing.T) {
	tasks := []*model.Task{
		{ID: "A", Title: "Task A", Related: []string{"B"}},
		{ID: "B", Title: "Task B"},
	}
	g := NewGraph(tasks)
	result := g.ToJSON(DefaultRenderOptions())

	relatedEdges, ok := result["relatedEdges"].([]map[string]string)
	if !ok {
		t.Fatalf("expected relatedEdges to be []map[string]string, got %T", result["relatedEdges"])
	}
	if len(relatedEdges) != 1 {
		t.Fatalf("expected 1 related edge, got %d", len(relatedEdges))
	}
	if relatedEdges[0]["a"] != "A" || relatedEdges[0]["b"] != "B" {
		t.Errorf("unexpected related edge: %v", relatedEdges[0])
	}
}

// depthChain builds a linear chain: n0 -> n1 -> n2 -> n3
func depthChain() *Graph {
	return NewGraph([]*model.Task{
		{ID: "n0", Dependencies: []string{}},
		{ID: "n1", Dependencies: []string{"n0"}},
		{ID: "n2", Dependencies: []string{"n1"}},
		{ID: "n3", Dependencies: []string{"n2"}},
	})
}

func TestGetDownstreamN_Depth1(t *testing.T) {
	g := depthChain()
	got := g.GetDownstreamN("n0", 1)
	if len(got) != 1 || !got["n1"] {
		t.Errorf("expected {n1}, got %v", got)
	}
}

func TestGetDownstreamN_Depth2(t *testing.T) {
	g := depthChain()
	got := g.GetDownstreamN("n0", 2)
	if len(got) != 2 || !got["n1"] || !got["n2"] {
		t.Errorf("expected {n1, n2}, got %v", got)
	}
}

func TestGetDownstreamN_DepthExceedsChain(t *testing.T) {
	g := depthChain()
	got := g.GetDownstreamN("n0", 100)
	if len(got) != 3 {
		t.Errorf("expected all 3 descendants, got %v", got)
	}
}

func TestGetDownstreamN_Depth0_IsUnlimited(t *testing.T) {
	g := depthChain()
	unlimited := g.GetDownstream("n0")
	byN := g.GetDownstreamN("n0", 0)
	if len(byN) != len(unlimited) {
		t.Errorf("depth 0 should equal unlimited: got %v vs %v", byN, unlimited)
	}
}

func TestGetUpstreamN_Depth1(t *testing.T) {
	g := depthChain()
	got := g.GetUpstreamN("n3", 1)
	if len(got) != 1 || !got["n2"] {
		t.Errorf("expected {n2}, got %v", got)
	}
}

func TestGetUpstreamN_Depth2(t *testing.T) {
	g := depthChain()
	got := g.GetUpstreamN("n3", 2)
	if len(got) != 2 || !got["n2"] || !got["n1"] {
		t.Errorf("expected {n2, n1}, got %v", got)
	}
}

func TestGetUpstreamN_Depth0_IsUnlimited(t *testing.T) {
	g := depthChain()
	unlimited := g.GetUpstream("n3")
	byN := g.GetUpstreamN("n3", 0)
	if len(byN) != len(unlimited) {
		t.Errorf("depth 0 should equal unlimited: got %v vs %v", byN, unlimited)
	}
}
