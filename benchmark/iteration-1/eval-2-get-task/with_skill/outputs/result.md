# Task 042: Add Claude Code Plugin with taskmd skill

| Field | Value |
|-------|-------|
| **ID** | cli-042 |
| **Title** | Add Claude Code Plugin with taskmd skill |
| **Status** | completed |
| **Priority** | low |
| **Effort** | medium |
| **Tags** | cli, integration, claude-code, dx, plugin, mvp |
| **Created** | 2026-02-08 |
| **Location** | tasks/archive/cli/042-claude-code-plugin.md (archived) |

## Objective

Create a Claude Code Plugin that provides a `taskmd` skill, allowing users to easily install and use taskmd CLI functionality directly within Claude Code sessions.

## Context

Claude Code supports plugins that can provide custom skills for enhanced workflows. By packaging taskmd as a Claude Code Plugin, users can:

- Install taskmd functionality with `claude code plugins install taskmd`
- Use `/taskmd` slash commands within Claude Code sessions
- Get contextual help and task management capabilities integrated into their Claude workflow
- Avoid manual CLI setup and have Claude automatically understand taskmd conventions

This will significantly improve the DX for users who want to use taskmd with Claude Code.

## Implementation Tasks

### Plugin Structure

- [ ] Create `claude-code-plugin/` directory at project root
- [ ] Create plugin manifest file (e.g., `plugin.json` or `manifest.yaml`)
- [ ] Document plugin file structure

### Skill Definition

- [ ] Define `taskmd` skill with common operations (list, next, validate, stats, graph)
- [ ] Create skill prompt/instructions file
- [ ] Add parameter handling for directory path, format options, filter options

### Integration

- [ ] Configure skill to invoke taskmd CLI commands
- [ ] Handle output formatting for Claude context
- [ ] Add error handling and user feedback
- [ ] Test skill invocation from Claude Code

### Documentation

- [ ] Create README with installation instructions, usage examples, troubleshooting
- [ ] Update main project README with plugin information
- [ ] Add plugin to any relevant package registries

### Testing

- [ ] Test plugin installation process
- [ ] Verify skill invocation works correctly
- [ ] Test with various directory structures
- [ ] Ensure error messages are helpful
- [ ] Test integration with existing task workflows

## Acceptance Criteria

- Claude Code Plugin manifest exists with proper metadata
- `taskmd` skill is defined with clear capabilities
- Skill can be invoked with `/taskmd` in Claude Code
- Plugin can access and execute taskmd CLI commands
- Documentation covers installation and usage
- Plugin follows Claude Code plugin best practices
- Users can install with a single command
- Skill provides contextual help within Claude sessions

## Example Skill Usage

```
User: /taskmd list --status pending
Claude: [Invokes taskmd CLI and shows pending tasks]

User: /taskmd next
Claude: [Shows next recommended task with context]

User: /taskmd validate
Claude: [Validates task files and reports issues]
```

## Dependencies

- Requires taskmd CLI to be available (either bundled or installed)
- May need to update CLI for better machine-readable output
- Depends on Claude Code plugin system capabilities

## References

- Claude Code Plugin Documentation
- Existing CLAUDE.md template (task 036)
- Taskmd CLI commands and output formats

## Notes

- Consider whether plugin should bundle the CLI binary or require separate installation
- Skill should gracefully handle cases where CLI is not installed
- Think about cross-platform compatibility (macOS, Linux, Windows)
- Could include a "setup" subcommand to verify/install taskmd CLI
