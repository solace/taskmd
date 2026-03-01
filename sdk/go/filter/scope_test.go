package filter

import "testing"

func TestMatchScope(t *testing.T) {
	tests := []struct {
		name    string
		pattern string
		scope   string
		want    bool
	}{
		// Exact match (no wildcards)
		{"exact match", "cli", "cli", true},
		{"exact no match", "cli", "web", false},
		{"exact empty", "", "", true},
		{"exact empty pattern", "", "cli", false},

		// Star wildcard
		{"prefix wildcard", "cli*", "cli", true},
		{"prefix wildcard match", "cli*", "cli-tools", true},
		{"prefix wildcard no match", "cli*", "web", false},
		{"suffix wildcard", "*cli", "cli", true},
		{"suffix wildcard match", "*cli", "my-cli", true},
		{"suffix wildcard no match", "*cli", "web", false},
		{"contains wildcard", "*web*", "web", true},
		{"contains wildcard match", "*web*", "my-web-app", true},
		{"contains wildcard no match", "*web*", "cli", false},

		// Question mark wildcard
		{"question mark", "cl?", "cli", true},
		{"question mark no match", "cl?", "cloo", false},

		// Bracket wildcard
		{"bracket", "cl[ij]", "cli", true},
		{"bracket match", "cl[ij]", "clj", true},
		{"bracket no match", "cl[ij]", "clk", false},

		// Backward compat: no wildcard uses exact equality
		{"no wildcard exact", "cli/graph", "cli/graph", true},
		{"no wildcard no match", "cli/graph", "cli/next", false},

		// Malformed pattern
		{"malformed bracket", "cli[", "cli", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := MatchScope(tt.pattern, tt.scope)
			if got != tt.want {
				t.Errorf("MatchScope(%q, %q) = %v, want %v", tt.pattern, tt.scope, got, tt.want)
			}
		})
	}
}

func TestContainsWildcard(t *testing.T) {
	tests := []struct {
		input string
		want  bool
	}{
		{"cli", false},
		{"cli*", true},
		{"*cli*", true},
		{"cl?", true},
		{"cl[ij]", true},
		{"", false},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			if got := containsWildcard(tt.input); got != tt.want {
				t.Errorf("containsWildcard(%q) = %v, want %v", tt.input, got, tt.want)
			}
		})
	}
}
