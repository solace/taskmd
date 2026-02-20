import * as vscode from "vscode";
import type { ParsedFrontmatter } from "./frontmatter";
import type { ValidationIssue } from "./validate";

/**
 * Convert validation issues into VSCode diagnostics using position data
 * from the parsed frontmatter.
 */
export function toDiagnostics(
  issues: ValidationIssue[],
  frontmatter: ParsedFrontmatter
): vscode.Diagnostic[] {
  return issues.map((issue) => {
    const range = issueRange(issue, frontmatter);
    const severity =
      issue.severity === "error"
        ? vscode.DiagnosticSeverity.Error
        : vscode.DiagnosticSeverity.Warning;

    const diag = new vscode.Diagnostic(range, issue.message, severity);
    diag.source = "taskmd";
    return diag;
  });
}

function issueRange(
  issue: ValidationIssue,
  fm: ParsedFrontmatter
): vscode.Range {
  const field = fm.fields.get(issue.field);

  if (!field) {
    // Missing field — highlight the closing `---` line
    return new vscode.Range(fm.endLine, 0, fm.endLine, 3);
  }

  if (issue.target === "key") {
    return toVscodeRange(field.keyRange);
  }

  // Default to value range for "value" and "block" targets when field exists
  return toVscodeRange(field.valueRange);
}

function toVscodeRange(range: {
  start: { line: number; col: number };
  end: { line: number; col: number };
}): vscode.Range {
  return new vscode.Range(
    range.start.line,
    range.start.col,
    range.end.line,
    range.end.col
  );
}
