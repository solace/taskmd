package graph

import (
	"fmt"
	"sort"
	"strings"

	"github.com/driangle/taskmd/sdk/go/model"
)

// ASCIIFormatter provides optional formatting callbacks for ASCII tree output.
// When nil or when a field is nil, the corresponding text is returned unmodified.
type ASCIIFormatter struct {
	FormatID              func(id string) string
	FormatTitle           func(title, status string) string
	FormatStatusIndicator func(indicator, status string) string
	FormatConnector       func(connector string) string
	FormatReference       func(text string) string
}

func (f *ASCIIFormatter) applyID(id string) string {
	if f != nil && f.FormatID != nil {
		return f.FormatID(id)
	}
	return id
}

func (f *ASCIIFormatter) applyTitle(title, status string) string {
	if f != nil && f.FormatTitle != nil {
		return f.FormatTitle(title, status)
	}
	return title
}

func (f *ASCIIFormatter) applyStatusIndicator(indicator, status string) string {
	if f != nil && f.FormatStatusIndicator != nil {
		return f.FormatStatusIndicator(indicator, status)
	}
	return indicator
}

func (f *ASCIIFormatter) applyConnector(connector string) string {
	if f != nil && f.FormatConnector != nil {
		return f.FormatConnector(connector)
	}
	return connector
}

func (f *ASCIIFormatter) applyReference(text string) string {
	if f != nil && f.FormatReference != nil {
		return f.FormatReference(text)
	}
	return text
}

// RenderOptions controls which edges and structural features are included in graph output.
// Use DefaultRenderOptions() to get current-behaviour defaults.
type RenderOptions struct {
	FocusTaskID   string
	ShowRelated   bool
	ShowSpawnedBy bool
	ShowParent    bool
	Subgraphs     bool
}

// DefaultRenderOptions returns options that reproduce the existing output exactly.
func DefaultRenderOptions() RenderOptions {
	return RenderOptions{ShowRelated: true, ShowSpawnedBy: true}
}

// Graph represents a task dependency graph
type Graph struct {
	Tasks        []*model.Task
	TaskMap      map[string]*model.Task
	Adjacency    map[string][]string // task ID -> list of dependent task IDs
	RevAdjacency map[string][]string // task ID -> list of dependency task IDs
	// RelatedEdges holds deduplicated undirected related pairs. Each pair [a,b] has a <= b lexicographically.
	RelatedEdges [][2]string
	// RelatedMap holds all related task IDs for a given task ID (both directions).
	RelatedMap map[string][]string
	// SpawnedByEdges holds directed provenance edges: [child, source] meaning child was spawned by source.
	SpawnedByEdges [][2]string
	// ParentEdges holds directed parent→child pairs where both tasks exist in the graph: [child, parent].
	ParentEdges [][2]string
}

