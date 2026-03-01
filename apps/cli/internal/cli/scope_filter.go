package cli

import (
	"fmt"
	"os"

	"github.com/spf13/viper"

	"github.com/driangle/taskmd/sdk/go/filter"
	"github.com/driangle/taskmd/sdk/go/model"
)

// filterTasksByScope returns tasks whose touches field matches the given scope pattern.
func filterTasksByScope(tasks []*model.Task, scope string) []*model.Task {
	var filtered []*model.Task
	for _, task := range tasks {
		for _, t := range task.Touches {
			if filter.MatchScope(scope, t) {
				filtered = append(filtered, task)
				break
			}
		}
	}
	return filtered
}

// warnUnknownScope prints a warning to stderr if the scope pattern doesn't match
// any configured scope in .taskmd.yaml.
func warnUnknownScope(scope string) {
	known := loadScopesConfig()
	if known == nil {
		return
	}

	for name := range known {
		if filter.MatchScope(scope, name) {
			return
		}
	}

	fmt.Fprintf(os.Stderr, "Warning: scope %q does not match any configured scope\n", scope)
}

// loadScopesConfig reads the scopes map from .taskmd.yaml configuration.
func loadScopesConfig() map[string]bool {
	raw := viper.Get("scopes")
	if raw == nil {
		return nil
	}

	scopeMap, ok := raw.(map[string]any)
	if !ok {
		return nil
	}

	known := make(map[string]bool, len(scopeMap))
	for name := range scopeMap {
		known[name] = true
	}
	return known
}
