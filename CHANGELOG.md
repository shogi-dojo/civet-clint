# Changelog

All notable changes to `civet-clint` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.7.0] - 2026-08-24

### Added

- **12 new fixable style rules** implementing idiomatic Civet conventions from Erik Demaine's official Civet style guide:
  - `style/prefer-unless`: rewrites `if not X` and `if (!X)` to `unless X` with AST precedence guards on binary operators and existential checks.
  - `style/prefer-at-shorthand`: rewrites `this.x`, `this?.x`, `this[k]`, `this.#p`, and bare `this` to `@x`, `@?.x`, `@[k]`, `@#p`, and `@`.
  - `style/prefer-length-shorthand`: rewrites `arr.length` and `arr?.length` to `arr#` and `arr?#`.
  - `style/prefer-typeof-shorthand`: rewrites `typeof x is "type"` and `typeof x === "type"` to `x <? "type"`.
  - `style/prefer-property-shorthand`: rewrites `{ b: a.b }` and `{ c: a.b.c }` to `{ a.b }` and `{ a.b.c }`.
  - `style/prefer-optional-type`: now **autofixes** `T | undefined` → `T?` (style-guide item 5) via a new `type-paren-style` output delta -- the emit differs only by parentheses Civet wraps around lowered union types `(T | undefined)`. Guarded to exactly two union members, skip when already ending in `?`, and skips intersection types `(a | b) & c`.
  - `style/prefer-implicit-return`: drops explicit trailing `return` keywords from function bodies, method declarations, and arrows, with guards for generators, object literal returns, and loop bodies.
  - `style/prefer-bare-for`: rewrites `for const x of xs` and `for (const x of xs)` to `for x of xs`.
  - `style/prefer-bare-conditions`: strips outer parentheses from `if`, `unless`, `while`, and `switch` condition expressions under the `whitespace-style` output delta.
  - `style/prefer-postfix-conditional`: now **autofixes** `if (a) return x` → `return x if a` (style-guide item 17), via a new `block-brace-style` output delta -- the emit differs by exactly `if (a) return x` vs `if (a) { return x }`. Five shapes are reported without a fix because the postfix form would change or break them: an `else` branch (nowhere to go), an already-`then` one-liner (byte-identical as written), a JSX return value (`return <Navigate to=r replace if cond` parses `if` as a prop), and a braced return value or condition (outside what the normalizer can prove). A **negated** condition is also deferred, to `style/prefer-unless`: both rules match `if (not x) return` and rewrite the same span in opposite directions, and while either pair is fine on its own, a third rule editing the same file makes the engine's combined replay diverge and reject the whole batch -- one 739-line page of the integration corpus was left permanently unfixable with 82 findings. `prefer-unless` owns the shape because its `unless x return` is byte-identical to the input, whereas `return if not x` needs the delta. The message names `if a then return x` as the byte-identical alternative for projects that would rather not rely on the delta.
  - `style/prefer-property-group-shorthand`: groups a run of shorthand properties that share a receiver -- `{ a.b, a.c }` → `{ a.{b,c} }` (style-guide item 10, second half). It matches only the already-shortened form, leaving `b: a.b` to `style/prefer-property-shorthand`, so the two never propose overlapping edits over the same characters; both are in the `civet-idiomatic` preset, so long-form source converges in two passes. The receiver must be a plain identifier: Civet caches a compound one to keep it single-evaluation (`{ a.q.b, a.q.c }` would emit `let ref;{b:(ref = a.q).b,c:ref.c}`), which is a behaviour change rather than a layout one. 146 sites grouped on the 441-file corpus.
  - `style/prefer-unclosed-jsx`: implements style-guide item 22 -- drops a redundant closing tag (`<span>hi</span>` → `<span>hi`) and the `/` from a self-closing tag (`<Foo a=1 />` → `<Foo a=1>`), where indentation already delimits the element. Civet reads an unclosed element's extent from what *follows* it, so the rule fires only when the tag ends its line and the next non-blank line is neither deeper, a closing tag of the same name, nor a `)` / `}` closer -- each of those either reparents the following node or stops the parse. `<pre>` and `<textarea>` keep their closers, per the guide's stated exception. Both halves are one rule because the engine's combined-fix pass re-derives each rule's edits on the text other rules changed; split in two they invalidate each other's next-line guards and the batch is rejected. `closingTags` / `selfClosingSlash` options select one half. Verified on a 441-file React/Civet codebase: 3057 sites rewritten across two passes, zero rejected by the equivalence gate.
- **`civet-idiomatic` preset**: bundles neutral-dial idiom rules covering standard modern Civet style without legacy CoffeeScript options.
- Exported `noDiscardedArrowReturnRule` and `preferIndentedBlocksRule` alongside all new rules in `src/rules/index.civet`.

### Changed

- **New `type-paren-style` output delta.** Strips parentheses around single union types `(T | undefined)` emitted by Civet's lowering of `T?`, while preserving intersection types `(a | b) & c` and array types `(a | b)[]`. Consulted only for rules declaring `type-paren-style`.

- **Widened `style/prefer-implicit-call-args`.** Replaced hardcoded callee lists with structural statement-level guards: fires on any trailing call that forms the entire statement, provided the argument list is non-empty and contains no top-level binary operator, `?`, or `:`.