// NewGraph creates a new graph from a list of tasks
func NewGraph(tasks []*model.Task) *Graph {
	g := &Graph{
		Tasks:        tasks,
		TaskMap:      make(map[string]*model.Task),
		Adjacency:    make(map[string][]string),
		RevAdjacency: make(map[string][]string),
		RelatedMap:   make(map[string][]string),
	}

	// Build task map
	for _, task := range tasks {
		g.TaskMap[task.ID] = task
	}

	// Build adjacency lists
	for _, task := range tasks {
		for _, depID := range task.Dependencies {
			// task depends on depID
			// so depID -> task in forward adjacency (depID blocks task)
			g.Adjacency[depID] = append(g.Adjacency[depID], task.ID)
			// task -> depID in reverse adjacency
			g.RevAdjacency[task.ID] = append(g.RevAdjacency[task.ID], depID)
		}
	}

	// Build related edges (deduplicated undirected pairs, only between tasks in this graph)
	relatedSet := make(map[string]bool)
	relatedMapSet := make(map[string]map[string]bool)
	for _, task := range tasks {
		for _, relID := range task.Related {
			if _, exists := g.TaskMap[relID]; !exists {
				continue // skip references to tasks not in this (possibly filtered) graph
			}
			// Canonical edge key: lower ID first
			a, b := task.ID, relID
			if a > b {
				a, b = b, a
			}
			edgeKey := a + ":" + b
			if !relatedSet[edgeKey] {
				relatedSet[edgeKey] = true
				g.RelatedEdges = append(g.RelatedEdges, [2]string{a, b})
			}
			// Build bidirectional lookup
			if relatedMapSet[task.ID] == nil {
				relatedMapSet[task.ID] = make(map[string]bool)
			}
			if relatedMapSet[relID] == nil {
				relatedMapSet[relID] = make(map[string]bool)
			}
			relatedMapSet[task.ID][relID] = true
			relatedMapSet[relID][task.ID] = true
		}
	}
	for id, relSet := range relatedMapSet {
		for relID := range relSet {
			g.RelatedMap[id] = append(g.RelatedMap[id], relID)
		}
		sort.Strings(g.RelatedMap[id])
	}
	sort.Slice(g.RelatedEdges, func(i, j int) bool {
		if g.RelatedEdges[i][0] != g.RelatedEdges[j][0] {
			return g.RelatedEdges[i][0] < g.RelatedEdges[j][0]
		}
		return g.RelatedEdges[i][1] < g.RelatedEdges[j][1]
	})

	// Build spawned_by edges (directed: child -> source)
	spawnedSet := make(map[string]bool)
	for _, task := range tasks {
		if task.SpawnedBy == "" {
			continue
		}
		if _, exists := g.TaskMap[task.SpawnedBy]; !exists {
			continue // skip references to tasks not in this graph
		}
		edgeKey := task.ID + ":" + task.SpawnedBy
		if !spawnedSet[edgeKey] {
			spawnedSet[edgeKey] = true
			g.SpawnedByEdges = append(g.SpawnedByEdges, [2]string{task.ID, task.SpawnedBy})
		}
	}
	sort.Slice(g.SpawnedByEdges, func(i, j int) bool {
		return g.SpawnedByEdges[i][0] < g.SpawnedByEdges[j][0]
	})

	// Build parent edges (directed: child -> parent, only when parent exists in graph)
	for _, task := range tasks {
		if task.Parent == "" {
			continue
		}
		if _, exists := g.TaskMap[task.Parent]; !exists {
			continue
		}
		g.ParentEdges = append(g.ParentEdges, [2]string{task.ID, task.Parent})
	}
	sort.Slice(g.ParentEdges, func(i, j int) bool {
		return g.ParentEdges[i][0] < g.ParentEdges[j][0]
	})

	return g
}

// GetDownstreamN returns tasks that depend on the given task up to depth hops.
// depth <= 0 means unlimited (delegates to GetDownstream).
func (g *Graph) GetDownstreamN(taskID string, depth int) map[string]bool {
	if depth <= 0 {
		return g.GetDownstream(taskID)
	}
	visited := make(map[string]bool)
	var visit func(id string, remaining int)
	visit = func(id string, remaining int) {
		if visited[id] {
			return
		}
		visited[id] = true
		if remaining == 0 {
			return
		}
		for _, dep := range g.Adjacency[id] {
			visit(dep, remaining-1)
		}
	}
	visit(taskID, depth)
	delete(visited, taskID)
	return visited
}

// GetUpstreamN returns tasks the given task depends on up to depth hops.
// depth <= 0 means unlimited (delegates to GetUpstream).
func (g *Graph) GetUpstreamN(taskID string, depth int) map[string]bool {
	if depth <= 0 {
		return g.GetUpstream(taskID)
	}
	visited := make(map[string]bool)
	var visit func(id string, remaining int)
	visit = func(id string, remaining int) {
		if visited[id] {
			return
		}
		visited[id] = true
		if remaining == 0 {
			return
		}
		for _, dep := range g.RevAdjacency[id] {
			visit(dep, remaining-1)
		}
	}
	visit(taskID, depth)
	delete(visited, taskID)
	return visited
}

