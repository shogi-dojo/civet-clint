# Configuration

Create a config file in your repository root. These names are discovered
automatically, in order: `clint.config.json`, `.clintrc.json`, `.clint.json`. Any
other filename works too, but must be passed explicitly with `--config`.

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

## Rule Options

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
a silently ignored setting. `clint config` prints the effective options for
every active rule, including defaults you did not set. Overrides accept the same array
form, so options can be scoped to a glob.

The top-level `compiler` setting selects the project's `@danielx/civet` dependency
(`"project"`, the default) or Clint's bundled compiler (`"bundled"`). Overrides may
also select a compiler per file pattern. `clint config` and `--verbose` show the
resolved compiler version and path; versions outside the tested set are reported.

```json
{ "compiler": "bundled", "preset": "civet-idiomatic" }
```

## Exceptions File

Findings the project has decided to live with go in `clint.exceptions.json`, beside
`clint.config.json`. It is discovered automatically; set `"exceptions": "<path>"` in
the config to use another file.

```json
{
  "exceptions": [
    { "file": "src/pages/Admin.civet", "line": 120, "rule": "style/prefer-switch", "reason": "reads better as an if-chain" },
    { "file": "src/solid/club/ClubPage.civet", "text": "podium = if rankNum", "rule": "style/prefer-switch", "reason": "assigned chain" },
    { "file": "src/legacy/parser.civet", "rule": "style/prefer-range-loop" }
  ]
}
```

- `file` is relative to the exceptions file. `rule` is the full rule id.
- `line` is the line clint reports. Without it the entry covers the whole file.
- `text` is a fragment of the reported line. Prefer it to `line`: a line number goes
  stale when an edit above it shifts the file, while the text moves with the code.
  When both are given, `text` decides.
- `reason` is free text for the next reader; clint ignores it.

A suppressed finding is not reported and does not affect the exit code. Clint prints
the number suppressed on stderr, and warns about an entry that matched nothing, so a
stale line number or text is noticed. Under `clint fix`, a rule with an exception in a file is
not autofixed anywhere in that file. Compiler and syntax errors cannot be suppressed.

## Per-file Configuration Overrides

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

## Compiler Dial & Rule Capabilities

Rules declare required compiler options (e.g., `autoLet`, `react`, `coffeeRange`) via `meta.capabilities`. When the active dial does not enable a rule's requirements, the rule is **automatically skipped** rather than executing and emitting diagnostics or fixes that are invalid under the active dial.
