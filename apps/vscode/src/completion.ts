import * as vscode from "vscode";
import { ENUM_FIELDS } from "./schema";
import { findFrontmatterBounds } from "./frontmatter";

/** Result of resolving completions for a line in frontmatter. */
export interface CompletionResult {
  fieldName: string;
  values: readonly string[];
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
  frontmatterEndLine: number
): CompletionResult | undefined {
  if (cursorLine <= frontmatterStartLine || cursorLine >= frontmatterEndLine) {
    return undefined;
  }

  const lineText = lines[cursorLine];
  if (!lineText) return undefined;

  const beforeCursor = lineText.substring(0, cursorCol);
  const match = beforeCursor.match(/^(\w+):\s*$/);
  if (!match) return undefined;

  const fieldName = match[1];
  const allowed = ENUM_FIELDS[fieldName];
  if (!allowed) return undefined;

  // Replace everything after the colon with " value"
  // Handles both "status:" and "status: " correctly
  const colonIndex = lineText.indexOf(":");
  return {
    fieldName,
    values: allowed,
    insertTexts: allowed.map((val) => ` ${val}`),
    replaceColumns: [colonIndex + 1, cursorCol],
  };
}

export class TaskmdCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] | undefined {
    const text = document.getText();
    const bounds = findFrontmatterBounds(text);
    if (!bounds) return undefined;

    const lines = text.split("\n");
    const result = resolveCompletions(
      lines,
      position.line,
      position.character,
      bounds.startLine,
      bounds.endLine
    );
    if (!result) return undefined;

    const replaceRange = new vscode.Range(
      position.line, result.replaceColumns[0],
      position.line, result.replaceColumns[1]
    );

    return result.values.map((val, i) => {
      const item = new vscode.CompletionItem(val, vscode.CompletionItemKind.EnumMember);
      item.insertText = result.insertTexts[i];
      item.range = replaceRange;
      item.detail = `taskmd ${result.fieldName}`;
      return item;
    });
  }
}
