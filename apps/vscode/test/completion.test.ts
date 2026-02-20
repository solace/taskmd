import { describe, it, expect } from "vitest";
import { findFrontmatterBounds } from "../src/frontmatter";
import { resolveCompletions } from "../src/completion";

function getResult(text: string, line: number, character: number) {
  const bounds = findFrontmatterBounds(text);
  if (!bounds) return undefined;
  const lines = text.split("\n");
  return resolveCompletions(lines, line, character, bounds.startLine, bounds.endLine);
}

describe("completion logic", () => {
  const doc = `---
id: "042"
title: "Test"
status:
priority:
effort:
type:
tags: []
---
# Body`;

  it("provides status completions", () => {
    const result = getResult(doc, 3, 8);
    expect(result).toBeDefined();
    expect(result!.values).toEqual([
      "pending",
      "in-progress",
      "completed",
      "in-review",
      "blocked",
      "cancelled",
    ]);
  });

  it("provides priority completions", () => {
    const result = getResult(doc, 4, 10);
    expect(result).toBeDefined();
    expect(result!.values).toEqual(["low", "medium", "high", "critical"]);
  });

  it("provides effort completions", () => {
    const result = getResult(doc, 5, 8);
    expect(result).toBeDefined();
    expect(result!.values).toEqual(["small", "medium", "large"]);
  });

  it("provides type completions", () => {
    const result = getResult(doc, 6, 6);
    expect(result).toBeDefined();
    expect(result!.values).toEqual(["feature", "bug", "improvement", "chore", "docs"]);
  });

  it("no completions for non-enum field", () => {
    expect(getResult(doc, 7, 6)).toBeUndefined();
  });

  it("no completions outside frontmatter", () => {
    expect(getResult(doc, 9, 5)).toBeUndefined();
  });

  it("no completions on opening delimiter line", () => {
    expect(getResult(doc, 0, 3)).toBeUndefined();
  });

  it("no completions on closing delimiter line", () => {
    expect(getResult(doc, 8, 3)).toBeUndefined();
  });

  it("no completions when cursor is in middle of value", () => {
    const docWithValue = `---
status: pend
---`;
    expect(getResult(docWithValue, 1, 12)).toBeUndefined();
  });

  it("no completions for document without frontmatter", () => {
    expect(getResult("# Just markdown", 0, 5)).toBeUndefined();
  });
});

describe("completion insert text", () => {
  it("includes leading space in insertText when no space after colon", () => {
    const doc = `---
status:
---`;
    // cursor right after colon: "status:" -> character 7
    const result = getResult(doc, 1, 7);
    expect(result).toBeDefined();
    expect(result!.insertTexts[0]).toBe(" pending");
    expect(result!.insertTexts).toEqual(
      result!.values.map((v) => ` ${v}`)
    );
  });

  it("includes leading space in insertText when space already present", () => {
    const doc = `---
status:
---`;
    // cursor after "status: " -> character 8
    const result = getResult(doc, 1, 8);
    expect(result).toBeDefined();
    expect(result!.insertTexts[0]).toBe(" pending");
  });

  it("replace range covers from after colon to cursor (no space)", () => {
    const doc = `---
status:
---`;
    const result = getResult(doc, 1, 7);
    expect(result).toBeDefined();
    // colon is at index 6, so replace starts at 7
    expect(result!.replaceColumns).toEqual([7, 7]);
  });

  it("replace range covers from after colon to cursor (with space)", () => {
    const doc = `---
status:
---`;
    const result = getResult(doc, 1, 8);
    expect(result).toBeDefined();
    // colon is at index 6, replace starts at 7, cursor at 8
    // replaces the existing space, then inserts " value"
    expect(result!.replaceColumns).toEqual([7, 8]);
  });

  it("applying insert text produces correct YAML (no space case)", () => {
    const line = "status:";
    const result = getResult(`---\n${line}\n---`, 1, 7);
    expect(result).toBeDefined();
    const [start, end] = result!.replaceColumns;
    const applied = line.substring(0, start) + result!.insertTexts[0] + line.substring(end);
    expect(applied).toBe("status: pending");
  });

  it("applying insert text produces correct YAML (space case)", () => {
    const line = "status: ";
    const result = getResult(`---\n${line}\n---`, 1, 8);
    expect(result).toBeDefined();
    const [start, end] = result!.replaceColumns;
    const applied = line.substring(0, start) + result!.insertTexts[0] + line.substring(end);
    expect(applied).toBe("status: pending");
  });
});