- **New `block-brace-style` output delta.** The equivalence gate gains a normalizer
  which strips a brace pair that follows a `)` and wraps a single
  statement with no `;`, `{`, `}`, or newline inside. It is anchored on `) {` so
  object literals keep their braces, and it is consulted only for rules that declare
  it, so its blast radius is that rule's own edits. `style/prefer-postfix-conditional`
  is the only rule that declares it today.

- **Widened `style/prefer-indented-blocks` to declaration bodies.** `function f(x) {`,
  `class A {`, and method definitions (`m() {`, `constructor(x) {`, `get v() {`, and
  their `static` / `async` / generator / `#private` / TS-return-type forms) now lose
  their braces the same way statement blocks do; all are byte-identical in emit. The
  parameter list may itself contain braces -- `function C(p: { x: number }) {` is the
  ordinary React component signature, and it kept its braces until the head pattern
  stopped stopping at the first `{`. Method definitions deliberately still do: a
  method head has no keyword to tell it from a call, and `f(a, {b: 1}) {` must not be
  de-braced. A
  block nested inside a function is de-braced in the same pass rather than skipped.
  Arrow bodies are still `style/no-braced-arrow-body`'s, and two shapes are refused
  on purpose: `f(x) { a: 1 }` at statement level is a CALL (`f(x)({a: 1})`), not a
  method, so a method head only counts inside a class body or object literal; and a
  closer carrying anything but a chained `else` / `catch` / `finally` is left alone,
  because an object literal's `},` between properties would be stranded.

- **Widened `style/prefer-indented-blocks` to paren-free heads.** It only
  recognised a head that still had its parens (`if (a) {`), so `if a {` was skipped
  and its braces were stranded -- nothing else in the rule set removes a brace whose
  head is paren-free. That gap is why `style/prefer-unless` and
  `style/prefer-bare-for` each had to refuse a braced head. With it closed,
  `if (not a) { … }` now converges all the way to `unless a` plus an indented body
  in two passes, and the previously stuck `if not a { … }` converges too.

- **Widened `style/prefer-existential-check`**: it now scans tokens rather than a
  single regex, so it also sees reversed operands (`null != x`) and non-identifier
  left-hand sides, and it autofixes the two shapes that are provably equivalent --
  `x != null` → `x?` and `x == null` → `not x?`. Strict (`!==` / `===`) and
  `undefined` comparisons are reported without a fix; see **Fixed** below.

- `style/prefer-implicit-return` is **not** part of the `civet-idiomatic` preset.
  It still proposes fixes the equivalence gate rejects (22 sites on a 441-file
  production codebase), and a rejected fix surfaces as an error, so at `error` in
  a preset it would make `clint --check` fail on conformant code. The rule is
  registered and supported; enable it explicitly.
- **Widened `style/prefer-walrus-declarations`**: added `let x = …` → `x .= …` support and removed the `autoLet` dialect requirement since both `.=` and `:=` compile byte-identically under standard Civet.

### Fixed

- **`style/prefer-existential-check` no longer advertises fixes the gate rejects.**
  `x?` lowers to the *loose* `x != null`, so only `x != null` -> `x?` and
  `x == null` -> `not x?` are behaviour-preserving. The rule attached a fix to
  every shape, including strict `!==` / `===` and comparisons against
  `undefined`, which are genuine behaviour changes (`x !== null` is true for
  `undefined`; `x?` is false). The equivalence gate correctly rejected all of
  them, so `clint` reported "N fixable with --write" on diagnostics that
  `--write` could never apply, on every run. Those shapes are now reported
  without a fix and the message states the reason.

- **`style/prefer-length-shorthand` is now skipped under `coffeeComment`.** With
  that option on, `#` opens a line comment, so `arr#` does not mean `arr.length`
  -- it truncates the line (`const n = arr//`), and in JSX or an arrow body it
  fails to parse outright. The rule reported 391 findings on a 441-file
  `coffeeComment` codebase, every one of them rejected by the equivalence gate.
  It now declares `forbids: ["coffeeComment"]` and is skipped there; the
  shorthand is correct under every other dial.

- **`style/prefer-implicit-return` no longer fires on a `return` that is not the
  function's tail.** Scanning the final entry tuple for a `ReturnStatement` could
  match one belonging to a nested block, and a valueless `return` still presents
  an AST `expression`, so both reached the fix. Because fixes are accepted or
  rejected per rule per file, one bad site also took the valid fixes in that file
  down with it.

- **`style/prefer-property-shorthand` only fires inside braced object literals.**
  The style guide scopes the shorthand to braced objects; in a brace-free,
  indentation-delimited object, `a.name` on its own line is a bare expression
  statement rather than a property.

- **`style/prefer-bare-for` keeps the parens on a single-line `for (...) body`.**
  There the parens separate head from body; dropping them runs the two together.

- **`style/prefer-unless` and `style/prefer-bare-for` defer a braced head to
  `style/prefer-indented-blocks`.** That rule only recognises a head that still
  has its parens, so rewriting `if (not a) {` into `unless a {` -- or stripping
  the parens from `for (const x of xs) {` -- stranded the braces with no rule
  able to remove them. `style/prefer-bare-conditions` already had this guard.

## [0.6.0] - 2026-08-23

### Added

- `-j, --concurrency <n>` runs the lint across a `worker_threads` pool, enabled by
  default at the machine's CPU count. `--concurrency 1` restores the previous
  fully sequential behavior in the main process.
