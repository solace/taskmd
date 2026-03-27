import { useEffect } from "react";
import { useProjects } from "../../hooks/use-projects.ts";
import { useProject } from "../../hooks/use-project.ts";

export function ProjectSelector() {
  const { data: projects } = useProjects();
  const { project, setProject } = useProject();

  // Clear selection if the selected project is no longer available
  useEffect(() => {
    if (project && projects && projects.length > 0) {
      const exists = projects.some((p) => p.id === project);
      if (!exists) {
        setProject(null);
      }
    }
  }, [project, projects, setProject]);

  if (!projects || projects.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="project-selector"
        className="text-xs font-medium text-gray-500 dark:text-gray-400"
      >
        Project:
      </label>
      <select
        id="project-selector"
        value={project ?? ""}
        onChange={(e) => setProject(e.target.value || null)}
        className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
      >
        <option value="">(local)</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
