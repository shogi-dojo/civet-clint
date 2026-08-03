# Upstream path

`civet-clint` is deliberately a standalone proof of concept. Its license and source language match Civet so that successful parts can move into the main project without a license or language migration.

## Candidate integration

- Move the rule engine and CLI under a dedicated Civet integration package, alongside the existing ESLint integration.
- Keep style presets outside the compiler core. The rewrite engine should accept the project's resolved parse options and opt-in rules.
- Reuse the standalone behavior fixtures as integration tests, including byte-identical emitted-output checks.

## Compatibility blocker

The POC obtains source spans from `compile(source, { ast: "raw" })`. The option is public, but `CivetAST` is intentionally typed as `unknown`, and properties such as `$loc`, `children`, and `parent` are not a stable extension API.

Before upstreaming, expose a small supported source-token traversal API—or stable source ranges on public AST nodes—so style rules do not depend on compiler internals. Until then, `civet-clint` pins the exact Civet version and rejects fixes whenever recompilation changes the emitted output.

## Proposed sequence

1. Validate the POC against several real Civet repositories and collect false-positive and performance data.
2. Propose the stable source-span API to Civet maintainers with the smallest fixtures that require it.
3. Move the generic engine and universally useful safety rules upstream; keep project-specific presets configurable.
4. Publish from the Civet release workflow only after the public CLI and AST contract are accepted.