- `scripts/bench.mjs` reports the parse+emit floor, total rule work, and per-rule
  cost for a corpus (`--target`, `--config`, `--runs`, `--json`), so a new rule's
  cost is measurable before release.

### Changed

- Files are linted in parallel by default. Report order is unchanged: results are
  collected by index, so `--format json` output is byte-identical to a sequential
  run at any worker count. Runs of fewer than 8 files stay on the main thread.
- A full check of a 441-file / 54k-line codebase went from **74s to ~15s** (5x
  on a 10-core M1 Max; ~1.4x of that is algorithmic and applies on a single
  core). Contributing changes, each verified byte-identical over that corpus:
  - `style/no-is-not` no longer walks the whole subtree of every node. It called
    `range()` per node, whose fallback walks a node's entire subtree, making the
    rule quadratic; it now uses the new `SyntaxTree.tokenRange()`, which resolves
    only real source tokens.
  - `SyntaxTree` memoizes `commentRanges()`, `stringRanges()`, and `tokens()`.
    These re-walked the AST on every call and ~20 rules call them per file. Over
    a 120-file corpus this cut `walkAst` calls from 450,695 to 9,191.
  - `style/no-trailing-semicolons` reuses the engine's baseline compile instead
    of recompiling the unmodified source. `RuleContext` gained `baselineOutput`
    for this; rules comparing a candidate against untouched output should use it
    rather than calling the compiler again. Compiles inside the rule dropped from
    46 to 13 over an 80-file sample (6744ms to 1298ms). Safety decisions are
    unchanged -- a semicolon that suppresses an implicit return is still kept.

## [0.5.0] - 2026-08-23

### Added

- **`style/prefer-indented-blocks`** -- a new rule for JS-style braced statement
  blocks (`if` / `unless` / `for` / `while` / `switch` / `try` / `catch` /
  `finally`). Civet delimits these bodies by indentation, so both the braces and
  the head parens are migration leftovers. The fix declares the `whitespace-style`
  delta, so the engine verifies that only layout changed.

  Two shapes are reported but deliberately *not* autofixed, because in each the
  "before" side of the equivalence check is itself the bug:

  - A single-statement body ending in `;`. `if (a) { g(); }` parses as an object
    with a method definition (`if (a) ({ g() {; } })`) and `g()` never runs.
  - A block in expression position (the last statement of a function), which
    already mis-parses into a returned object literal. De-bracing *repairs* it, so
    the emitted output legitimately changes and the gate correctly rejects the fix.

  Blocks nested inside a braced `=> { … }` arrow body are skipped entirely --
  de-bracing the inner block while the arrow keeps its braces breaks compilation.
  Those belong to `style/no-braced-arrow-body` first.

- **`--verbose`** reports the resolved config path, the Civet compiler-options
  path, the active preset, the compiler options in effect, any overrides matching
  the first file, and the file count. Written to stderr, so `--format json` stays
  parseable on stdout.

- **`whitespace-style` output delta.** `style/prefer-implicit-block-call` could
  never apply its own fix: dropping the parens moves the closer up a line, so Civet
  emits `})` where it used to emit `}\n)`. The statements are identical, but the
  equivalence gate compared emitted text byte-for-byte and rejected every fix with
  `compiler-equivalence-mismatch`. Adds a fifth `OutputDelta` kind alongside
  quote-, semicolon-, declaration- and trailing-comma-style, with a
  `normalizeWhitespaceStyle` that collapses insignificant whitespace while copying
  string and comment contents through untouched. It runs last in
  `normalizeCombined`, since the earlier normalizers can leave whitespace behind.

### Fixed