// GetDownstream returns all tasks that depend on the given task (transitively)
func (g *Graph) GetDownstream(taskID string) map[string]bool {
	visited := make(map[string]bool)
	var visit func(id string)
	visit = func(id string) {
		if visited[id] {
			return
		}
		visited[id] = true
		for _, dependentID := range g.Adjacency[id] {
			visit(dependentID)
		}
	}
	visit(taskID)
	delete(visited, taskID) // Don't include the root task itself
	return visited
}

// GetUpstream returns all tasks that the given task depends on (transitively)
func (g *Graph) GetUpstream(taskID string) map[string]bool {
	visited := make(map[string]bool)
	var visit func(id string)
	visit = func(id string) {
		if visited[id] {
			return
		}
		visited[id] = true
		for _, depID := range g.RevAdjacency[id] {
			visit(depID)
		}
	}
	visit(taskID)
	delete(visited, taskID) // Don't include the root task itself
	return visited
}

// DetectCycles finds all cycles in the graph
//
//nolint:gocognit // TODO: refactor to reduce complexity
func (g *Graph) DetectCycles() [][]string {
	var cycles [][]string
	visited := make(map[string]bool)
	recStack := make(map[string]bool)
	path := []string{}

	var dfs func(taskID string) bool
	dfs = func(taskID string) bool {
		visited[taskID] = true
		recStack[taskID] = true
		path = append(path, taskID)

		for _, depID := range g.RevAdjacency[taskID] {
			if !visited[depID] {
				if dfs(depID) {
					return true
				}
			} else if recStack[depID] {
				// Found a cycle
				cycleStart := -1
				for i, id := range path {
					if id == depID {
						cycleStart = i
						break
					}
				}
				if cycleStart != -1 {
					cycle := make([]string, len(path)-cycleStart)
					copy(cycle, path[cycleStart:])
					cycles = append(cycles, cycle)
				}
			}
		}

		path = path[:len(path)-1]
		recStack[taskID] = false
		return false
	}

	for _, task := range g.Tasks {
		if !visited[task.ID] {
			dfs(task.ID)
		}
	}

	return cycles
}

// FilterTasks creates a subgraph with only the specified task IDs
func (g *Graph) FilterTasks(taskIDs map[string]bool) *Graph {
	filtered := []*model.Task{}
	for _, task := range g.Tasks {
		if taskIDs[task.ID] {
			filtered = append(filtered, task)
		}
	}
	return NewGraph(filtered)
}

// classifyByGroup groups tasks into phase groups, scope groups, and top-level.
// A task with a phase goes into its phase group regardless of connectivity.
// An isolated task (no dep edges in or out, no parent, no phase) with touches goes into its first scope group.
// All others are top-level.
func classifyByGroup(tasks []*model.Task, hasDepEdge map[string]bool) (phases, scopes map[string][]string, topLevel []string) {
	phases = make(map[string][]string)
	scopes = make(map[string][]string)
	for _, task := range tasks {
		switch {
		case task.Phase != "":
			phases[task.Phase] = append(phases[task.Phase], task.ID)
		case !hasDepEdge[task.ID] && task.Parent == "" && len(task.Touches) > 0:
			scope := task.Touches[0]
			scopes[scope] = append(scopes[scope], task.ID)
		default:
			topLevel = append(topLevel, task.ID)
		}
	}
	return phases, scopes, topLevel
}

// writeMermaidGroups emits subgraph blocks for phase and scope groups.
func writeMermaidGroups(sb *strings.Builder, phases, scopes map[string][]string) {
	phaseKeys := make([]string, 0, len(phases))
	for k := range phases {
		phaseKeys = append(phaseKeys, k)
	}
	sort.Strings(phaseKeys)
	for _, phase := range phaseKeys {
		ids := phases[phase]
		sort.Strings(ids)
		sb.WriteString(fmt.Sprintf("    subgraph phase_%s\n", phase))
		for _, id := range ids {
			sb.WriteString(fmt.Sprintf("        %s\n", id))
		}
		sb.WriteString("    end\n")
	}

	scopeKeys := make([]string, 0, len(scopes))
	for k := range scopes {
		scopeKeys = append(scopeKeys, k)
	}
	sort.Strings(scopeKeys)
	for _, scope := range scopeKeys {
		ids := scopes[scope]
		sort.Strings(ids)
		sb.WriteString(fmt.Sprintf("    subgraph scope_%s\n", scope))
		for _, id := range ids {
			sb.WriteString(fmt.Sprintf("        %s\n", id))
		}
		sb.WriteString("    end\n")
	}
}

