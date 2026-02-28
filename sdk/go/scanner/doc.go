// Package scanner walks directory trees to discover and parse task files.
//
// It produces a [ScanResult] containing all parsed [model.Task] values found
// under a root directory, grouping tasks by their parent directory.
package scanner
