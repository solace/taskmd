package next

import (
	"testing"

	"github.com/driangle/taskmd/apps/cli/internal/model"
)

func makeTask(id string, status model.Status, priority model.Priority, deps []string) *model.Task {
	return &model.Task{
		ID:           id,
		Title:        "Task " + id,
		Status:       status,
		Priority:     priority,
		Dependencies: deps,
	}
}

func TestRecommend_ArchivedCompletedDepSatisfied(t *testing.T) {
	// Task 002 depends on 001, but 001 is archived and completed.
	// 002 should be actionable.
	tasks := []*model.Task{
		makeTask("002", model.StatusPending, model.PriorityHigh, []string{"001"}),
	}
	archived := []*model.Task{
		makeTask("001", model.StatusCompleted, model.PriorityHigh, nil),
	}

	recs, err := Recommend(tasks, Options{
		Limit:         10,
		ArchivedTasks: archived,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(recs) != 1 {
		t.Fatalf("Expected 1 recommendation, got %d", len(recs))
	}
	if recs[0].ID != "002" {
		t.Errorf("Expected task 002, got %s", recs[0].ID)
	}
}

func TestRecommend_ArchivedNonCompletedDepBlocks(t *testing.T) {
	// Task 002 depends on 001, which is archived but still pending.
	// 002 should be blocked.
	tasks := []*model.Task{
		makeTask("002", model.StatusPending, model.PriorityHigh, []string{"001"}),
	}
	archived := []*model.Task{
		makeTask("001", model.StatusPending, model.PriorityHigh, nil),
	}

	recs, err := Recommend(tasks, Options{
		Limit:         10,
		ArchivedTasks: archived,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(recs) != 0 {
		t.Errorf("Expected 0 recommendations (dep not completed), got %d", len(recs))
	}
}

func TestRecommend_ArchivedTasksNotRecommended(t *testing.T) {
	// Archived tasks should never appear in recommendations, even if actionable.
	tasks := []*model.Task{
		makeTask("002", model.StatusPending, model.PriorityHigh, nil),
	}
	archived := []*model.Task{
		makeTask("001", model.StatusPending, model.PriorityHigh, nil),
	}

	recs, err := Recommend(tasks, Options{
		Limit:         10,
		ArchivedTasks: archived,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	for _, rec := range recs {
		if rec.ID == "001" {
			t.Error("Archived task 001 should not appear in recommendations")
		}
	}

	if len(recs) != 1 || recs[0].ID != "002" {
		t.Errorf("Expected only task 002, got %v", recs)
	}
}

func TestRecommend_ActiveTaskPrecedenceOverArchived(t *testing.T) {
	// If the same ID exists in both active and archived, active wins.
	tasks := []*model.Task{
		makeTask("001", model.StatusPending, model.PriorityHigh, nil),
		makeTask("002", model.StatusPending, model.PriorityMedium, []string{"001"}),
	}
	// Archived version has status=completed, but active version is pending.
	// Task 002 depends on 001 — since active 001 is pending, 002 should be blocked.
	archived := []*model.Task{
		makeTask("001", model.StatusCompleted, model.PriorityHigh, nil),
	}

	recs, err := Recommend(tasks, Options{
		Limit:         10,
		ArchivedTasks: archived,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// 001 is active+pending → actionable. 002 depends on 001 (pending) → blocked.
	if len(recs) != 1 {
		t.Fatalf("Expected 1 recommendation, got %d", len(recs))
	}
	if recs[0].ID != "001" {
		t.Errorf("Expected task 001, got %s", recs[0].ID)
	}
}
