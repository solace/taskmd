# get-task Benchmark — Iteration 1

**Commit:** `6878c4c` ("prepare benchmarks")
**Date:** 2026-03-13

## Test Conditions

| Config | Setup |
|--------|-------|
| **with_skill** | `taskmd init` project + CLAUDE.md + .taskmd.yaml + TASKMD_SPEC.md + `taskmd:get-task` skill + `taskmd` on PATH |
| **without_skill** | Bare project — only raw task `.md` files. No CLAUDE.md, no config, no spec, no skills, **`taskmd` blocked from PATH** |

## Results

| Eval | Prompt | with_skill | without_skill | Delta |
|------|--------|:----------:|:-------------:|:-----:|
| 2 | "show me the details of task 001" | 100% | 67% | **+33%** |

## Assertion Detail

| Assertion | with_skill | without_skill | Discriminating? |
|-----------|:----------:|:-------------:|:---------------:|
| `runs-get` — Runs taskmd get with the task ID | PASS | FAIL | Yes |
| `reads-file` — Reads the task file for full details | PASS | PASS | No |
| `shows-details` — Presents ID, title, status, priority, tags, and description | PASS | PASS | No |

## Timing & Cost

| Eval | with_skill | without_skill | Delta |
|------|-----------|---------------|-------|
| 2 | 13.0s / 491 tok / $0.116 | 15.4s / 514 tok / $0.098 | **-2.4s** / +$0.018 |

## Analysis

**The get-task skill shows a +33% quality improvement and is faster, but the quality gain is partially from an implementation-specific assertion.**

### Quality
With-skill passes 3/3 assertions (100%) while without-skill passes 2/3 (67%). The only discriminating assertion is `runs-get` — whether `taskmd get` was used. Both configs produce equivalent user-facing output with all task details presented correctly.

### Non-Discriminating Assertions
- `reads-file` and `shows-details` pass for both configs. Claude natively reads markdown files and extracts YAML frontmatter without any skill guidance.

### Performance
- **Duration**: with-skill is **2.4s faster** (13.0s vs 15.4s) — the skill provides a direct path via `taskmd get` instead of requiring file discovery
- **Turns**: with-skill uses fewer turns (4 vs 5)
- **Cost**: with-skill costs $0.018 more ($0.116 vs $0.098) due to context loading overhead

### Key Insight
The get-task skill's real value is **speed** — it gives Claude a direct command to retrieve task details rather than discovering and reading files manually. The quality delta is largely from the implementation-specific `runs-get` assertion. Output quality is equivalent in both configs.

## Recommendations

1. **Replace `runs-get` with output-focused assertions** — e.g., "shows subtask progress" or "includes acceptance criteria" to test real quality differences
2. **Test with ambiguous queries** — e.g., "show me the SSO bug" (by title, not ID) to test where `taskmd get` adds value over raw file reading
3. **Test with larger task sets** (50+ tasks) where file discovery becomes slower
4. **Add assertions for edge cases** — non-existent task IDs, partial matches, multiple matches

## Files

- `benchmark.json` — machine-readable results with timing
- `eval_metadata.json` — assertions and grades
- `with_skill/outputs/` — result.md, timing.json, raw_output.jsonl
- `without_skill/outputs/` — result.md, timing.json, raw_output.jsonl
