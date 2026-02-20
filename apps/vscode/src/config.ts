import * as path from "path";
import * as fs from "fs";
import { parse } from "yaml";

const CONFIG_FILENAME = ".taskmd.yaml";
const DEFAULT_TASK_DIR = "tasks";

interface TaskmdConfig {
  "task-dir"?: string;
  dir?: string;
}

/**
 * Find `.taskmd.yaml` by walking up from the given directory.
 * Returns the absolute path to the config file, or null if not found.
 */
export function findConfigFile(startDir: string): string | null {
  let current = startDir;
  while (true) {
    const candidate = path.join(current, CONFIG_FILENAME);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) break; // reached filesystem root
    current = parent;
  }
  return null;
}

/**
 * Read the task directory from a `.taskmd.yaml` config file.
 * Supports both `task-dir` and `dir` keys (task-dir takes precedence).
 * Returns the raw value, or null if neither key is set.
 */
function readTaskDirFromConfig(configPath: string): string | null {
  try {
    const content = fs.readFileSync(configPath, "utf-8");
    const config = parse(content) as TaskmdConfig | null;
    if (!config) return null;
    return config["task-dir"] ?? config.dir ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve the absolute task directory for a given file path.
 *
 * Logic mirrors the Go CLI:
 * 1. Walk up from the file to find `.taskmd.yaml`
 * 2. Read `task-dir` or `dir` from the config
 * 3. Resolve relative to the config file's directory
 * 4. If no config or no dir key, use `<project-root>/tasks` as default
 *    (where project-root is the config file's directory, or the workspace root)
 */
export function resolveTaskDir(filePath: string): string | null {
  const fileDir = path.dirname(filePath);
  const configPath = findConfigFile(fileDir);

  if (configPath) {
    const projectRoot = path.dirname(configPath);
    const taskDirValue = readTaskDirFromConfig(configPath);

    if (taskDirValue) {
      // Resolve relative to project root (where .taskmd.yaml lives)
      return path.resolve(projectRoot, taskDirValue);
    }

    // Config exists but no dir key — default to <project-root>/tasks
    return path.join(projectRoot, DEFAULT_TASK_DIR);
  }

  // No config found — can't determine task directory
  return null;
}

/**
 * Check whether a file path falls under the resolved task directory.
 */
export function isUnderTaskDir(filePath: string): boolean {
  const taskDir = resolveTaskDir(filePath);
  if (!taskDir) return false;

  const normalizedFile = path.resolve(filePath);
  const normalizedTaskDir = path.resolve(taskDir);

  return normalizedFile.startsWith(normalizedTaskDir + path.sep);
}
