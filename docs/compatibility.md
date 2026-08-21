# Compatibility Matrix

This document outlines the supported runtime environments, compiler dependencies, dialect options, and configuration boundaries for `civet-clint`.

---

## Compatibility Summary

| Dimension | Supported / Tested | Status & Notes |
|---|---|---|
| **Civet Compiler** | `@danielx/civet@0.11.15` | **Exact pin.** Clint relies on parser AST structures via `{ ast: "raw" }`. Other versions may alter raw AST shapes or compiler dial keys. |
| **Node.js Runtime** | `>=20.0.0` | Tested in continuous integration across Node.js **20.x**, **22.x**, and **24.x**. |
| **Operating Systems** | Linux (CI), macOS (consumer validation) | Windows-style paths and CRLF preservation have unit coverage, but native Windows execution is not yet CI-validated. |
| **Presets** | `default`, `coffee-react`, `coffee-to-standard` | Neutral style, Coffee/React style, and a transitional CoffeeScript-to-standard migration path. |
| **Frameworks** | React (JSX) | Validated on React codebases. Solid and other JSX dialects are currently **unvalidated**. |
| **Config Discovery** | `clint.config.json`, `.clintrc.json`, `.clint.json` | Auto-discovered in order from the repository root. Custom config paths supported via `--config <path>`. |
| **Civet Config Adapter** | `civet.json`, `civetconfig.json`, `.civetconfig.json` | Clint auto-discovers these three static JSON names; broader Civet config formats are not yet supported. |
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
Clint's current adapter auto-discovers and reads `civet.json`, `civetconfig.json`, or `.civetconfig.json`. The dotted `.civetconfig.json` form is recognized by Civet 0.11.15's official config loader as well as by Clint. `civet.json` remains supported for existing Clint consumers, but it is not one of Civet's standard config names.

> [!NOTE]
> **Scope of Civet Config Support:**
> Clint currently supports only these static JSON configuration files. Civet itself supports additional standard names, a `.config` directory, package configuration, and executable or YAML formats; adopting that full discovery/loading surface is future work.
> The following are currently **out of scope**:
> - Dynamic JavaScript/TypeScript/YAML config files (`civet.config.js`, `civet.config.ts`, `civet.yaml`).
> - Automatic expansion of umbrella options like `coffeeCompat` or `esCompat` into their constituent parse options. (Individual flags must be explicitly enabled if required by rules).
> - Custom compiler loaders or transpile hooks.

---

## Dial & Preset Matrix

| Preset | Purpose | Required Compiler Options | Default Rules |
|---|---|---|---|
| `default` | Standard, neutral Civet style | `{}` (none required) | `style/prefer-word-operators`<br>`style/prefer-concise-arrow`<br>`style/no-mixed-interpolation`<br>`style/no-trailing-semicolons` |
| `coffee-react` | Idiomatic CoffeeScript-feel Civet + React | `{ "autoLet": true, "coffeeComment": true, "coffeeIsnt": true, "coffeeRange": true, "react": true }` | All 19 built-in rules configured for terse syntax, CoffeeScript comments, and React JSX shorthands. |
| `coffee-to-standard` | Migrate legacy CoffeeScript-compatible source toward neutral Civet | `{ "autoLet": true, "coffeeComment": true, "coffeeIsnt": true, "coffeeRange": true, "react": true }` | Neutral rules plus compiler-identical `#` → `//`, `isnt` → `is not`, `:=` → `const`, and exported auto-bindings → `export let`. |

The migration preset intentionally keeps legacy parser options enabled while source is
being rewritten. After the migration check is clean, disable the corresponding
compiler options and switch to `default`; Clint does not mutate `civet.json` itself.
`style/prefer-is-not` is reported as skipped while `coffeeNot` remains enabled because
under that dial `is not` does not mean inequality.

---

- `lintSource(source, options)`: In-memory linting and compiler-equivalence verification.
- `lintFile(filePath, options)`: File-based linting and atomic writing.
- `rewriteFile(filePath, options)`: Conversion of JS/TS files to Civet with safety check, atomic rename, and in-place fixing.
- `loadConfig(explicitConfigPath?, cwd?, registry?)`: Configuration resolution with inheritance and overrides.
- `resolveConfigForFile(config, filePath, cwd?, registry?)`: Per-file override resolution.
- `RuleRegistry`, `createDefaultRuleRegistry()`: Extensible rule registry and plugin execution.

---

## Compiler Equivalence & Output Deltas

By default, Clint enforces strict, byte-for-byte identity on compiled JS output before accepting any autofix. For non-byte-identical transforms, rules may declare bounded output deltas verified against an independently compiled reference source:

| Output Delta | Rules | Permitted Difference |
|---|---|---|
| `quote-style` | `style/prefer-terse-imports` (opt-in `unquoteSingleQuotes`) | Module specifier quote character normalization (`'` ↔ `"`). |
| `semicolon-style` | `style/no-trailing-semicolons` | Trailing statement semicolons and trailing line whitespace. Semicolons altering AST semantics (e.g. statement blocks reparsed as object literals) remain strictly rejected. |