// writeDotGroups emits cluster subgraph blocks for phase and scope groups.
func writeDotGroups(sb *strings.Builder, phases, scopes map[string][]string) {
	phaseKeys := make([]string, 0, len(phases))
	for k := range phases {
		phaseKeys = append(phaseKeys, k)
	}
	sort.Strings(phaseKeys)
	for _, phase := range phaseKeys {
		ids := phases[phase]
		sort.Strings(ids)
		sb.WriteString(fmt.Sprintf("    subgraph cluster_phase_%s {\n", phase))
		sb.WriteString(fmt.Sprintf("        label=\"%s\";\n", phase))
		for _, id := range ids {
			sb.WriteString(fmt.Sprintf("        %s;\n", id))
		}
		sb.WriteString("    }\n")
	}

	scopeKeys := make([]string, 0, len(scopes))
	for k := range scopes {
		scopeKeys = append(scopeKeys, k)
	}
	sort.Strings(scopeKeys)
	for _, scope := range scopeKeys {
		ids := scopes[scope]
		sort.Strings(ids)
		sb.WriteString(fmt.Sprintf("    subgraph cluster_scope_%s {\n", scope))
		sb.WriteString(fmt.Sprintf("        label=\"%s\";\n", scope))
		for _, id := range ids {
			sb.WriteString(fmt.Sprintf("        %s;\n", id))
		}
		sb.WriteString("    }\n")
	}
}

// ToMermaid generates a Mermaid diagram
func (g *Graph) ToMermaid(opts RenderOptions) string {
	var sb strings.Builder
	sb.WriteString("graph TD\n")

	// Sort tasks by ID for consistent output
	sortedTasks := make([]*model.Task, len(g.Tasks))
	copy(sortedTasks, g.Tasks)
	sort.Slice(sortedTasks, func(i, j int) bool {
		return sortedTasks[i].ID < sortedTasks[j].ID
	})

	// Define nodes
	for _, task := range sortedTasks {
		nodeStyle := ""
		if task.ID == opts.FocusTaskID {
			nodeStyle = ":::focus"
		} else {
			switch task.Status {
			case model.StatusCompleted:
				nodeStyle = ":::completed"
			case model.StatusInProgress:
				nodeStyle = ":::inprogress"
			case model.StatusBlocked:
				nodeStyle = ":::blocked"
			}
		}

		// Escape special characters in title
		title := strings.ReplaceAll(task.Title, "\"", "&quot;")
		sb.WriteString(fmt.Sprintf("    %s[\"%s: %s\"]%s\n", task.ID, task.ID, title, nodeStyle))
	}

	// Subgraph groupings (phase/scope)
	if opts.Subgraphs {
		hasDepEdge := make(map[string]bool)
		for _, task := range g.Tasks {
			for _, depID := range task.Dependencies {
				hasDepEdge[task.ID] = true
				hasDepEdge[depID] = true
			}
		}
		phases, scopes, _ := classifyByGroup(g.Tasks, hasDepEdge)
		writeMermaidGroups(&sb, phases, scopes)
	}

	// Define dependency edges
	edges := make(map[string]bool) // Track unique edges
	for _, task := range sortedTasks {
		for _, depID := range task.Dependencies {
			edgeKey := depID + "->" + task.ID
			if !edges[edgeKey] {
				edges[edgeKey] = true
				sb.WriteString(fmt.Sprintf("    %s --> %s\n", depID, task.ID))
			}
		}
	}

	// Define related edges (dashed, undirected)
	if opts.ShowRelated {
		for _, pair := range g.RelatedEdges {
			sb.WriteString(fmt.Sprintf("    %s -.- %s\n", pair[0], pair[1]))
		}
	}

	// Define spawned_by edges (dotted directed: child -.-> source)
	if opts.ShowSpawnedBy {
		for _, pair := range g.SpawnedByEdges {
			sb.WriteString(fmt.Sprintf("    %s -.-> %s\n", pair[0], pair[1]))
		}
	}

	// Define parent edges (open circle: child --o parent)
	if opts.ShowParent {
		for _, pair := range g.ParentEdges {
			sb.WriteString(fmt.Sprintf("    %s --o %s\n", pair[0], pair[1]))
		}
	}

	// Add styles
	sb.WriteString("\n")
	sb.WriteString("    classDef focus fill:#ff6b6b,stroke:#c92a2a,color:#fff\n")
	sb.WriteString("    classDef completed fill:#51cf66,stroke:#2f9e44,color:#000\n")
	sb.WriteString("    classDef inprogress fill:#ffd43b,stroke:#fab005,color:#000\n")
	sb.WriteString("    classDef blocked fill:#868e96,stroke:#495057,color:#fff\n")

	return sb.String()
}

