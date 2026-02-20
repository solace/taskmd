import { describe, it, expect } from "vitest";
import { findFrontmatterBounds, parseFrontmatter } from "../src/frontmatter";

describe("findFrontmatterBounds", () => {
  it("finds valid frontmatter bounds", () => {
    const text = `---
id: "042"
title: "My task"
---
# Body`;
    const result = findFrontmatterBounds(text);
    expect(result).not.toBeNull();
    expect(result!.startLine).toBe(0);
    expect(result!.endLine).toBe(3);
    expect(result!.yamlText).toBe('id: "042"\ntitle: "My task"');
  });

  it("returns null when no frontmatter", () => {
    const text = "# Just a heading\nSome text.";
    expect(findFrontmatterBounds(text)).toBeNull();
  });

  it("returns null when opening delimiter not on first line", () => {
    const text = `
---
id: "042"
---`;
    expect(findFrontmatterBounds(text)).toBeNull();
  });

  it("returns null for unclosed frontmatter", () => {
    const text = `---
id: "042"
title: "Unclosed"`;
    expect(findFrontmatterBounds(text)).toBeNull();
  });

  it("handles empty frontmatter", () => {
    const text = `---
---
# Body`;
    const result = findFrontmatterBounds(text);
    expect(result).not.toBeNull();
    expect(result!.yamlText).toBe("");
    expect(result!.endLine).toBe(1);
  });
});

describe("parseFrontmatter", () => {
  it("parses fields with correct values", () => {
    const text = `---
id: "042"
title: "My task"
status: pending
priority: high
---
# Body`;
    const result = parseFrontmatter(text);
    expect(result).not.toBeNull();
    expect(result!.fields.size).toBe(4);
    expect(result!.fields.get("id")!.value).toBe("042");
    expect(result!.fields.get("title")!.value).toBe("My task");
    expect(result!.fields.get("status")!.value).toBe("pending");
    expect(result!.fields.get("priority")!.value).toBe("high");
  });

  it("returns correct line positions for keys", () => {
    const text = `---
id: "042"
title: "My task"
---`;
    const result = parseFrontmatter(text);
    expect(result).not.toBeNull();

    const idField = result!.fields.get("id")!;
    // "id" is on line 1 (0-based), col 0
    expect(idField.keyRange.start.line).toBe(1);
    expect(idField.keyRange.start.col).toBe(0);

    const titleField = result!.fields.get("title")!;
    // "title" is on line 2 (0-based), col 0
    expect(titleField.keyRange.start.line).toBe(2);
    expect(titleField.keyRange.start.col).toBe(0);
  });

  it("parses array fields (flow style)", () => {
    const text = `---
id: "042"
title: "Test"
tags: [cli, backend]
---`;
    const result = parseFrontmatter(text);
    expect(result).not.toBeNull();
    expect(result!.fields.get("tags")!.value).toEqual(["cli", "backend"]);
  });

  it("parses array fields (block style)", () => {
    const text = `---
id: "042"
title: "Test"
dependencies:
  - "040"
  - "041"
---`;
    const result = parseFrontmatter(text);
    expect(result).not.toBeNull();
    expect(result!.fields.get("dependencies")!.value).toEqual(["040", "041"]);
  });

  it("parses empty array", () => {
    const text = `---
id: "042"
title: "Test"
tags: []
---`;
    const result = parseFrontmatter(text);
    expect(result).not.toBeNull();
    expect(result!.fields.get("tags")!.value).toEqual([]);
  });

  it("returns null for document without frontmatter", () => {
    expect(parseFrontmatter("# Just markdown")).toBeNull();
  });

  it("captures YAML parse errors", () => {
    const text = `---
id: "042
title: "Test"
---`;
    const result = parseFrontmatter(text);
    expect(result).not.toBeNull();
    expect(result!.errors.length).toBeGreaterThan(0);
  });

  it("records startLine and endLine", () => {
    const text = `---
id: "042"
title: "Test"
---
body here`;
    const result = parseFrontmatter(text);
    expect(result).not.toBeNull();
    expect(result!.startLine).toBe(0);
    expect(result!.endLine).toBe(3);
  });

  it("handles date values", () => {
    const text = `---
id: "042"
title: "Test"
created: 2026-02-14
---`;
    const result = parseFrontmatter(text);
    expect(result).not.toBeNull();
    // YAML parser may return a Date object for unquoted dates
    const val = result!.fields.get("created")!.value;
    expect(val).toBeDefined();
  });

  it("parses verify steps", () => {
    const text = `---
id: "042"
title: "Test"
verify:
  - type: bash
    run: "echo hello"
  - type: assert
    check: "file exists"
---`;
    const result = parseFrontmatter(text);
    expect(result).not.toBeNull();
    const verify = result!.fields.get("verify")!.value;
    expect(Array.isArray(verify)).toBe(true);
    expect((verify as any[]).length).toBe(2);
    expect((verify as any[])[0].type).toBe("bash");
    expect((verify as any[])[0].run).toBe("echo hello");
  });
});
