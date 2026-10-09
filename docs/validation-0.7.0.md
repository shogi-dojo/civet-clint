# 0.7.0 merge validation — 2026-10-09

This validates the unpublished 0.7.0 branch. No tag or npm publication is part of this work.

## Real source corpora

Each corpus used its own Civet 0.11.15 and `civet.json`. Fixes ran on scratch copies; Ranked-Telegram-App was never modified.

| Corpus/config | Files | First-pass fixes | Final fixes | Compiler gate failures at convergence |
| --- | ---: | ---: | ---: | ---: |
| Ranked, house `coffee-react` | 585 | 4,336 | 0 | 0 |
| Ranked, `civet-idiomatic` with the project dial | 585 | 12,780 | 0 | 0 |
| Riichi Dojo frontend, house config | 1,098 | 5,036 | 0 | 0 |

Every original and fixed file was independently compiled and compared. House Ranked: 564 byte-identical emits and 21 approved style differences. Idiomatic Ranked: 345 byte-identical emits and 240 approved style differences. Riichi: 1,077 byte-identical emits and 21 approved style differences. None failed compilation or contained an unexplained output change.

The independent comparison canonicalizes guarded function/range rewrites before declaration normalization, which otherwise erases their `const` markers. Prefix/postfix increment in a loop update is equivalent because its value is discarded. Existing quote, semicolon, comma, brace, whitespace, type/return-parenthesis, inequality, constructor and placeholder normalizers cover the other declared style deltas.

The corpus uncovered and now covers: synthetic `unless` negation in membership; real `not` in implicit membership calls; conditional slice bounds; constructor grouping in conditional branches; and an arrow repair that incorrectly discarded an object key after property shorthand. The last defect was found by the independent emit comparison, not by the intentionally permissive repair phase.

Report-only residue remains: strict null/undefined comparisons, blocks whose de-bracing changes output, guarded declaration suggestions and switch suggestions. No unsafe fix was accepted to eliminate these findings.

## Graph visualiser fork

Pinned compiler: Civet 0.11.5. The fork has a stable fix pass with zero errors and 20 non-fixable warnings. All seven files were compiled against `d1ad47c`; only approved style differences remain. The differences against `695a19f` retain the previously reviewed declaration, JSX/layout and `allowedEdgeIds` loop changes described in fork PR #1.

The follow-up removes 54 explicit return keywords. Generated output is committed separately from the three callback-arrow hand edits. Typechecking, 45 tests, production build and browser orientation, undo/redo and example switching passed.

## Runtime

On an unchanged five-file visualiser source snapshot, using the project compiler and median of three runs, lint time fell from 4,668 ms to 2,695 ms (42%). `prefer-unless` fell from 2,003 ms to 32 ms by avoiding unprovable edits and duplicate verification.

A settled Ranked house fix pass took 133 seconds at `-j 2`; the preceding pass, which removed six remaining edits, took 805 seconds. This is a convergence measurement, not an identical-input benchmark. Stable files now use one parse and one emit rather than repeating every phase; fixable and repair findings still enter the verified phase pipeline. Tests count compiler calls and cover both stable and repair inputs.

`npm run release:check` passed, including the packed consumer smoke test, with 751 tests. Node 20/22/24 CI must pass on the pushed head before merging.
