# taskmd VSCode Extension

Real-time frontmatter validation and autocompletion for taskmd markdown files.

## Features

- **Live diagnostics**: Errors and warnings appear as you type, matching the rules from `taskmd validate`
- **Required fields**: Flags missing or empty `id` and `title`
- **Enum validation**: Checks `status`, `priority`, `effort`, and `type` against allowed values
- **Array type checking**: Catches scalar values where arrays are expected (`dependencies`, `tags`, `touches`, `context`, `pr`)
- **Date format validation**: Ensures `created` uses `YYYY-MM-DD` format
- **Verify step validation**: Checks that verify steps have required fields (`type`, `run` for bash, `check` for assert)
- **Autocompletion**: Suggests valid enum values when typing `status:`, `priority:`, `effort:`, or `type:`

## Activation

The extension activates on markdown files. Diagnostics only appear for files whose path contains `/tasks/`.

## Installation

### From VSIX

```bash
cd apps/vscode
pnpm install
pnpm run package
code --install-extension taskmd-0.0.10.vsix
```

### Development

```bash
cd apps/vscode
pnpm install
pnpm run watch
# Then press F5 in VSCode to launch the Extension Development Host
```

## Testing

```bash
pnpm run test
```
