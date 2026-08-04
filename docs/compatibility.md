# Compatibility Matrix

This document outlines the supported runtime environments, compiler dependencies, dialect options, and configuration boundaries for `civet-clint`.

---

## Compatibility Summary

| Dimension | Supported / Tested | Status & Notes |
|---|---|---|
| **Civet Compiler** | `@danielx/civet@0.11.15` | **Exact pin.** Clint relies on parser AST structures via `{ ast: "raw" }`. Other versions may alter raw AST shapes or compiler dial keys. |
| **Node.js Runtime** | `>=20.0.0` | Tested in continuous integration across Node.js **20.x**, **22.x**, and **24.x**. |
| **Operating Systems** | Linux (CI), macOS (consumer validation) | Windows-style paths and CRLF preservation have unit coverage, but native Windows execution is not yet CI-validated. |
| **Presets** | `default`, `coffee-react` | `default` (neutral, dial-independent); `coffee-react` (requires `autoLet`, `coffeeIsnt`, `coffeeRange`, `react`). |
| **Frameworks** | React (JSX) | Validated on React codebases. Solid and other JSX dialects are currently **unvalidated**. |
| **Config Discovery** | `clint.config.json`, `.clintrc.json`, `.clint.json` | Auto-discovered in order from the repository root. Custom config paths supported via `--config <path>`. |
| **Civet Config** | `civet.json`, `civetconfig.json`, `.civetconfig.json` | JSON configs only; extracts `parseOptions` as the compiler dial and forwards top-level `CompileOptions`. |
| **Interfaces** | CLI (`clint`), Node.js ESM API, Plugin API | Full CLI suite, typed programmatic exports, and modular `RuleRegistry` / `Plugin` interfaces. |

---

## Compiler Dependency & Raw AST

`civet-clint` uses `@danielx/civet` directly to parse Civet source files and compile candidates during safety verification.

- **AST Shape:** Clint consumes the raw AST produced by `compile(source, { ast: "raw" })`. Because raw AST nodes (`$loc`, `children`, `parent`) are treated as internal compiler structures rather than a frozen public API, `civet-clint` strictly pins `@danielx/civet` to version `0.11.15`.
- **Compiler Dials:** Rules declare required compiler features in `meta.capabilities` (e.g. `autoLet`, `react`, `coffeeRange`, `coffeeIsnt`). When a required dial flag is absent in the project's configuration, Clint automatically skips the rule instead of proposing invalid syntax.

---

## Configuration Support Boundary

### Clint Configuration
Clint automatically discovers the following configuration files in order:
1. `clint.config.json`
2. `.clintrc.json`
3. `.clint.json`

For non-standard paths or names, pass `-c` / `--config <path>`.

### Civet Project Configuration
Clint discovers and reads `civet.json`, `civetconfig.json`, or `.civetconfig.json` specified in configuration or discovered in the workspace.

> [!NOTE]
> **Scope of Civet Config Support:**
> Clint supports static JSON configuration files (`civet.json`, `civetconfig.json`, `.civetconfig.json`).
> The following are currently **out of scope**:
> - Dynamic JavaScript/TypeScript/YAML config files (`civet.config.js`, `civet.config.ts`, `civet.yaml`).
> - Automatic expansion of umbrella options like `coffeeCompat` or `esCompat` into their constituent parse options. (Individual flags must be explicitly enabled if required by rules).
> - Custom compiler loaders or transpile hooks.

---

## Dial & Preset Matrix

| Preset | Purpose | Required Compiler Options | Default Rules |
|---|---|---|---|
| `default` | Standard, neutral Civet style | `{}` (none required) | `style/prefer-word-operators`<br>`style/prefer-concise-arrow`<br>`style/no-mixed-interpolation`<br>`style/no-trailing-semicolons` |
| `coffee-react` | Idiomatic CoffeeScript-feel Civet + React | `{ "autoLet": true, "coffeeIsnt": true, "coffeeRange": true, "react": true }` | All 17 built-in rules configured for terse syntax and React JSX shorthands. |

---

## Programmatic API & Tooling Support

`civet-clint` exports a typed ECMAScript Module (ESM) interface compatible with modern bundlers and Node.js environments:

- `lintSource(source, options)`: In-memory linting and compiler-equivalence verification.
- `lintFile(filePath, options)`: File-based linting and atomic writing.
- `loadConfig(explicitConfigPath?, cwd?, registry?)`: Configuration resolution with inheritance and overrides.
- `resolveConfigForFile(config, filePath, cwd?, registry?)`: Per-file override resolution.
- `RuleRegistry`, `createDefaultRuleRegistry()`: Extensible rule registry and plugin execution.
