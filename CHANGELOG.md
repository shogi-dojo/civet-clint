# Changelog

All notable changes to `civet-clint` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
  - Built-in presets: `default` (neutral Civet rules) and `coffee-react` (Ranked Civet style guide rules with Coffee/React compiler dial).
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
