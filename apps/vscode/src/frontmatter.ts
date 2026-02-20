import { parseDocument, LineCounter, isMap, isPair, isScalar, isSeq } from "yaml";

/** Line/column position in the document (0-based lines, 0-based columns). */
export interface Position {
  line: number;
  col: number;
}

/** A range in the document. */
export interface Range {
  start: Position;
  end: Position;
}

/** A parsed frontmatter field with its key/value positions. */
export interface FrontmatterField {
  key: string;
  value: unknown;
  keyRange: Range;
  valueRange: Range;
}

/** Result of parsing frontmatter from a document. */
export interface ParsedFrontmatter {
  fields: Map<string, FrontmatterField>;
  /** Line number of the opening `---`. */
  startLine: number;
  /** Line number of the closing `---`. */
  endLine: number;
  /** YAML parse errors, if any. */
  errors: Array<{ message: string; range: Range }>;
}

/**
 * Find the opening and closing `---` delimiters in a markdown document.
 * Returns the line numbers and the YAML text between them, or null if not found.
 */
export function findFrontmatterBounds(
  text: string
): { startLine: number; endLine: number; yamlText: string } | null {
  const lines = text.split("\n");

  // Opening delimiter must be at the very first line
  if (lines.length === 0 || lines[0].trim() !== "---") {
    return null;
  }

  // Find closing delimiter
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      const yamlLines = lines.slice(1, i);
      return {
        startLine: 0,
        endLine: i,
        yamlText: yamlLines.join("\n"),
      };
    }
  }

  return null; // Unclosed frontmatter
}

/**
 * Parse frontmatter from a markdown document string.
 * Returns field positions mapped to their document-level line/col.
 */
export function parseFrontmatter(text: string): ParsedFrontmatter | null {
  const bounds = findFrontmatterBounds(text);
  if (!bounds) {
    return null;
  }

  const { startLine, endLine, yamlText } = bounds;
  // Offset: YAML content starts at line 1 (after opening `---`)
  const yamlLineOffset = startLine + 1;

  const lineCounter = new LineCounter();
  const doc = parseDocument(yamlText, { lineCounter, keepSourceTokens: true });

  const errors: Array<{ message: string; range: Range }> = [];
  for (const err of doc.errors) {
    const pos = err.pos;
    const startPos = lineCounter.linePos(pos[0]);
    const endPos = lineCounter.linePos(pos[1]);
    errors.push({
      message: err.message,
      range: {
        start: { line: startPos.line - 1 + yamlLineOffset, col: startPos.col - 1 },
        end: { line: endPos.line - 1 + yamlLineOffset, col: endPos.col - 1 },
      },
    });
  }

  const fields = new Map<string, FrontmatterField>();
  const contents = doc.contents;

  if (isMap(contents)) {
    for (const item of contents.items) {
      if (!isPair(item)) continue;

      const keyNode = item.key;
      if (!isScalar(keyNode) || typeof keyNode.value !== "string") continue;

      const fieldName = keyNode.value;
      const keyRange = nodeRange(keyNode, lineCounter, yamlLineOffset);

      let value: unknown;
      let valueRange: Range;

      const valNode = item.value;
      if (valNode && valNode.range) {
        valueRange = nodeRange(valNode, lineCounter, yamlLineOffset);
        if (isScalar(valNode)) {
          value = valNode.value;
        } else if (isSeq(valNode)) {
          value = valNode.toJSON();
        } else if (isMap(valNode)) {
          value = valNode.toJSON();
        } else {
          value = valNode.toJSON?.() ?? null;
        }
      } else {
        // Missing value — point at end of key
        valueRange = { start: keyRange.end, end: keyRange.end };
        value = null;
      }

      fields.set(fieldName, { key: fieldName, value, keyRange, valueRange });
    }
  }

  return { fields, startLine, endLine, errors };
}

function nodeRange(
  node: { range?: [number, number, number] | null },
  lineCounter: LineCounter,
  yamlLineOffset: number
): Range {
  if (!node.range) {
    return { start: { line: 0, col: 0 }, end: { line: 0, col: 0 } };
  }
  const [start, end] = node.range;
  const startPos = lineCounter.linePos(start);
  const endPos = lineCounter.linePos(end);
  return {
    start: { line: startPos.line - 1 + yamlLineOffset, col: startPos.col - 1 },
    end: { line: endPos.line - 1 + yamlLineOffset, col: endPos.col - 1 },
  };
}