// ToDot generates a Graphviz DOT format
func (g *Graph) ToDot(opts RenderOptions) string {
	var sb strings.Builder
	sb.WriteString("digraph tasks {\n")
	sb.WriteString("    rankdir=TB;\n")
	sb.WriteString("    node [shape=box, style=rounded];\n\n")

	// Sort tasks by ID for consistent output
	sortedTasks := make([]*model.Task, len(g.Tasks))
	copy(sortedTasks, g.Tasks)
	sort.Slice(sortedTasks, func(i, j int) bool {
		return sortedTasks[i].ID < sortedTasks[j].ID
	})

	// Define nodes
	for _, task := range sortedTasks {
		color := "lightgray"
		if task.ID == opts.FocusTaskID {
			color = "red"
		} else {
			switch task.Status {
			case model.StatusCompleted:
				color = "lightgreen"
			case model.StatusInProgress:
				color = "yellow"
			case model.StatusBlocked:
				color = "gray"
			}
		}

		// Escape special characters
		title := strings.ReplaceAll(task.Title, "\"", "\\\"")
		label := fmt.Sprintf("%s: %s", task.ID, title)
		sb.WriteString(fmt.Sprintf("    %s [label=\"%s\", fillcolor=%s, style=filled];\n", task.ID, label, color))
	}

	sb.WriteString("\n")

	// Subgraph groupings (phase/scope)
	if opts.Subgraphs {
		hasDepEdge := make(map[string]bool)
		for _, task := range g.Tasks {
			for _, depID := range task.Dependencies {
				hasDepEdge[task.ID] = true
				hasDepEdge[depID] = true
			}
		}
		phases, scopes, _ := classifyByGroup(g.Tasks, hasDepEdge)
		writeDotGroups(&sb, phases, scopes)
		sb.WriteString("\n")
	}

	// Define dependency edges
	edges := make(map[string]bool)
	for _, task := range sortedTasks {
		for _, depID := range task.Dependencies {
			edgeKey := depID + "->" + task.ID
			if !edges[edgeKey] {
				edges[edgeKey] = true
				sb.WriteString(fmt.Sprintf("    %s -> %s;\n", depID, task.ID))
			}
		}
	}

	// Define related edges (dashed, undirected)
	if opts.ShowRelated {
		for _, pair := range g.RelatedEdges {
			sb.WriteString(fmt.Sprintf("    %s -> %s [style=dashed, dir=none];\n", pair[0], pair[1]))
		}
	}

	// Define spawned_by edges (dotted directed: child -> source)
	if opts.ShowSpawnedBy {
		for _, pair := range g.SpawnedByEdges {
			sb.WriteString(fmt.Sprintf("    %s -> %s [style=dotted];\n", pair[0], pair[1]))
		}
	}

	// Define parent edges (diamond: child -> parent)
	if opts.ShowParent {
		for _, pair := range g.ParentEdges {
			sb.WriteString(fmt.Sprintf("    %s -> %s [arrowhead=odiamond, dir=forward, style=solid, color=\"#6366f1\"];\n", pair[0], pair[1]))
		}
	}

	sb.WriteString("}\n")
	return sb.String()
}

