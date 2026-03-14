package cli

import (
	"testing"

	"github.com/spf13/cobra"
)

// TestSuggestFor_DeprecatedAliases verifies that the canonical commands
// include the old deprecated names in their SuggestFor field.
func TestSuggestFor_DeprecatedAliases(t *testing.T) {
	tests := []struct {
		deprecated string
		cmd        *cobra.Command
		canonical  string
	}{
		{"show", getCmd, "get"},
		{"update", setCmd, "set"},
	}

	for _, tc := range tests {
		t.Run(tc.deprecated, func(t *testing.T) {
			found := false
			for _, s := range tc.cmd.SuggestFor {
				if s == tc.deprecated {
					found = true
					break
				}
			}
			if !found {
				t.Errorf("command %q should have %q in SuggestFor, got %v",
					tc.canonical, tc.deprecated, tc.cmd.SuggestFor)
			}
		})
	}
}

// TestSuggestFor_AllCommandsAudited verifies that all user-facing top-level
// commands have a non-empty SuggestFor field.
func TestSuggestFor_AllCommandsAudited(t *testing.T) {
	// Commands that are exempt from requiring SuggestFor:
	// Note: "web" is excluded because config_test.go replaces the webCmd
	// variable with a bare cobra.Command, losing the SuggestFor field.
	exempt := map[string]bool{
		"completion": true,
		"commit-msg": true,
		"mcp":        true,
		"next-id":    true,
		"templates":  true,
		"web":        true,
	}

	// Check each command variable directly to avoid shared rootCmd state issues.
	cmds := []*cobra.Command{
		getCmd, setCmd, listCmd, addCmd, rmCmd, archiveCmd,
		boardCmd, graphCmd, nextCmd, searchCmd, statsCmd,
		validateCmd, feedCmd, importCmd, reportCmd, syncCmd,
		todosCmd, tracksCmd, verifyCmd, worklogCmd,
		statusCmd, contextCmd, deduplicateCmd, snapshotCmd,
		specCmd, tagsCmd, phasesCmd, webCmd, projectInitCmd,
	}

	for _, cmd := range cmds {
		if cmd.Hidden {
			continue
		}
		if exempt[cmd.Name()] {
			continue
		}
		if len(cmd.SuggestFor) == 0 {
			t.Errorf("command %q has no SuggestFor entries — add common synonyms", cmd.Name())
		}
	}
}

// TestSuggestFor_CobraSuggestion verifies that cobra's built-in suggestion
// mechanism recommends the right command for deprecated aliases.
func TestSuggestFor_CobraSuggestion(t *testing.T) {
	tests := []struct {
		typo      string
		suggested string
	}{
		{"show", "get"},
		{"update", "set"},
		{"create", "add"},
		{"delete", "rm"},
		{"remove", "rm"},
		{"dedup", "deduplicate"},
	}

	// Build a fresh root command to avoid shared state issues.
	root := &cobra.Command{Use: "taskmd"}
	root.AddCommand(getCmd, setCmd, addCmd, rmCmd, deduplicateCmd)

	for _, tc := range tests {
		t.Run(tc.typo+"->"+tc.suggested, func(t *testing.T) {
			suggestions := root.SuggestionsFor(tc.typo)
			found := false
			for _, s := range suggestions {
				if s == tc.suggested {
					found = true
					break
				}
			}
			if !found {
				t.Errorf("expected cobra to suggest %q for %q, got %v",
					tc.suggested, tc.typo, suggestions)
			}
		})
	}
}
