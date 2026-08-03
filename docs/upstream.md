# Upstream path

`civet-clint` is deliberately a standalone proof of concept. Its license and source language match Civet so that successful parts can move into the main project without a license or language migration.

## Candidate integration

- Move the rule engine and CLI under a dedicated Civet integration package, alongside the existing ESLint integration.
- Keep style presets outside the compiler core. The rewrite engine should accept the project's resolved parse options and opt-in rules.
- Reuse the standalone behavior fixtures as integration tests, including byte-identical emitted-output checks.

## Supported configuration boundary

Clint consumes the project's `civet.json` through a compiler/config adapter (`src/compiler.civet`) that splits it into:

- **The dial** (`parseOptions`): Coffee/React/TS parsing flags such as `coffeeIsnt`, `coffeeEq`, `coffeeComment`, `react`, `ts`, `autoLet`, ... The dial drives raw-AST shape and rule applicability.
- **Top-level `CompileOptions`** (everything outside `parseOptions`, e.g. `js`, `trace`): retained and threaded through both the baseline and candidate compiles so equivalence is decided under the same emitted-output pipeline the project uses.

Supported in Civet 0.11.15:

- Presets: `default` (the neutral default, empty dial, only dial-independent rules) and `coffee-react` (`coffeeIsnt` + `react`, explicitly selected by Coffee/React consumers).
- Rule capabilities: a rule declares `meta.capabilities.requires` and/or `requiresAny` (e.g. `style/prefer-jsx-shorthand` requires `react`; `style/no-is-not` runs with either `coffeeIsnt` or `coffeeNot`). Rules whose requirements are unsatisfied by the resolved dial are **skipped** — reported by `clint --print-config` and never executed — so an autofix whose replacement is invalid under the active dial is never even proposed.
- `clint --print-config` prints the resolved preset, compiler options, rules, and skipped/incompatible rules.

Not yet supported (do not claim arbitrary compiler-version or compiler-configuration support):

- Pinning is to Civet `0.11.15` exactly. A different Civet version may change dial keys or the raw-AST shape.
- Configuration is resolved once for the workspace, not per file.
- Clint does not yet prove that *every* enabled rule is valid under the dial beyond the declared `requires` capabilities; the compiler-equivalence guard remains the final safety net.

## Compatibility blocker

The POC obtains source spans from `compile(source, { ast: "raw" })`. The option is public, but `CivetAST` is intentionally typed as `unknown`, and properties such as `$loc`, `children`, and `parent` are not a stable extension API. `src/compiler.civet` now isolates construction of the compiler invocation, but raw node-shape access still exists in rules and `src/utils.civet`; introducing a node/source-range adapter remains required before upstreaming.

Before upstreaming, expose a small supported source-token traversal API—or stable source ranges on public AST nodes—so style rules do not depend on compiler internals. Until then, `civet-clint` pins the exact Civet version and rejects fixes whenever recompilation changes the emitted output.

## Proposed sequence

1. Validate the POC against several real Civet repositories and collect false-positive and performance data.
2. Propose the stable source-span API to Civet maintainers with the smallest fixtures that require it.
3. Move the generic engine and universally useful safety rules upstream; keep project-specific presets configurable.
4. Publish from the Civet release workflow only after the public CLI and AST contract are accepted.
