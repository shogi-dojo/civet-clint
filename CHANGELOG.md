# Changelog

All notable changes to `civet-clint` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
  - `style/prefer-jsx-shorthand`: enforce self-closing JSX elements `<Component />` and empty fragment `<></>`. (Fixable)
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
