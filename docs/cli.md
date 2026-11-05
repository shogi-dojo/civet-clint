# Command line

```bash
clint [command] [options] [files/directories...]
```

With no files, clint works on the current directory. `node_modules`, `dist`, `build`,
`coverage` and dot-directories are skipped.

## Commands

| Command | What it does |
|---|---|
| `clint` / `clint check` | Report problems. Exits `1` on errors, `2` on a config, parse or compile error, `0` otherwise. |
| `clint fix` | Apply the fixes the equivalence gate accepts, in place, then report what is left. |
| `clint convert` | Rename `.js/.jsx/.ts/.tsx/.mts/.cts` files to `.civet`, repair the arrow bodies the rename would break, then fix. See [migrating.md](migrating.md). |
| `clint config [file]` | Print the resolved preset, compiler, rules, rule options and skipped rules as JSON. With a file, include the overrides that match it. |

`fix` never changes what a file compiles to. `convert` is the only command that runs
the `repair` rules: they fix code that was right as JS but means something else as
Civet, so they change the output on purpose.

Only the first argument is read as a command, so `clint src fix` checks a directory
named `fix`.

## Options

| Option | Description |
|---|---|
| `-c`, `--config <path>` | Config file. Only needed for a name outside `clint.config.json`, `.clintrc.json`, `.clint.json`. |
| `-f`, `--format <text\|json>` | `text` (default) or `json` for CI. |
| `-j`, `--concurrency <n>` | Worker threads, default the CPU count. `1` runs in-process. Output order is the same either way. |
| `--verbose` | Print the config path, compiler version, preset, matching overrides and file count to stderr. JSON output stays clean. |
| `-v`, `--version` | Print the version. |
| `-h`, `--help` | Show help. |

## Older flags

Scripts written for earlier versions keep working:

| Flag | Same as |
|---|---|
| `--check` | `clint check` |
| `-w`, `--write`, `--fix` | `clint fix` |
| `--rewrite` | `clint convert` |
| `--print-config [file]` | `clint config [file]` |
