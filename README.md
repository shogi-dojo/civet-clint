# civet-clint

[![CI](https://github.com/shogi-dojo/civet-clint/actions/workflows/ci.yml/badge.svg)](https://github.com/shogi-dojo/civet-clint/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**civet-clint** is an experimental compiler-backed style checker and autofixer for [Civet](https://civet.dev). The package installs the concise `clint` command.

Unlike a text-only formatter, `civet-clint` uses the official `@danielx/civet` compiler parser. Each rule's edits and the combined result are recompiled; edits are applied only when the emitted output is byte-identical. This is a strong behavior-preservation guard, while the project remains a proof of concept built on Civet's currently untyped raw AST.

> **Status:** POC. The package is not published to npm yet. Install it from GitHub or clone the repository while its public API is being validated.

---

## Features

- 🛡️ **Compiler-Equivalence Verification**: Every rule batch is verified against Civet's compilation output. Unsafe or output-altering edits are discarded without blocking safe batches from other rules.
- ⚡ **Atomic File Rewrites**: Changes are written atomically via tempfiles, avoiding partial writes, corruption, and preserving line endings (`\n` vs `\r\n`).
- 🎯 **Coffee React Style Rules**: Idiomatic rules designed for modern Civet codebases using CoffeeScript and React syntax styles.
- ⚙️ **Configurable & Extensible**: Support for presets (`coffee-react`), granular rule severities (`off`, `warn`, `error`), and integration with project `civet.json` configs.
- 📊 **Flexible CLI**: Rich terminal diagnostics, `--check` exit codes for CI, `--write` in-place fixing, and machine-readable `--format json`.

---

## Installation

```bash
# Install directly from the public GitHub repository
npm install --save-dev github:shogi-dojo/civet-clint

# Or develop locally
git clone https://github.com/shogi-dojo/civet-clint.git
cd civet-clint
npm ci
npm test
```

---

## CLI Usage

```bash
# Check all .civet files in the current workspace
clint --check

# Check specific files or folders
clint src/ components/ app.civet

# Automatically fix all safe style violations in place
clint --write

# Specify custom configuration file
clint --write --config ./civet-clint.config.json

# Output diagnostics in JSON for CI/CD pipelines
clint --check --format json
```

### CLI Flags

| Flag | Description |
|---|---|
| `--check` | Lint files and report diagnostics. Exits with code `1` if errors are found, `0` if clean. (Default) |
| `-w`, `--write`, `--fix` | Apply autofixes to source files in place after verifying compiler equivalence. |
| `-c`, `--config <path>` | Path to a `civet-clint.config.json` configuration file. |
| `-f`, `--format <text\|json>` | Output format: human-readable `text` (default) or `json`. |
| `-v`, `--version` | Print `clint` version and exit. |
| `-h`, `--help` | Show CLI usage help. |

---

## Configuration

Create a `civet-clint.config.json` file in your repository root:

```json
{
  "preset": "coffee-react",
  "civetConfig": "./civet.json",
  "rules": {
    "style/prefer-word-operators": "error",
    "style/prefer-concise-arrow": "error",
    "style/prefer-jsx-shorthand": "error",
    "style/no-null-equality": "warn",
    "style/no-is-not": "warn",
    "style/no-mixed-interpolation": "warn"
  }
}
```

### Presets

#### `coffee-react`
Configured specifically for idiomatic Civet + React codebases:
- `style/prefer-word-operators`: `"error"` (fixable)
- `style/prefer-concise-arrow`: `"error"` (fixable)
- `style/prefer-jsx-shorthand`: `"error"` (fixable)
- `style/no-null-equality`: `"warn"` (diagnostic)
- `style/no-is-not`: `"warn"` (diagnostic)
- `style/no-mixed-interpolation`: `"warn"` (diagnostic)
- Civet compiler options: `{ "coffeeIsnt": true, "react": true }`

---

## Rules Catalog

### Fixable Rules

#### `style/prefer-word-operators`
Replaces standard JavaScript operators with concise Civet word operators:
- `===` $\to$ `is`
- `!==` $\to$ `isnt`
- `&&` $\to$ `and`
- `||` $\to$ `or`
- `!flag` $\to$ `not flag`

> **Safety**: Comparisons against `null` (e.g. `x === null`) are excluded because Civet's existential forms require an intentional migration decision. Comparisons against `undefined` can be rewritten normally.

#### `style/prefer-concise-arrow`
Converts parameterless arrow functions to concise Civet arrow syntax:
- `() => 42` $\to$ `=> 42`
- `async () => 42` $\to$ `async => 42`
- `items.map(() => 0)` $\to$ `items.map(=> 0)`
- `<button onClick={() => doSomething()} />` $\to$ `<button onClick={=> doSomething()} />`

#### `style/prefer-jsx-shorthand`
Converts static `className` and `id` attributes into clean JSX tag shorthands:
- `<div className="btn primary" id="main">` $\to$ `<div .btn.primary #main>`
- `<Button className="primary" id="btn1" />` $\to$ `<Button .primary #btn1 />`

> **Safety**: Dynamic expressions (e.g. `className={clsx(...)}`), template strings, and invalid CSS identifiers are preserved unchanged.

---

### Diagnostic Rules

#### `style/no-null-equality`
Flags direct comparisons with `null` (`=== null`, `!== null`, `== null`, `is null`, `isnt null`), recommending explicit checks or existential operators.

#### `style/no-is-not`
Flags the use of `is not` (preferring `isnt`).

#### `style/no-mixed-interpolation`
Flags the two silent interpolation traps: `${...}` inside double-quoted strings and `#{...}` inside backtick templates. Use backticks with `${...}` for ordinary interpolation; Coffee-style `"#{...}"` remains valid when deliberately needed.

---

## Programmatic API

You can also use `civet-clint` as a library:

```typescript
import { lintSource, lintFile, loadConfig } from 'civet-clint';

const config = loadConfig();
const result = lintSource('fn := () => a === b', {
  config,
  fix: true
});

console.log(result.isEquivalencePreserved); // true
console.log(result.fixedSource);            // "fn := => a is b"
```

---

## Architecture & Equivalence Engine

```mermaid
flowchart TD
    A[Source File] --> B[Parse Raw AST]
    A --> C[Baseline Compile]
    B --> D[Execute Rules]
    D --> E[Collect Non-overlapping TextEdits]
    E --> F[Apply Candidate Edits]
    F --> G[Compile Candidate]
    C --> H{Verify Byte-Identical Output}
    G --> H
    H -- Match --> I[Approved: Atomic Write]
    H -- Mismatch --> J[Rejected: Keep Original]
```

The intended path into the Civet project, including the raw-AST compatibility risk, is documented in [docs/upstream.md](docs/upstream.md).

---

## License

MIT © shogi-dojo
