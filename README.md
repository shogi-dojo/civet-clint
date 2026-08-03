# civet-clint

[![CI](https://github.com/shogi-dojo/civet-clint/actions/workflows/ci.yml/badge.svg)](https://github.com/shogi-dojo/civet-clint/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/civet-clint/next)](https://www.npmjs.com/package/civet-clint)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**civet-clint** is a compiler-backed style checker and autofixer for [Civet](https://civet.dev). The package installs the concise `clint` command line tool and provides a programmatic Node.js API.

Unlike a text-only regex formatter, `civet-clint` uses the official `@danielx/civet` compiler parser. Every autofix edit is compiled and re-verified: changes are applied only when the compiled JavaScript/TypeScript output is byte-for-byte identical to the original output. This provides a behavior-preservation safety guard against accidental semantic breakage.

> **Release Status:** Alpha, published under npm's `next` dist-tag. The tool targets `@danielx/civet` 0.11.15.

---

## Features

- 🛡️ **Compiler-Equivalence Verification**: Every rule batch is verified against Civet's compilation output. Unsafe or output-altering edits are rejected by the safety gate.
- ⚡ **Atomic File Rewrites**: Changes are written atomically via temporary files, preventing partial writes and preserving line endings (`\n` vs `\r\n`).
- 🎯 **Ranked & Coffee-React Style Rules**: 16 built-in rules covering word operators, concise arrows, bare bindings, JSX shorthand, and idiomatic syntax.
- 🧩 **Modular Rule Registry & Plugins**: Modular `RuleRegistry` abstraction with plugin contracts, duplicate-rule validation, and runtime-isolated registries.
- 🗂️ **Per-File Configuration Overrides**: Support for glob-based `overrides` in configuration files to tailor rules, presets, and compiler dials per directory or file pattern.
- ⚙️ **Configurable & Extensible**: Support for presets (`default`, `coffee-react`), granular rule severities (`off`, `warn`, `error`), and integration with project `civet.json` configs.
- 🧭 **Dial-Aware Capability Checks**: Rules declare the compiler options they require (e.g., `autoLet`, `react`, `coffeeRange`). Incompatible rules are skipped rather than emitting invalid autofixes.
- 📊 **Flexible CLI**: Rich terminal diagnostics, `--check` exit codes for CI, `--write` in-place fixing, machine-readable `--format json`, and `clint --print-config [file]` for inspecting workspace and per-file resolved configurations.

---

## Installation

```bash
# Install the alpha release from npm (@next tag)
npm install --save-dev civet-clint@next

# Or with yarn
yarn add -D civet-clint@next

# Or with pnpm
pnpm add -D civet-clint@next
```

---

## CLI Usage

```bash
# Check all .civet files in the current workspace (default: --check)
npx clint

# Check specific files or folders
npx clint src/ components/ app.civet

# Automatically fix all safe style violations in place
npx clint --write

# Specify custom configuration file
npx clint --write --config ./civet-clint.config.json

# Output diagnostics in JSON format for CI/CD pipelines
npx clint --check --format json

# Print resolved workspace configuration and compiler dial
npx clint --print-config

# Print effective resolved configuration for a specific file (including overrides)
npx clint --print-config src/components/Button.civet
```

### CLI Flags

| Flag | Description |
|---|---|
| `--check` | Lint files and report diagnostics. Exits with code `1` if errors are found, `0` if clean. (Default) |
| `-w`, `--write`, `--fix` | Apply autofixes to source files in place after verifying compiler equivalence. |
| `--print-config [file]` | Print the resolved preset, compiler options, rules, and skipped/incompatible rules as JSON, then exit. If a target file is passed, resolves matching per-file overrides. |
| `-c`, `--config <path>` | Path to a `civet-clint.config.json` configuration file. |
| `-f`, `--format <text\|json>` | Output format: human-readable `text` (default) or `json`. |
| `-v`, `--version` | Print `clint` version and exit. |
| `-h`, `--help` | Show CLI usage help. |

---

## Configuration

Create a config file in your repository root. These names are discovered
automatically, in order: `civet-clint.config.json`, `.civet-clintrc.json`,
`.civet-clint.json`, `clint.config.json`, `.clintrc.json`, `.clint.json`. Any other
filename works too, but must be passed explicitly with `--config`.

```json
{
  "preset": "coffee-react",
  "civetConfig": "./civet.json",
  "rules": {
    "style/prefer-word-operators": "error",
    "style/prefer-concise-arrow": "error",
    "style/prefer-bare-assignment": "error",
    "style/no-null-equality": "warn",
    "style/no-is-not": "warn",
    "style/no-trailing-semicolons": "error"
  },
  "overrides": [
    {
      "files": ["test/**/*.civet", "**/*.test.civet"],
      "rules": {
        "style/prefer-word-operators": "off"
      }
    },
    {
      "files": ["src/legacy/**/*.civet"],
      "civetOptions": {
        "coffeeEq": true
      }
    }
  ]
}
```

### Rule Options

A rule entry is normally a bare level (`"error"`). Rules that accept options also
support the array form `[level, options]`:

```json
{
  "rules": {
    "style/prefer-terse-imports": ["error", { "unquoteSingleQuotes": true }]
  }
}
```

Options are validated when the config loads: an unknown option key, a value of the
wrong type, or options given to a rule that declares none is a hard error rather than
a silently ignored setting. `clint --print-config` prints the effective options for
every active rule, including defaults you did not set. Overrides accept the same array
form, so options can be scoped to a glob.

#### `style/prefer-terse-imports`

| Option | Type | Default | Description |
|---|---|---|---|
| `unquoteSingleQuotes` | boolean | `false` | Also unquote single-quoted module specifiers. |

By default the rule only unquotes double-quoted specifiers, because that rewrite is
byte-identical: Civet echoes the original quote character, and the terse form emits
double quotes. Unquoting `'./x'` therefore changes the emitted literal to `"./x"` —
a quote-style change, but still a change, so it stays opt-in.

When enabled, these fixes are **not** validated against the original compiled output.
Two checks replace that one, and a fix must pass both:

1. **Reference source.** The rule hands the engine the original file with exactly
   those specifiers rewritten to double quotes, and nothing else. The engine compiles
   it and requires the fixed file's output to match byte-for-byte. Because the rewrite
   is driven by parser-identified specifier spans rather than text matching, a string
   that merely looks like a path (`x := 'plain from ./str'`) is never touched.
2. **Output-delta bound.** The rule also declares *how* its output may differ — here,
   `quote-style`. The engine independently verifies that the two compiled outputs are
   identical once string-literal quoting is normalized, so the change is provably
   confined to quote characters and cannot alter identifiers, structure, or string
   contents.

The second check is what makes the first safe to trust. A reference source is supplied
by the rule, so on its own it would let a rule authorize its own rewrite; the
engine-owned delta bound is not something a rule can widen. The strict byte-identity
check is unchanged for every other rule and for this rule's default path.

### Presets

#### `default`
The baseline neutral preset that relies on Civet's standard word-operator parsing without enforcing specific framework or dialect styles:
- `style/prefer-word-operators`: `"error"` (fixable)
- `style/prefer-concise-arrow`: `"error"` (fixable)
- `style/no-mixed-interpolation`: `"warn"` (diagnostic)
- `style/no-trailing-semicolons`: `"error"` (diagnostic)
- Compiler options: `{}`

#### `coffee-react`
Tailored for idiomatic Civet + React codebases (such as the Ranked style guide):
- `style/prefer-word-operators`: `"error"` (fixable)
- `style/prefer-concise-arrow`: `"error"` (fixable)
- `style/prefer-jsx-shorthand`: `"error"` (fixable, requires `react`)
- `style/prefer-bare-assignment`: `"error"` (fixable, requires `autoLet`)
- `style/prefer-terse-imports`: `"error"` (fixable)
- `style/no-trailing-semicolons`: `"error"` (diagnostic)
- `style/prefer-existential-check`: `"warn"` (diagnostic)
- `style/prefer-jsx-attr-shorthand`: `"warn"` (diagnostic, requires `react`)
- `style/prefer-ampersand-shorthand`: `"warn"` (diagnostic)
- `style/no-single-param-arrow-without-parens`: `"warn"` (diagnostic)
- `style/prefer-named-export-default`: `"warn"` (diagnostic)
- `style/no-thin-arrow`: `"warn"` (diagnostic)
- `style/no-pipe-operator`: `"error"` (diagnostic)
- `style/prefer-range-operator`: `"warn"` (diagnostic, requires `coffeeRange`)
- `style/no-null-equality`: `"warn"` (diagnostic)
- `style/no-is-not`: `"warn"` (diagnostic)
- `style/no-mixed-interpolation`: `"warn"` (diagnostic)
- Compiler options: `{ "autoLet": true, "coffeeIsnt": true, "coffeeRange": true, "react": true }`

### Per-file Configuration Overrides

The `overrides` array allows configuring rules, presets, compiler options, or separate `civet.json` configurations for subsets of files matching glob patterns. Overrides apply in declaration order on top of the base configuration.

```json
{
  "overrides": [
    {
      "files": "src/components/**/*.civet",
      "civetOptions": { "react": true },
      "rules": {
        "style/prefer-jsx-shorthand": "error",
        "style/prefer-jsx-attr-shorthand": "error"
      }
    }
  ]
}
```

### Compiler Dial & Rule Capabilities

Rules declare required compiler options (e.g., `autoLet`, `react`, `coffeeRange`) via `meta.capabilities`. When the active dial does not enable a rule's requirements, the rule is **automatically skipped** rather than executing and emitting diagnostics or fixes that are invalid under the active dial.

---

## Rules Catalog

`civet-clint` currently provides 16 built-in style and correctness rules.

### Fixable Rules

| Rule ID | Description | Required Dial |
|---|---|---|
| [`style/prefer-word-operators`](src/rules/prefer-word-operators.civet) | Convert `===`, `!==`, `&&`, `||`, `!` to `is`, `isnt`, `and`, `or`, `not`. | — |
| [`style/prefer-concise-arrow`](src/rules/prefer-concise-arrow.civet) | Convert parameterless `() =>` to concise `=>`. | — |
| [`style/prefer-jsx-shorthand`](src/rules/prefer-jsx-shorthand.civet) | Convert `className="btn"` and `id="main"` to `.btn` and `#main` shorthands. | `react` |
| [`style/prefer-bare-assignment`](src/rules/prefer-bare-assignment.civet) | Prefer bare `x = 1` for `let` and `:=` for `CONST_CASE` bindings. | `autoLet` |
| [`style/prefer-terse-imports`](src/rules/prefer-terse-imports.civet) | Omit the optional `import` keyword and unquote safe module paths (`{ t } from ../i18n`). Accepts [`unquoteSingleQuotes`](#rule-options). | — |

### Diagnostic Rules

| Rule ID | Description | Required Dial |
|---|---|---|
| [`style/no-trailing-semicolons`](src/rules/no-trailing-semicolons.civet) | Disallow unnecessary trailing semicolons at statement ends. | — |
| [`style/prefer-existential-check`](src/rules/prefer-existential-check.civet) | Prefer existential postfix (`x?`, `not x?`) over null equality comparisons. | — |
| [`style/prefer-jsx-attr-shorthand`](src/rules/prefer-jsx-attr-shorthand.civet) | Prefer `{prop}` for `prop={prop}` and `prop` for `prop={true}`. | `react` |
| [`style/prefer-ampersand-shorthand`](src/rules/prefer-ampersand-shorthand.civet) | Prefer `&` block shorthand for single-parameter callbacks (`.map &.id`). | — |
| [`style/no-single-param-arrow-without-parens`](src/rules/no-single-param-arrow-without-parens.civet) | Require parentheses around single arrow function parameters `(x) => ...`. | — |
| [`style/prefer-named-export-default`](src/rules/prefer-named-export-default.civet) | Prefer named default exports (`export default MyComp = ...`). | — |
| [`style/no-thin-arrow`](src/rules/no-thin-arrow.civet) | Disallow thin arrows `->` in favor of fat arrows `=>`. | — |
| [`style/no-pipe-operator`](src/rules/no-pipe-operator.civet) | Disallow pipe operator `\|>`. | — |
| [`style/prefer-range-operator`](src/rules/prefer-range-operator.civet) | Prefer `[0...N].map` range loops over `Array.from({ length: N }, ...)`. | `coffeeRange` |
| [`style/no-null-equality`](src/rules/no-null-equality.civet) | Disallow direct comparisons with `null`. | — |
| [`style/no-is-not`](src/rules/no-is-not.civet) | Disallow `is not` in favor of `isnt`. | `coffeeIsnt` or `coffeeNot` |
| [`style/no-mixed-interpolation`](src/rules/no-mixed-interpolation.civet) | Disallow mixing `${...}` and `#{...}` within the same file. | — |

### Style-Guide Coverage

Clint automates the *mechanical* conventions of a Civet style guide — the ones with
a deterministic, compiler-verifiable rewrite. Several conventions are deliberately
out of scope; their absence is a design boundary, not a missing feature.

| Convention | Status | Notes |
|---|---|---|
| Word operators, existential checks, terse declarations/exports, terse imports, JSX shorthands, arrow style, range loops | **Automated** | See the rule tables above. |
| Side-effect import ordering | Not automated | Reordering imports can change evaluation order, so it is not compiler-equivalent. |
| Single-quoted module paths | Automated, opt-in | Off by default, because unquoting `'./x'` changes the emitted quote character. Set [`unquoteSingleQuotes`](#rule-options) on `style/prefer-terse-imports` to enable it; the fix is then verified against a reference compile so the change is provably confined to specifier quote style. |
| Removing unused or default `React` imports | Not automated | Requires whole-program binding analysis; deleting a binding is not an equivalence-preserving edit. |
| Comment quality, naming, file/layer organization, architectural policy (i18n via `t()`, no `fetch` in components) | Not automated | Qualitative judgments with no mechanical rewrite. Enforce in review. |

---

## Programmatic API & Plugins

`civet-clint` exports a typed ESM API:

```typescript
import {
  lintSource,
  lintFile,
  loadConfig,
  resolveConfigForFile,
  RuleRegistry,
  createDefaultRuleRegistry
} from 'civet-clint';

const registry = createDefaultRuleRegistry();
registry.register({
  id: 'custom/no-debugger',
  meta: {
    description: 'Disallow debugger statements',
    fixable: false,
    defaultSeverity: 'error'
  },
  check(context) {
    if (context.source.includes('debugger')) {
      context.report({
        ruleId: 'custom/no-debugger',
        message: 'Avoid debugger statements in production code'
      });
    }
  }
});

const config = loadConfig();
const result = lintSource('fn := () => a === b', {
  config,
  registry,
  fix: true
});

console.log(result.isEquivalencePreserved); // true
console.log(result.fixedSource);            // "fn := => a is b"
```

---

## Architecture & Equivalence Engine

```mermaid
flowchart TD
    A[Source File] --> B[Parse Raw AST via @danielx/civet]
    A --> C[Baseline Compilation]
    B --> D[Execute Active Rules via RuleRegistry]
    D --> E[Collect Non-overlapping TextEdits]
    E --> F[Apply Candidate Autofixes]
    F --> G[Compile Fixed Candidate]
    C --> H{Verify Byte-Identical Output}
    G --> H
    H -- Match --> I[Approved: Atomic Write]
    H -- Mismatch --> K{Rule declared a reference source?}
    K -- No --> J[Rejected: Retain Original Source]
    K -- Yes --> L[Compile Reference Source]
    L --> M{Byte-Identical to Reference?}
    M -- No --> J
    M -- Yes --> N{Within Declared Output Delta?}
    N -- No --> J
    N -- Yes --> I
```

Fixes are validated per rule, one batch per file, so a rejected rule never discards
another rule's approved edits.

The reference-source branch is the single, opt-in exception to comparing against the
original file's output, currently used only by
[`unquoteSingleQuotes`](#styleprefer-terse-imports). It does not relax the gate,
because it is paired with an engine-owned bound on the emitted difference. A rule
supplies the reference *source*; the engine defines what each delta kind permits and
verifies it separately, so a rule cannot widen its own allowance or launder an
arbitrary rewrite through a broad reference. A rule never inspects, normalizes, or
approves compiled output. Rules that declare no reference — every rule today by
default — are governed solely by the strict check against the original.

For design details regarding AST constraints, compiler dials, and upstream Civet integration, see [docs/upstream.md](docs/upstream.md).

---

## Releasing

For release policies, SemVer tagging, and npm publishing guidelines, see [docs/releasing.md](docs/releasing.md).

---

## License

MIT © [shogi-dojo](https://github.com/shogi-dojo)
