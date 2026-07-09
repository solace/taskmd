import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTaskDetail } from "../hooks/use-task-detail.ts";
import { useWorklog } from "../hooks/use-worklog.ts";
import { useConfig } from "../hooks/use-config.ts";
import { useProject } from "../hooks/use-project.ts";
import { updateTask, ApiRequestError } from "../api/client.ts";
import type { TaskUpdateRequest } from "../api/types.ts";
import { TaskEditForm } from "../components/tasks/TaskEditForm.tsx";
import { TaskDetailView } from "../components/tasks/TaskDetailView.tsx";
import { LoadingState } from "../components/shared/LoadingState.tsx";
import { ErrorState } from "../components/shared/ErrorState.tsx";

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { project } = useProject();
  const { data: task, error, isLoading, mutate } = useTaskDetail(id, project);
  const { data: worklogEntries } = useWorklog(id, project);
  const { readonly } = useConfig(project);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Escape key cancels editing
  useEffect(() => {
    if (!isEditing) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsEditing(false);
        setEditError(null);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEditing]);

  if (isLoading) return <LoadingState variant="detail" />;
  if (error) return <ErrorState error={error} onRetry={() => mutate()} />;

  if (!task) {
    return (
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Task not found: {id}</p>
        <Link to="/tasks" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          Back to tasks
        </Link>
      </div>
    );
  }

  const handleSave = async (data: TaskUpdateRequest) => {
    setEditError(null);
    try {
      const updated = await updateTask(task.id, data);
      await mutate(updated, false);
      setIsEditing(false);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const msg = err.details?.length
          ? `${err.message}: ${err.details.join(", ")}`
          : err.message;
        setEditError(msg);
      } else {
        setEditError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 dark:bg-gray-800 dark:border-gray-700">
        {isEditing && !readonly ? (
          <TaskEditForm
            task={task}
            onSave={handleSave}
            onCancel={() => { setIsEditing(false); setEditError(null); }}
            error={editError}
          />
        ) : (
          <TaskDetailView
            task={task}
            worklogEntries={worklogEntries ?? undefined}
            readonly={readonly}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </div>
    </div>
  );
}
