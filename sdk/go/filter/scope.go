package filter

import (
	"path/filepath"
	"strings"
)

// MatchScope checks whether a scope value matches a pattern.
// If the pattern contains wildcard characters (*, ?, [), it uses
// filepath.Match for glob-style matching. Otherwise, it falls back
// to exact string equality for backward compatibility.
func MatchScope(pattern, scope string) bool {
	if containsWildcard(pattern) {
		matched, err := filepath.Match(pattern, scope)
		if err != nil {
			return false
		}
		return matched
	}
	return pattern == scope
}

func containsWildcard(s string) bool {
	return strings.ContainsAny(s, "*?[")
}
