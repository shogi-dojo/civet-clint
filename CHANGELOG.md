# Changelog

All notable changes to `civet-clint` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Fixed

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