- **`style/prefer-indented-object` no longer de-braces objects whose braces are
  load-bearing.** Three separate false positives, each of which silently changed
  meaning rather than failing loudly:

  - **JSX attribute containers.** `editor={` matched the binding regex, so the rule
    proposed de-bracing a JSX attribute value. 24 sites across 11 files -- every one
    a false positive. Fixed by requiring whitespace after `=`, which distinguishes
    `x = {` (a binding) from `attr={` (a JSX container).
  - **Shorthand properties.** De-bracing `{ winnerPlayerId, seat }` leaves
    `winnerPlayerId` alone on a line as a bare identifier expression, and the file
    stops compiling.
  - **Spreads in any position.** The worst of the three: `{ a: 1, ...rest }`
    de-braces to `{a: 1}(...rest)` -- a *call*, which compiles cleanly and is wrong
    at runtime. Found only because a test asserted the wrong thing and failed.

  Detection now splits object entries on top-level commas (depth-tracked, so commas
  inside `()` / `[]` / `{}` don't count), which also catches shorthand appearing
  mid-line: `background: bg, border, boxShadow: shadow` was de-bracing to
  `{background: bg}(border, {…})`.

## [0.4.2] - 2026-08-22

### Fixed

- **`style/no-braced-arrow-body` no longer fires on deliberate object literals.**
  A multi-line object returned from a callback (`xs.map (p) => { userId: p.id ... }`)
  reaches the rule with the same AST shape as a mis-parsed statement block --
  `ParenthesizedExpression` -> `ObjectExpression` -> `Property` -- because Civet has
  already collapsed the two readings. The rule now separates them by how each key was
  derived: a property whose key Civet synthesized from a *call* (`callExpression`)
  cannot be written deliberately, since an object literal names its keys.

  Note that `implicitName` alone is not a usable signal. Civet sets it for legitimate
  shorthand as well, so `{ a, b }` spread across lines carries it on every property;
  keying off it would trade one false positive for another.

  On a real 146-file codebase this removed 6 false positives (129 -> 123 findings),
  every one a genuine object literal in a `.map`/`useMemo` callback. All remaining
  findings are true mis-parses.

## [0.4.1] - 2026-08-22

### Added

- **`style/prefer-walrus-declarations`**: rewrites `const x = …` to Civet's
  declaration operator `x := …`, covering both bare identifiers and destructuring
  patterns:

  ```civet
  const { setRule } = renderStep()   # ->  { setRule } := renderStep()
  ```

  Emitted JS is byte-identical, so the rewrite needs no `OutputDelta` and passes
  the strict equivalence gate unchanged. Only `const` is rewritten: `let`/`var`
  are mutable bindings with no `:=` analogue.

  This is the counterpart to `style/prefer-bare-assignment`, which prefers bare
  `=`. Bare `=` is *not* output-preserving for a `const`: besides the `const`
  -> `let` keyword change, Civet hoists the binding, emitting `let renderStep`
  on a line of its own, split from its assignment. `:=` has neither problem, so
  projects wanting `const` gone from a file should prefer this rule. The two
  rules are mutually `conflictsWith`.

  Verified against a 146-file Civet codebase: 483 `const` keywords across 47
  test files, emitted JS byte-identical on every one.

- **`style/prefer-implicit-block-call`**: drops the call parens on multi-line test
  blocks so indentation closes them, removing the stacked `)))` closers that make
  migrated suites awkward to edit:

  ```civet
  describe('createCacheKey', =>        describe 'createCacheKey', =>
    it('is stable', =>            ->     it 'is stable', =>
      expect(k(b)).toBe(k(b))))            expect(k(b)).toBe(k(b))
  ```

  Applies to `describe`/`it`/`test` plus the `beforeEach`/`afterEach`/`beforeAll`/
  `afterAll` hooks, including member forms (`it.each(cases)(name, fn)`). Fires only
  when the call is in statement position, its last argument is an arrow, and the
  body spans multiple lines -- a single-line call reads fine with its parens.
  Emitted JS is byte-identical.

  Verified against the same codebase: 1402 blocks across 119 of 146 test files.

  `style/no-single-param-arrow-without-parens` now exempts the four hook names, so
  the de-parenthesized `beforeEach => …` it produces is not flagged: a hook callback
  takes no parameters, so that form cannot be an arrow whose parameter is the hook
  name -- the ambiguity the rule warns about cannot arise there.

- **`style/prefer-implicit-call-args`**: drops the call parens on a trailing matcher
  or a `render` call, so the argument list closes the line:

  ```civet
  expect(civetSourcePath(id)).toBe('/a/Foo.civet')   # ->  .toBe '/a/Foo.civet'
  render(<Panel {rules} />)                          # ->  render <Panel {rules} />
  ```

  Restricted to single-line calls in statement position whose argument list is
  non-empty (`toBeNull()` keeps its parens -- bare `toBeNull` is a property read)
  and does not open with an operator (`toBe(-1)` would become a subtraction). JSX
  arguments are exempt from that last check. Emitted JS is byte-identical.

  Verified against the same codebase: 1256 sites across 87 files.

- **`style/prefer-implicit-arrow-arg`**: drops the call parens when a call's sole
  argument is a zero-parameter arrow — a general Civet idiom, not a test-only one:

  ```civet
  decode = vi.fn(=> Promise.resolve())      # ->  vi.fn => Promise.resolve()
  Page := lazy(=> import('./pages/Page'))   # ->  lazy => import('./pages/Page')
  ```

  The rule never fires on an object property followed by more properties: without
  the parens the arrow absorbs them as extra arguments, so `{ play: vi.fn(=> p()),
  x: 1 }` would compile to `{ play: vi.fn(() => p(), {x: 1}) }` — silent corruption
  rather than a parse error. It is also restricted to single-line calls, since a
  wrapped argument list shifts the emitted formatting.

### Changed

- **`style/no-single-param-arrow-without-parens` now exempts known zero-argument
  callees** and accepts an `extraZeroArgCallees` option for project-local ones.
  The rule flags `name => …` because it is ambiguous — a zero-arg call, or an arrow
  whose parameter is `name`? For a callee whose callback provably takes no
  arguments (`beforeEach`, `act`, `waitFor`, `renderHook`, `lazy`, `useState`,
  `useRef`, `useMemo`, `useCallback`, `queueMicrotask`) that ambiguity cannot arise,
  so the terser form the two implicit-call rules produce is no longer flagged.

- **`style/no-trailing-commas` now covers every closer, not just object literals.**
  A comma directly before `)`, `]` or `}` separates nothing when a newline already
  delimits the entries, so the rule now also strips it from argument lists, arrays,
  destructuring patterns and import clauses:

  ```civet
  render(
    <Modal canEdit={=> false} />,   # the comma closes a single-argument call
  )
  ```

  Three constructs stay untouched, because the comma is load-bearing there:
  regex literals (`{5,}` means "five or more", `{5}` means "exactly five"),
  array elisions (`[1, 2,,]` has length 3), and a comma after a rest element
  (`(a, ...rest,)` is a syntax error).

  Verified against a 146-file Civet codebase: 471 commas removed across 104 files,
  emitted JS byte-identical on every one, and the test suite unchanged at
  1694 passing.

## [0.4.0] - 2026-08-21

### Added

- **`clint --rewrite`**: converts JS/TS files to Civet. Verifies the source parses
  under the project's resolved dial, refuses to clobber an existing `.civet`,
  renames via `fs.rename` (so Git records a clean `R100`), then runs the autofix
  pipeline. Skips `.d.ts`/`.d.mts`/`.d.cts` declaration files and `.cjs`.
- **Rule phases** (`repair`, `idiom`, `cleanup`): rules declare a phase and the
  engine runs them in order, re-parsing between phases so a later phase sees the
  text earlier phases produced. This makes ordered dependencies expressible — for
  example, de-bracing an arrow body is what makes its trailing semicolons
  redundant, so the semicolon rule must not run first. `--rewrite` runs the full
  phase order by default.
- **`style/no-braced-arrow-body`** (phase `repair`): detects `=> { ... }` bodies
  that Civet parses as **object literals** rather than statement blocks. Side
  effects still run, so tests pass, but the arrow returns an object instead of the
  last value. Autofix de-braces the body while keeping its semicolons, preserving
  the original JS meaning.
- **`style/no-discarded-arrow-return`** (phase `repair`): detects a concise arrow
  whose trailing semicolon collapses it into a block that evaluates its expression
  and discards the value, so the function silently returns `undefined`
  (`() => new QueryClient({...});`). Only arises when renaming JS to Civet.
- **`style/no-trailing-commas`**: removes a trailing comma before the closing brace
  of an object literal, where Civet lets indentation separate the entries instead.
  Never edits regex literals (`{5,}`), where the comma is load-bearing.
- **`style/prefer-indented-object`**: drops the braces from a multi-line object
  literal bound to a declaration, letting indentation delimit it.
- **Output deltas** `declaration-style` and `trailing-comma-style`, unblocking
  autofix for `style/prefer-bare-assignment` and `style/no-trailing-commas`.
- **CoffeeScript-to-standard migration:** compiler-safe inverse rules for `#`
  comments, `isnt`, and conservative explicit declarations, plus a
  `coffee-to-standard` transition preset.
- **Rule conflict validation:** opposing rule directions are rejected during
  effective-config resolution so autofix runs always converge.

### Fixed

- **`style/no-trailing-commas` no longer edits inside regex literals.** A `{5,}`
  quantifier ends in a comma before `}`, and the rule rewrote it to `{5}` —
  silently changing "five or more" to "exactly five". The equivalence gate could
  not catch this: the rule's own `trailing-comma-style` delta strips commas from
  emitted output on both sides, so the corrupted and original programs normalized
  identically. Regex literals now join strings and templates in
  `collectStringRanges`, so every rule that skips string content skips regex too.
- **`style/no-trailing-semicolons` no longer removes semicolons that suppress an
  implicit return.** Inside a function body a trailing `;` is one of the sanctioned
  ways to stop the last statement becoming the return value; removing it changed
  what the function returned and the equivalence gate rejected the fix. The rule
  now verifies each candidate by compiling with and without it, so it reports only
  removals the gate will accept. Candidates are bisected rather than checked
  individually — a linear scan cost one compile per semicolon and exhausted memory
  on a 900-line file.
- **Nested arrow bodies are fully repaired.** The outer arrow's edit span contains
  the inner one, and overlapping edits are resolved by keeping the outermost, so
  offering both silently dropped the inner fix and left the file half-repaired.
  Only the outermost body carries a fix per pass, and each phase now runs to a
  fixed point so nesting is peeled one layer at a time.
- **`--write` no longer reports a spurious equivalence mismatch for repair rules.**
  A `repair` fix is only applied when the caller opts into that phase (as
  `--rewrite` does). Outside it the mis-compilation is still reported, but the fix
  is withheld rather than offered and then rejected.
- **Multi-rule equivalence references no longer use stale offsets.** The combined
  reference chained each rule's builder against the original source, so a second
  rule's edits were computed against text that no longer existed. Each builder is
  now re-run against the accumulated text.

### Changed

- `normalizeSemicolonStyle` moved to `utils.civet` and is shared by the engine's
  `semicolon-style` delta and `style/no-trailing-semicolons`; a drift between two
  copies would surface as a reported-then-rejected fix.

## [0.3.0] - 2026-08-11

### Added

- **`style/prefer-bare-jsx-values`**: safely removes redundant braces from
  single-line JSX attribute expressions, such as `value={option.value}` →
  `value=option.value`, with compiler-equivalence verification and idempotence
  coverage.
- **`style/prefer-hash-comments`**: converts ordinary `//` comments to Civet
  `#` comments when `coffeeComment` is enabled, while preserving compiler,
  coverage, formatter, bundler, region, and triple-slash directives and leaving
  comments nested in JSX untouched.
- **Comment-fix capability metadata**: custom rules can explicitly opt into
  comment rewrites with `meta.allowFixesInsideComments`; all other comment edits
  remain blocked by the engine.

### Changed

- The `coffee-react` preset now enables `coffeeComment` and enforces both new
  rules at `error`, bringing the built-in rule catalog to 19 rules.
- AST ancestry checks are exposed through `SyntaxTree.hasAncestorType`, keeping
  rule code independent of Civet's raw parent-node layout.

### Fixed

- Hardened bare JSX value fixes around spreads, optional member access,
  attribute order, and malformed source spans.
- Restored `style/no-thin-arrow` to the `coffee-react` preset after the AST
  migration.

## [0.2.0] - 2026-08-08

### Changed

- Rebuilt Clint's 17 existing rules on Civet's raw AST behind a Clint-owned
  `SyntaxTree` abstraction for source ranges, tokens, traversal, JSX attributes,
  comments, and strings.
- Preserved the 0.1.1 rule behavior and compiler-equivalence guarantees while
  removing rule-level dependencies on ad hoc raw-source scanning where the AST
  provides structure.

### Tests

- Added cross-rule parity tests and a structural guard that keeps raw compiler
  AST access inside the syntax adapter.

## [0.1.1] - 2026-08-04

### Documentation

- **Public launch readiness**: Updated README with stable npm badge (`latest`), clarified compiler equivalence vs opt-in reference-source verification, and added direct links to documentation artifacts.
- **Compatibility matrix**: Added `docs/compatibility.md` detailing supported Node.js versions, exact `@danielx/civet@0.11.15` pinning, dial requirements, preset support, and JSON configuration boundaries.
- **Production case study**: Added `docs/case-study-production.md` documenting the end-to-end rollout and verification across a 266-file production Civet codebase.
- **Upstream collaboration & roadmap**: Rewrote `docs/upstream.md` to define concrete collaboration points for Civet maintainers (integration directory listing, stable AST source-span APIs, normalized effective-config resolution) and a forward technical roadmap.
- **Configuration boundary**: Clarified which three static JSON names Clint currently auto-discovers, which names overlap with Civet's official loader, and which broader Civet formats remain future work.
- **Project identity**: Added the Clint logo to the repository documentation and README.

### Tests

- Added direct discovery coverage for `civet.json`, `civetconfig.json`, and `.civetconfig.json`.

## [0.1.0] - 2026-08-04

First stable release, promoting the alpha line after validation against a
real-world consumer.

### Changed

- **BREAKING (auto-discovery):** only the short `clint.*` filenames are discovered
  automatically — `clint.config.json`, `.clintrc.json`, `.clint.json`. The three
  `civet-clint.*` variants (`civet-clint.config.json`, `.civet-clintrc.json`,
  `.civet-clint.json`) that were discoverable in `0.1.0-alpha.4` are not. They keep
  working when passed explicitly with `--config`, so the fix for an affected project
  is to rename the file or add the flag. One discovery name per shape, matching the
  CLI's own name, rather than six.

### Validation

Exercised end-to-end on a production 266-file Civet codebase with **all 17 rules
enforced at `error` and zero findings**. Every rule was cleared either by autofix
under the byte-identity gate or by hand with structural verification of the
compiled output. Notable results from that rollout:

- `style/prefer-jsx-attr-shorthand` — 273 autofixes, all 266 files byte-identical.
- `style/prefer-jsx-shorthand` — 218 sites; the 116 false positives reported by
  `0.1.0-alpha.3` are gone as of `0.1.0-alpha.4`.
- `style/prefer-ampersand-shorthand` — 36 hand conversions, each verified by
  AST comparison with parameters alpha-renamed.
- `style/no-trailing-semicolons` — the final 5 findings were load-bearing only
  because the handlers used JS-style braced bodies; de-bracing them (letting
  indentation delimit the block) cleared the rule without changing behaviour.

### Notes

- Config auto-discovery (added in `0.1.0-alpha.4`) is verified working from a
  published tarball: a bare `clint` run resolves `clint.config.json` and
  `civet.json` identically to an explicit `--config`. The flag is now optional.

## [0.1.0-alpha.4] - 2026-08-04

### Changed

- **`style/prefer-jsx-attr-shorthand` is now fixable** for the `attr={attr}` form.
  Civet re-expands `{attr}` to exactly `attr={attr}` — including after a
  `{...spread}`, where the attribute keeps its position — so the rewrite is
  byte-identical in compiled output and passes the equivalence gate unchanged.
  Applied to a real 266-file codebase it landed **273 fixes with all 266 files
  byte-identical**, and a second pass was a no-op.

  The `prop={true}` → `prop` form is deliberately **not** fixable: Civet emits the
  bare attribute as `prop`, not `prop={true}`, so the compiled output genuinely
  differs. React treats the two as equivalent, but that is a render-equivalence
  argument the gate does not make, so those sites are reported without a fix.

### Fixed

- **`style/prefer-ampersand-shorthand` emitted syntactically broken suggestions.**
  The rule matched with a regex whose trailing character class ran past the end of
  the callback, so the quoted text absorbed delimiters belonging to the enclosing
  expression — `Use '&' shorthand '.map &.userId))'` — and pasting it produced a
  syntax error. Some suggestions were truncated mid-call (`&.id.toString(`).

  The rule is now driven by the AST: the receiver, the accessed chain, and the
  method are read from parser nodes, so a suggestion can no longer contain
  anything the rule did not derive. On the same codebase, 13 of 61 suggestions
  were malformed before; none are now.

  Being AST-driven also removed **27 false positives** the regex produced by
  matching bodies that are not a bare property access — `(p) => p.a or p.b`,
  `(u) => u.id is other`. `&` stands in for the whole receiver, so those have no
  shorthand form. The rule now also reports *each* link of a chained call
  (`.filter(...).map(...)`), which the old single-match-per-position scan missed.

- **Rules silently found nothing under the engine's AST mode.** The engine parses
  with `ast: "raw"`, whose tree differs from the plain `ast: true` shape in ways
  that are invisible until a rule reads the affected node: `Argument.children` is
  an array rather than the node itself, `Parameter.children` is an array, a
  `Parameters` node's leading token carries no `$loc`, and a JSX attribute's `=`
  and braces sit at different indices. Rules now read the fields that are stable
  across both modes.

- **`style/prefer-jsx-shorthand` was effectively unusable.** Civet lowers the
  `.class`/`#id` shorthand to the front of the tag, on the tag-name line, so rewriting
  an attribute that was not already there reorders the emitted attribute list or
  collapses a line break. Because fixes are validated as one batch per file, a single
  such site discarded every safe rewrite in that file — on a real 266-file codebase the
  rule landed **0** of its 334 findings, which is why downstream projects had it
  switched off.

  The rule now emits a fix only where the shorthand lowers in place: the leading run of
  `className`/`id` attributes, on the tag-name line. Sites that would move are left for
  review. That same codebase now takes **218 fixes with all 266 files byte-identical**,
  and a second pass is a no-op.

  This also closes a latent correctness hole: moving `className` ahead of a
  `{...spread}` inverts precedence, which is a behavior change rather than a
  reordering. Those sites are now never proposed.

### Added

- **Per-rule options**: rule entries in a config's `rules` map now accept the array
  form `["error", { ...options }]` alongside the bare level. Options are threaded
  through presets and glob `overrides` into each rule, and `clint --print-config`
  reports the effective options — including defaults not set explicitly. Validation
  is strict: an unknown option key, a wrong-typed value, or options passed to a rule
  that declares none is a load-time error, so a typo cannot silently disable a
  setting a user believes is active.

- **Config auto-discovery for `clint.config.json`**, `.clintrc.json`, and
  `.clint.json`, matching the CLI's own name. The existing `civet-clint.*` names are
  still checked first, so a project holding both keeps its current file. Previously a
  config under any of the shorter names was silently ignored and the run fell back to
  the `default` preset — a failure mode worse than a missing config, because it looks
  like a pass.

- **`style/prefer-terse-imports` option `unquoteSingleQuotes`** (default `false`):
  unquotes single-quoted module specifiers as well as double-quoted ones. Previously
  single-quoted paths kept their quotes and only lost the `import` keyword, so
  adopting terse imports in a single-quoted codebase required an external codemod
  first.

  Enabling it takes the rule off the strictly byte-identical path, because Civet
  echoes the original quote character while the terse form always emits double
  quotes. Rather than weaken the equivalence gate, two checks replace the single
  byte comparison, and a fix must pass both:

  1. The rule declares a *reference source* — the original with exactly those
     specifiers requoted, and nothing else — which the engine compiles and requires
     the fixed output to match byte-for-byte.
  2. The rule declares the kind of emitted difference it may cause (`quote-style`),
     which the engine verifies independently by normalizing string-literal quoting in
     both outputs.

  The second check is what makes the first safe: a reference source is authored by
  the rule, so alone it would let a rule authorize its own rewrite, whereas the delta
  bound is engine-owned and cannot be widened by a rule. A rule never inspects,
  normalizes, or approves compiled output. The strict check against the original
  output is unchanged for every other rule and for this rule's default path.

  Because the rewrite is driven by parser-identified specifier spans rather than
  text matching, ordinary strings that resemble module paths — such as
  `x := 'plain from ./str'` — are provably unaffected.

  Validated against the same 266-file Civet codebase that previously required the
  codemod: 300 fixes in one pass, 206 files byte-identical and 60 differing only in
  specifier quote style with zero other differences, a second pass a no-op, and the
  project's 1233 tests, typecheck, and build all passing.

## [0.1.0-alpha.3] - 2026-08-03

### Added

- **`style/prefer-terse-imports`** (fixable): omits the optional `import` keyword
  from binding imports and unquotes module paths where the terse form compiles to
  byte-identical output — `import { t } from "../i18n"` becomes
  `{ t } from ../i18n`. Enabled at `error` in the `coffee-react` preset; the
  neutral `default` preset is unchanged.

  Deliberately conservative, because the compiler-equivalence gate validates each
  rule's edits as one batch per file — a single unsafe edit would discard every
  terse-import fix in that file. The rule therefore keeps `import` on side-effect
  imports (where it is not optional), keeps single quotes (Civet echoes the
  original quote character, but the terse form always emits double quotes), skips
  declarations whose keyword is followed by irregular whitespace (Civet re-inserts
  exactly one space), and skips import attributes, dynamic `import()`,
  `import.meta`, and specifiers containing escape sequences.

  Validated against a real 266-file Civet codebase: 284 import rewrites produced
  byte-identical compiled output for every file, a second pass was a no-op, and
  the project's own tests, lint, build, and typecheck all passed unchanged.

### Fixed

- **Partially terse imports**: a declaration whose path was already unquoted
  (`import { A } from ./constants`) kept its `import` keyword, because an
  unquoted specifier has no positioned string node in the raw AST and the rule
  skipped the whole declaration. Keyword removal and unquoting are now
  independent.
- **README preset severities**: the `coffee-react` list documented six rules as
  `error` that the preset actually sets to `warn`.
- **Changelog accuracy**: the `0.1.0-alpha.1` entry described
  `style/prefer-jsx-shorthand` as enforcing self-closing elements and empty
  fragments. It actually converts static `className`/`id` attributes to Civet's
  `.class`/`#id` shorthands.

## [0.1.0-alpha.2] - 2026-08-03

Maintenance release. This is the first release published by the automated
GitHub Actions pipeline using npm Trusted Publishing (OIDC); `0.1.0-alpha.1` was
published manually to claim the package name. No library or CLI behavior has
changed from `0.1.0-alpha.1`.

### Changed

- **Release automation**: the publish workflow now authenticates solely via
  Trusted Publishing (OIDC); no npm token is stored as a repository or
  environment secret.
- **README**: the release-status note no longer hardcodes a version number, so it
  does not go stale on each release.

### Fixed

- **Smoke test under `npm publish --dry-run`**: `npm_config_dry_run` leaked from
  the parent publish into the nested `npm pack`/`npm install` calls, so the
  packaged-install smoke test failed on the exact command used to rehearse a
  release. The flag is now cleared for those child processes.
- **Publish workflow tag guard**: the tag/version equality check was skipped for
  any non-tag ref, so a `workflow_dispatch` run could publish unverified code.
  Non-tag refs and malformed tag names are now rejected.
- **Version assertions no longer hardcoded**: the CLI tests and the packaged
  smoke test asserted the literal string `0.1.0-alpha.1`, so `release:check`
  failed on every version bump — the release process broke its own gate. They now
  derive the expected version from `package.json`.

## [0.1.0-alpha.1] - 2026-08-03

First public alpha release of `civet-clint`, the compiler-backed style checker and autofixer for Civet codebases.

### Added

- **Compiler-Backed Lint Engine**: Integrates directly with the Civet compiler (`@danielx/civet`) to parse source code, build AST and comment/string range maps, run registered rule checks, and compute autofixes.
- **Compiler-Equivalence Safety Gate**: Byte-for-byte verification mechanism ensuring that autofixes (`--write`) are only applied if the compiled JavaScript/TypeScript output of the fixed Civet source exactly matches that of the original source.
- **`clint` CLI**:
  - `--check` (default): inspect target files and report style diagnostics with file locations and rule IDs.
  - `-w, --write`: apply verified autofixes in-place.
  - `--print-config`: display the resolved configuration, compiler dial, and skipped rules for target files or current project.
  - `--rules`: list all available rules with descriptions, fixability status, and compiler capability requirements.
  - `--format <text|json>`: format diagnostics as human-readable text or structured JSON.
  - `--config <path>`: specify explicit path to a Clint configuration file.
- **Configuration & Compiler Dial Adapter**:
  - Automatic discovery and parsing of `civet-clint.config.json`, `.civet-clintrc.json`, `.civet-clint.json`, and `civet.json` / `civetconfig.json`.
  - Built-in presets: `default` (neutral Civet rules) and `coffee-react` (idiomatic Coffee/React style rules with compiler dial).
  - File-specific `overrides` with glob pattern matching (`files`), per-override preset, custom rules, and compiler dials.
  - Capability-based rule skipping (`meta.capabilities.requires` / `requiresAny`) when required compiler dials are not enabled.
- **Extensible Rule Registry & Plugin System**:
  - Dynamic registration and retrieval via `RuleRegistry` and `defaultRuleRegistry`.
  - Exported rule definition and plugin interfaces (`Rule`, `RuleContext`, `ClintPlugin`).
- **Built-in Style Rules (16 rules)**:
  - `style/prefer-word-operators`: enforce `is`, `isnt`, `and`, `or`, `not` instead of symbol operators `===`, `!==`, `&&`, `||`, `!`. (Fixable)
  - `style/prefer-concise-arrow`: convert empty-parameter `() =>` to concise `=>`. (Fixable)
  - `style/prefer-jsx-shorthand`: convert static `className="btn"` and `id="main"` attributes to Civet's `.btn` and `#main` shorthands. (Fixable, requires `react`)
  - `style/prefer-bare-assignment`: prefer bare `x = 1` for `let` bindings and `:=` for `CONST_CASE` bindings under `autoLet`. (Fixable)
  - `style/no-null-equality`: disallow null comparisons in favor of truthiness or existential operators.
  - `style/no-is-not`: disallow `is not` in favor of `isnt`.
  - `style/no-mixed-interpolation`: disallow mixing `${...}` and `#{...}` within the same file.
  - `style/no-trailing-semicolons`: disallow unnecessary trailing semicolons at statement ends.
  - `style/prefer-existential-check`: prefer existential postfix (`x?`, `not x?`) over null equality checks.
  - `style/prefer-jsx-attr-shorthand`: prefer JSX attribute shorthands (`{prop}` for `prop={prop}`, boolean `prop` for `prop={true}`).
  - `style/prefer-ampersand-shorthand`: prefer `&` block shorthand for single-parameter callback accesses (`.map &.id`).
  - `style/no-single-param-arrow-without-parens`: require parentheses around single arrow function parameters.
  - `style/prefer-named-export-default`: prefer named default export declarations.
  - `style/no-thin-arrow`: disallow thin arrows `->` in favor of fat arrows `=>`.
  - `style/no-pipe-operator`: disallow pipe operator `|>`.
  - `style/prefer-range-operator`: prefer range loops (`[0...N].map`) over verbose `Array.from({ length: N }, ...)`.

### Notes & Known Constraints

- **Civet Pin**: Built against `@danielx/civet` version `0.11.15`. AST structure is consumed directly from Civet's parser output, which is treated as an internal/private compiler contract.
- **Node.js**: Requires Node.js `>=20.0.0`.
