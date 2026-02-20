import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { findConfigFile, resolveTaskDir, isUnderTaskDir } from "../src/config";

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "taskmd-test-"));
}

function cleanup(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}

describe("findConfigFile", () => {
  let tmpDir: string;
  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => cleanup(tmpDir));

  it("finds config in the same directory", () => {
    fs.writeFileSync(path.join(tmpDir, ".taskmd.yaml"), "dir: tasks\n");
    const result = findConfigFile(tmpDir);
    expect(result).toBe(path.join(tmpDir, ".taskmd.yaml"));
  });

  it("finds config in a parent directory", () => {
    fs.writeFileSync(path.join(tmpDir, ".taskmd.yaml"), "dir: tasks\n");
    const subDir = path.join(tmpDir, "tasks", "cli");
    fs.mkdirSync(subDir, { recursive: true });
    const result = findConfigFile(subDir);
    expect(result).toBe(path.join(tmpDir, ".taskmd.yaml"));
  });

  it("returns null when no config exists", () => {
    const result = findConfigFile(tmpDir);
    expect(result).toBeNull();
  });
});

describe("resolveTaskDir", () => {
  let tmpDir: string;
  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => cleanup(tmpDir));

  it("uses task-dir from config", () => {
    fs.writeFileSync(path.join(tmpDir, ".taskmd.yaml"), "task-dir: my-tasks\n");
    const filePath = path.join(tmpDir, "my-tasks", "001.md");
    const result = resolveTaskDir(filePath);
    expect(result).toBe(path.join(tmpDir, "my-tasks"));
  });

  it("uses dir from config (legacy key)", () => {
    fs.writeFileSync(path.join(tmpDir, ".taskmd.yaml"), "dir: work\n");
    const filePath = path.join(tmpDir, "work", "001.md");
    const result = resolveTaskDir(filePath);
    expect(result).toBe(path.join(tmpDir, "work"));
  });

  it("task-dir takes precedence over dir", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".taskmd.yaml"),
      "task-dir: primary\ndir: secondary\n"
    );
    const filePath = path.join(tmpDir, "primary", "001.md");
    const result = resolveTaskDir(filePath);
    expect(result).toBe(path.join(tmpDir, "primary"));
  });

  it("defaults to tasks/ when config exists but has no dir key", () => {
    fs.writeFileSync(path.join(tmpDir, ".taskmd.yaml"), "workflow: solo\n");
    const filePath = path.join(tmpDir, "tasks", "001.md");
    const result = resolveTaskDir(filePath);
    expect(result).toBe(path.join(tmpDir, "tasks"));
  });

  it("returns null when no config exists", () => {
    const result = resolveTaskDir(path.join(tmpDir, "tasks", "001.md"));
    expect(result).toBeNull();
  });

  it("resolves relative paths against config directory", () => {
    fs.writeFileSync(path.join(tmpDir, ".taskmd.yaml"), "task-dir: ./src/tasks\n");
    const filePath = path.join(tmpDir, "src", "tasks", "001.md");
    const result = resolveTaskDir(filePath);
    expect(result).toBe(path.resolve(tmpDir, "src/tasks"));
  });
});

describe("isUnderTaskDir", () => {
  let tmpDir: string;
  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => cleanup(tmpDir));

  it("returns true for file under task dir", () => {
    fs.writeFileSync(path.join(tmpDir, ".taskmd.yaml"), "task-dir: tasks\n");
    const filePath = path.join(tmpDir, "tasks", "001.md");
    expect(isUnderTaskDir(filePath)).toBe(true);
  });

  it("returns true for file in nested subdirectory", () => {
    fs.writeFileSync(path.join(tmpDir, ".taskmd.yaml"), "task-dir: tasks\n");
    const filePath = path.join(tmpDir, "tasks", "cli", "001.md");
    expect(isUnderTaskDir(filePath)).toBe(true);
  });

  it("returns false for file outside task dir", () => {
    fs.writeFileSync(path.join(tmpDir, ".taskmd.yaml"), "task-dir: tasks\n");
    const filePath = path.join(tmpDir, "docs", "readme.md");
    expect(isUnderTaskDir(filePath)).toBe(false);
  });

  it("returns false when no config exists", () => {
    const filePath = path.join(tmpDir, "tasks", "001.md");
    expect(isUnderTaskDir(filePath)).toBe(false);
  });

  it("works with default tasks/ when config has no dir", () => {
    fs.writeFileSync(path.join(tmpDir, ".taskmd.yaml"), "workflow: solo\n");
    expect(isUnderTaskDir(path.join(tmpDir, "tasks", "001.md"))).toBe(true);
    expect(isUnderTaskDir(path.join(tmpDir, "docs", "001.md"))).toBe(false);
  });
});
