import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { Task, WorklogEntry } from "../../api/types.ts";
import { StatusBadge, PhaseBadge } from "./TaskTable/Badges.tsx";
import { WorklogSection } from "./WorklogSection.tsx";

interface TaskDetailViewProps {
  task: Task;
  worklogEntries?: WorklogEntry[];
  readonly?: boolean;
  onEdit: () => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

export function TaskDetailView({ task, worklogEntries, readonly, onEdit }: TaskDetailViewProps) {
  return (
    <>
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="font-mono text-xs text-gray-400">{task.id}</span>
          <h2 className="text-xl font-semibold mt-1">{task.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />
          {!readonly && (
            <button
              onClick={onEdit}
              className="min-h-[44px] sm:min-h-0 inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
        {task.priority && <Field label="Priority" value={task.priority} />}
        {task.effort && <Field label="Effort" value={task.effort} />}
        {task.phase && (
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">Phase</dt>
            <dd className="mt-0.5"><PhaseBadge phase={task.phase} /></dd>
          </div>
        )}
        {task.owner && <Field label="Owner" value={task.owner} />}
        {task.group && <Field label="Group" value={task.group} />}
        {task.parent && (
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">Parent</dt>
            <dd className="font-medium">
              <Link to={`/tasks/${task.parent}`} className="text-blue-600 hover:underline dark:text-blue-400 font-mono">
                {task.parent}
              </Link>
            </dd>
          </div>
        )}
        {task.spawned_by && (
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">Spawned by</dt>
            <dd className="font-medium">
              <Link to={`/tasks/${task.spawned_by}`} className="text-purple-600 hover:underline dark:text-purple-400 font-mono">
                {task.spawned_by}
              </Link>
            </dd>
          </div>
        )}
        {task.created && <Field label="Created" value={task.created} />}
      </div>

      {task.dependencies && task.dependencies.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Dependencies</h3>
          <div className="flex gap-2 flex-wrap" data-arrow-nav>
            {task.dependencies.map((dep) => (
              <Link key={dep} to={`/tasks/${dep}`} className="min-h-[44px] sm:min-h-0 inline-flex items-center px-2 py-1 text-xs font-mono bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
                {dep}
              </Link>
            ))}
          </div>
        </div>
      )}

      {task.see_also && task.see_also.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">See also</h3>
          <div className="flex gap-2 flex-wrap" data-arrow-nav>
            {task.see_also.map((ref) => (
              <Link key={ref} to={`/tasks/${ref}`} className="min-h-[44px] sm:min-h-0 inline-flex items-center px-2 py-1 text-xs font-mono bg-purple-50 rounded hover:bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-300">
                {ref}
              </Link>
            ))}
          </div>
        </div>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Tags</h3>
          <div className="flex gap-1 flex-wrap" data-arrow-nav>
            {task.tags.map((t) => (
              <Link key={t} to={`/tasks?tag=${encodeURIComponent(t)}`} className="min-h-[44px] sm:min-h-0 inline-flex items-center px-1.5 py-0.5 text-xs bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition-colors duration-150 dark:bg-gray-700 dark:hover:bg-gray-600">
                {t}
              </Link>
            ))}
          </div>
        </div>
      )}

      {task.body && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {task.body}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {worklogEntries && worklogEntries.length > 0 && (
        <WorklogSection entries={worklogEntries} />
      )}

      {task.file_path && (
        <div className="mt-4 text-xs text-gray-400 font-mono break-all">{task.file_path}</div>
      )}
    </>
  );
}
