# Import TODOs - Discovery Results

Found 12 TODO comments:

```
  #  | Marker | File                                          | Text
-----|--------|-----------------------------------------------|------------------------------------------
  1  | TODO   | apps/cli/internal/cli/graph.go:76              | refactor to reduce complexity
  2  | TODO   | apps/cli/internal/cli/snapshot.go:82            | refactor to reduce length
  3  | TODO   | apps/cli/internal/todos/parser.go:11            | item. (false positive: doc comment)
  4  | TODO   | apps/cli/internal/todos/parser.go:52            | items from comments. (false positive: doc comment)
  5  | TODO   | apps/cli/internal/todos/scanner.go:38           | items found. (false positive: doc comment)
  6  | TODO   | apps/cli/internal/todos/scanner.go:85           | item. Uses SHA-256 of file + marker + text, truncated to 12 hex chars. (false positive: doc comment)
  7  | TODO   | apps/cli/internal/watcher/watcher.go:35         | refactor to reduce complexity
  8  | TODO   | sdk/go/board/board.go:20                        | refactor to reduce complexity
  9  | TODO   | sdk/go/graph/graph.go:130                       | refactor to reduce complexity
 10  | TODO   | sdk/go/graph/graph.go:302                       | refactor to reduce complexity
 11  | TODO   | sdk/go/scanner/scanner.go:66                    | refactor to reduce complexity
 12  | TODO   | sdk/go/validator/validator.go:239               | refactor to reduce complexity
```

## Notes

- **No duplicates found** against existing tasks.
- **Items 3-6 are false positives**: These are Go doc comments in the `todos` package that mention "TODO" as part of describing the TODO-scanning feature itself (e.g., `// BlameInfo holds git blame metadata for a TODO item.`). They are not actionable TODOs.
- **Items 1-2, 7-12 are genuine TODOs**: These are `// TODO:` comments indicating code that should be refactored to reduce complexity or length.
- **6 of the 8 genuine TODOs** share the same text: "refactor to reduce complexity", spread across different packages (`cli`, `watcher`, `board`, `graph`, `scanner`, `validator`).

## Summary of Genuine TODOs

| # | File | Text |
|---|------|------|
| 1 | `apps/cli/internal/cli/graph.go:76` | refactor to reduce complexity |
| 2 | `apps/cli/internal/cli/snapshot.go:82` | refactor to reduce length |
| 3 | `apps/cli/internal/watcher/watcher.go:35` | refactor to reduce complexity |
| 4 | `sdk/go/board/board.go:20` | refactor to reduce complexity |
| 5 | `sdk/go/graph/graph.go:130` | refactor to reduce complexity |
| 6 | `sdk/go/graph/graph.go:302` | refactor to reduce complexity |
| 7 | `sdk/go/scanner/scanner.go:66` | refactor to reduce complexity |
| 8 | `sdk/go/validator/validator.go:239` | refactor to reduce complexity |