// ToASCII generates an ASCII tree representation.
// An optional ASCIIFormatter applies styling callbacks; pass nil for plain text.
//
//nolint:gocognit,gocyclo,funlen // TODO: refactor to reduce complexity
func (g *Graph) ToASCII(rootTaskID string, downstream bool, f *ASCIIFormatter, opts RenderOptions) string {
	var sb strings.Builder

	visited := make(map[string]bool)

	var printTree func(taskID string, prefix string, isLast bool)
	printTree = func(taskID string, prefix string, isLast bool) {
		if visited[taskID] {
			// Already visited, just show reference
			task, exists := g.TaskMap[taskID]
			if exists {
				connector := "├── "
				if isLast {
					connector = "└── "
				}
				annotation := ""
				if opts.ShowRelated {
					if related := g.RelatedMap[taskID]; len(related) > 0 {
						annotation += " ~ " + strings.Join(related, ", ")
					}
				}
				if opts.ShowSpawnedBy && task.SpawnedBy != "" {
					if _, exists := g.TaskMap[task.SpawnedBy]; exists {
						annotation += " (spawned by " + task.SpawnedBy + ")"
					}
				}
				if opts.ShowParent && task.Parent != "" {
					if _, exists := g.TaskMap[task.Parent]; exists {
						annotation += " (child of " + task.Parent + ")"
					}
				}
				ref := f.applyReference("(see above)")
				sb.WriteString(fmt.Sprintf("%s%s[%s] %s %s%s\n",
					prefix, f.applyConnector(connector),
					f.applyID(taskID), f.applyTitle(task.Title, string(task.Status)), ref, f.applyReference(annotation)))
			}
			return
		}

		visited[taskID] = true

		task, exists := g.TaskMap[taskID]
		if !exists {
			return
		}

		// Print current node
		connector := "├── "
		if isLast {
			connector = "└── "
		}

		statusIndicator := ""
		switch task.Status {
		case model.StatusCompleted:
			statusIndicator = f.applyStatusIndicator(" ✓", string(task.Status))
		case model.StatusInProgress:
			statusIndicator = f.applyStatusIndicator(" ⋯", string(task.Status))
		case model.StatusBlocked:
			statusIndicator = f.applyStatusIndicator(" ⊗", string(task.Status))
		}

		formattedID := f.applyID(taskID)
		formattedTitle := f.applyTitle(task.Title, string(task.Status))

		annotation := ""
		if opts.ShowRelated {
			if related := g.RelatedMap[taskID]; len(related) > 0 {
				annotation += " ~ " + strings.Join(related, ", ")
			}
		}
		if opts.ShowSpawnedBy && task.SpawnedBy != "" {
			if _, exists := g.TaskMap[task.SpawnedBy]; exists {
				annotation += " (spawned by " + task.SpawnedBy + ")"
			}
		}
		if opts.ShowParent && task.Parent != "" {
			if _, exists := g.TaskMap[task.Parent]; exists {
				annotation += " (child of " + task.Parent + ")"
			}
		}

		if prefix == "" {
			sb.WriteString(fmt.Sprintf("[%s] %s%s%s\n", formattedID, formattedTitle, statusIndicator, f.applyReference(annotation)))
		} else {
			sb.WriteString(fmt.Sprintf("%s%s[%s] %s%s%s\n",
				prefix, f.applyConnector(connector), formattedID, formattedTitle, statusIndicator, f.applyReference(annotation)))
		}

		// Get children based on direction
		var children []string
		if downstream {
			children = g.Adjacency[taskID]
		} else {
			children = g.RevAdjacency[taskID]
		}

		// Sort children for consistent output
		sort.Strings(children)

		// Print children
		for i, childID := range children {
			isLastChild := i == len(children)-1
			// Root nodes (prefix == "") don't have tree connectors between them,
			// so always use blank indentation to avoid dangling │ lines.
			var childPrefix string
			if isLast || prefix == "" {
				childPrefix = prefix + "    "
			} else {
				childPrefix = prefix + f.applyConnector("│") + "   "
			}
			printTree(childID, childPrefix, isLastChild)
		}
	}

	if rootTaskID != "" {
		printTree(rootTaskID, "", true)
	} else {
		// Print all root nodes (tasks with no dependencies)
		roots := []string{}
		for _, task := range g.Tasks {
			if downstream {
				// For downstream view, roots are tasks with no dependencies
				if len(task.Dependencies) == 0 {
					roots = append(roots, task.ID)
				}
			} else {
				// For upstream view, roots are tasks that nothing depends on
				if len(g.Adjacency[task.ID]) == 0 {
					roots = append(roots, task.ID)
				}
			}
		}

		sort.Strings(roots)

		if len(roots) == 0 {
			// No roots found, might be cycles - just print all
			for _, task := range g.Tasks {
				roots = append(roots, task.ID)
			}
			sort.Strings(roots)
		}

		for i, rootID := range roots {
			isLast := i == len(roots)-1
			printTree(rootID, "", isLast)
			if !isLast {
				sb.WriteString("\n")
			}
		}
	}

	return sb.String()
}

