import * as vscode from "vscode";
import { ENUM_FIELDS } from "./schema";
import { findFrontmatterBounds } from "./frontmatter";
import { readScopes, type ScopeEntry } from "./config";

/** Result of resolving completions for a line in frontmatter. */
export interface CompletionResult {
  fieldName: string;
  values: readonly string[];
  /** Optional detail text per value. */
  details?: (string | undefined)[];
  /** Insert text for each value (includes leading space). */
  insertTexts: string[];
  /** Column range to replace: [startCol, endCol]. */
  replaceColumns: [number, number];
}

/**
 * Resolve completions for a given document text and cursor position.
 * Pure logic — no vscode dependency.
 */
export function resolveCompletions(
  lines: string[],
  cursorLine: number,
  cursorCol: number,
  frontmatterStartLine: number,
  frontmatterEndLine: number,
  scopes?: readonly ScopeEntry[]
): CompletionResult | undefined {
  if (cursorLine <= frontmatterStartLine || cursorLine >= frontmatterEndLine) {
    return undefined;
  }

  const lineText = lines[cursorLine];
  if (!lineText) return undefined;

  const beforeCursor = lineText.substring(0, cursorCol);

  // Check for enum field completions: "status: "
  const enumMatch = beforeCursor.match(/^(\w+):\s*$/);
  if (enumMatch) {
    const fieldName = enumMatch[1];
    const allowed = ENUM_FIELDS[fieldName];
    if (allowed) {
      const colonIndex = lineText.indexOf(":");
      return {
        fieldName,
        values: allowed,
        insertTexts: allowed.map((val) => ` ${val}`),
        replaceColumns: [colonIndex + 1, cursorCol],
      };
    }
  }

  // Check for touches scope completions
  if (scopes && scopes.length > 0) {
    const touchesResult = resolveTouchesCompletions(
      lines, cursorLine, cursorCol, frontmatterStartLine, scopes
    );
    if (touchesResult) return touchesResult;
  }

  return undefined;
}

/**
 * Resolve completions for touches field values (scope names).
 * Handles block array items (`  - value`) and inline arrays (`touches: [value, `).
 */
export function resolveTouchesCompletions(
  lines: string[],
  cursorLine: number,
  cursorCol: number,
  frontmatterStartLine: number,
  scopes: readonly ScopeEntry[]
): CompletionResult | undefined {
  const lineText = lines[cursorLine];
  if (!lineText) return undefined;

  const beforeCursor = lineText.substring(0, cursorCol);
  const scopeNames = scopes.map((s) => s.name);
  const scopeDetails = scopes.map((s) => s.description);

  // Block array item: "  - value" or "  - " under touches field
  const blockMatch = beforeCursor.match(/^(\s+-\s*)(\S*)$/);
  if (blockMatch) {
    const parentField = findParentField(lines, cursorLine, frontmatterStartLine);
    if (parentField === "touches") {
      const prefixEnd = blockMatch[1].length;
      return {
        fieldName: "touches",
        values: scopeNames,
        details: scopeDetails,
        insertTexts: scopeNames.map((name) => name),
        replaceColumns: [prefixEnd, cursorCol],
      };
    }
  }

  // Inline array: "touches: [val1, " or "touches: ["
  const inlineMatch = beforeCursor.match(/^touches:\s*\[(?:.*,\s*)?(\S*)$/);
  if (inlineMatch) {
    const partial = inlineMatch[1] ?? "";
    const replaceStart = cursorCol - partial.length;
    return {
      fieldName: "touches",
      values: scopeNames,
      details: scopeDetails,
      insertTexts: scopeNames.map((name) => name),
      replaceColumns: [replaceStart, cursorCol],
    };
  }

  return undefined;
}

/**
 * Walk backwards from cursorLine to find the YAML field name that owns
 * the current block array items.
 */
function findParentField(
  lines: string[],
  cursorLine: number,
  frontmatterStartLine: number
): string | null {
  for (let i = cursorLine - 1; i > frontmatterStartLine; i--) {
    const line = lines[i];
    // A top-level field line: "fieldname:" at column 0
    const fieldMatch = line.match(/^(\w[\w-]*):/);
    if (fieldMatch) return fieldMatch[1];
  }
  return null;
}

export class TaskmdCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] | undefined {
    const text = document.getText();
    const bounds = findFrontmatterBounds(text);
    if (!bounds) return undefined;

    const scopes = readScopes(document.uri.fsPath);
    const lines = text.split("\n");
    const result = resolveCompletions(
      lines,
      position.line,
      position.character,
      bounds.startLine,
      bounds.endLine,
      scopes
    );
    if (!result) return undefined;

    const replaceRange = new vscode.Range(
      position.line, result.replaceColumns[0],
      position.line, result.replaceColumns[1]
    );

    return result.values.map((val, i) => {
      const kind = result.fieldName === "touches"
        ? vscode.CompletionItemKind.Value
        : vscode.CompletionItemKind.EnumMember;
      const item = new vscode.CompletionItem(val, kind);
      item.insertText = result.insertTexts[i];
      item.range = replaceRange;
      item.detail = result.details?.[i] ?? `taskmd ${result.fieldName}`;
      return item;
    });
  }
}
