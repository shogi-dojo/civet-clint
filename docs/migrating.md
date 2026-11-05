# Migrating a JS/TS Codebase to Civet

Because Civet is a superset of JS/TSX, migrating codebases to Civet does not require a separate decompiler or manual line-by-line translation. In empirical testing against real-world projects, over 97% of JS/TSX files (133 of 137 in one real-world React codebase) parse and compile cleanly as Civet with zero manual source edits.

`clint convert` renames JS/TS files to `.civet` and fixes them in one pass:

```bash
# Convert every JS/TS file in a directory
npx clint convert src/components

# Convert specific files
npx clint convert src/**/*.test.jsx
```

For each file it:

1. Verifies that the source parses cleanly under the project's resolved Civet dial (`civet.json` / `clint.config.json`).
2. Checks that the destination `.civet` file does not already exist (never clobbers).
3. Renames the file in place via `fs.rename` (Git records an `R100` clean rename).
4. Runs the autofix pipeline in **phase order** (see below).

Declaration files (`.d.ts`, `.d.mts`, `.d.cts`) and `.mjs`/`.cjs` files are skipped.

## Why renaming alone is not enough

A JS file that parses as Civet does not necessarily *mean* the same thing. Two
constructs change behaviour silently the moment the extension changes:

```js
// 1. A braced arrow body becomes an OBJECT LITERAL, not a statement block.
it('x', () => {
  expect(a).toBe(1)      //  compiles to:  it('x', () =>( { toBe: expect(a).toBe(1) }))
})                       //  side effects still run, so the test passes — but the
                         //  arrow now returns an object instead of the last value.

// 2. A concise arrow ending in `;` collapses into a block that discards its value.
const make = () => new QueryClient({ ... });
                         //  compiles to:  () => { new QueryClient({...}); }
                         //  make() now returns undefined.
```

Both compile cleanly and neither is reported by a lint pass over the resulting
`.civet`, which is why `clint convert` repairs them during conversion rather than
leaving them to be found later. The rules are `style/no-braced-arrow-body` and
`style/no-discarded-arrow-return`; both run in the `repair` phase.

## Rule phases

Rules declare a phase, and `clint convert` runs them in order, re-parsing between each
so a later phase sees the text earlier phases produced:

| phase | purpose | gate |
| --- | --- | --- |
| `repair` | Fixes a mis-compilation. Emitted output changes **by design**. | The targeted defect must be present before and absent after. |
| `declaration` | Converts a guarded named arrow to a function declaration before body-style rewrites. | Emitted output must match modulo that rule's declared delta. |
| `idiom` | The default. Output-preserving style fixes. | Emitted output must be byte-identical (modulo a declared delta). |
| `cleanup` | Fixes that only become correct once earlier phases have run. | Same as `idiom`. |

Ordering is load-bearing, not cosmetic. In a braced arrow body the trailing
semicolon is what stops Civet reparsing the block as an object literal, so
`style/no-trailing-semicolons` (phase `cleanup`) must not judge the body until
`style/no-braced-arrow-body` (phase `repair`) has de-braced it. Running them in one
pass would have each rule judging text the other is about to replace.

`style/prefer-function-declaration` runs in `declaration` so it can convert a
named arrow first; the `idiom` phase then sees and de-indents the resulting
function body without competing for the same source range.

Because a `repair` changes emitted output on purpose, the byte-equality gate cannot
verify it. Its gate is defect-specific instead — the mis-compilation must be present
before and gone after — so a repair rule cannot use the phase as a licence to make
arbitrary edits. **Behaviour is ultimately verified by your own test suite: run it
after `clint convert`.**

## What to expect

Compiling cleanly is not the same as passing. Budget for review:

- Files whose arrow bodies could not be repaired mechanically (a body declaring
  `const`/`let` is already a real block; `act(=> ...)` changes meaning if it gains
  an implicit return) are reported, not rewritten.
- A handful of files may need a Prettier pass first: a wrapped arrow argument
  followed by a trailing comma (`f((id) =>\n  g(id),\n)`) does not parse as Civet.
- Run `clint convert`, then run your test suite, then review the diff. Do not assume a
  clean `clint` run means the conversion was semantically neutral.