// ToJSON generates a JSON graph structure
func (g *Graph) ToJSON(opts RenderOptions) map[string]any {
	nodes := []map[string]any{}
	edges := []map[string]string{}

	// Sort tasks by ID
	sortedTasks := make([]*model.Task, len(g.Tasks))
	copy(sortedTasks, g.Tasks)
	sort.Slice(sortedTasks, func(i, j int) bool {
		return sortedTasks[i].ID < sortedTasks[j].ID
	})

	// Build nodes
	for _, task := range sortedTasks {
		node := map[string]any{
			"id":     task.ID,
			"title":  task.Title,
			"status": string(task.Status),
		}
		if task.Priority != "" {
			node["priority"] = string(task.Priority)
		}
		if task.Group != "" {
			node["group"] = task.Group
		}
		if task.Parent != "" {
			node["parent"] = task.Parent
		}
		if task.Phase != "" {
			node["phase"] = task.Phase
		}
		if len(task.Touches) > 0 {
			node["touches"] = task.Touches
		}
		nodes = append(nodes, node)
	}

	// Build dependency edges
	edgeSet := make(map[string]bool)
	for _, task := range sortedTasks {
		for _, depID := range task.Dependencies {
			edgeKey := depID + "->" + task.ID
			if !edgeSet[edgeKey] {
				edgeSet[edgeKey] = true
				edges = append(edges, map[string]string{
					"from": depID,
					"to":   task.ID,
				})
			}
		}
	}

	// Build related edges
	var relatedEdges []map[string]string
	if opts.ShowRelated {
		for _, pair := range g.RelatedEdges {
			relatedEdges = append(relatedEdges, map[string]string{
				"a": pair[0],
				"b": pair[1],
			})
		}
	}

	// Build spawned_by edges
	var spawnedByEdges []map[string]string
	if opts.ShowSpawnedBy {
		for _, pair := range g.SpawnedByEdges {
			spawnedByEdges = append(spawnedByEdges, map[string]string{
				"child":  pair[0],
				"source": pair[1],
			})
		}
	}

	// Detect cycles
	cycles := g.DetectCycles()
	cyclesData := [][]string{}
	if len(cycles) > 0 {
		cyclesData = cycles
	}

	result := map[string]any{
		"nodes": nodes,
		"edges": edges,
	}
	if opts.ShowRelated {
		result["relatedEdges"] = relatedEdges
	}
	if opts.ShowSpawnedBy {
		result["spawnedByEdges"] = spawnedByEdges
	}
	if opts.ShowParent {
		parentEdges := []map[string]string{}
		for _, pair := range g.ParentEdges {
			parentEdges = append(parentEdges, map[string]string{
				"child":  pair[0],
				"parent": pair[1],
			})
		}
		result["parentEdges"] = parentEdges
	}

	if len(cyclesData) > 0 {
		result["cycles"] = cyclesData
	}

	return result
}
