# Upstream Civet Collaboration & Technical Roadmap

`civet-clint` is a standalone, compiler-backed style checker and autofixer for [Civet](https://civet.dev). It is authored in Civet and published under the MIT license to align directly with the Civet project and community.

---

## Current Status

- **Stable Release:** Published on npm as [`civet-clint`](https://www.npmjs.com/package/civet-clint) under the `latest` dist-tag.
- **Compiler Version:** Pinned to `@danielx/civet@0.11.15`.
- **Real-World Validation:** Enforced in production CI across a 266-file Civet codebase with built-in rules passing at `error` level (see [Production Case Study](case-study-production.md)).
- **Safety Engine:** Verified byte-for-byte identical output by default, with an opt-in reference compilation mechanism for bounded quote-style transforms.

---

## Maintainer Collaboration Asks

We seek constructive collaboration and feedback from the Civet maintainers around three concrete areas:

### 1. Inclusion in Civet Integrations Directory
Civet's [Integrations documentation](https://civet.dev/integrations) currently lists `eslint-plugin-civet` under Linters. We would like to inquire if `civet-clint` may be listed alongside ESLint as an officially recognized standalone style checker and compiler-backed autofixer for Civet.

### 2. Stable Source Spans and AST Traversal API
Clint inspects AST nodes and comments by parsing with `compile(source, { ast: "raw" })`. While `{ ast: "raw" }` is a public compiler option, the resulting `CivetAST` tree is typed as `unknown`, and internal node shapes (such as `$loc`, `children`, and `parent`) are treated as internal compiler implementation details rather than a frozen extension contract.

We would welcome discussion on:
- Exposing stable source-location spans on public AST nodes.
- Providing a supported AST traversal/visitor utility or token stream that allows linters and tooling to reliably locate expressions, declarations, comments, and JSX elements without binding to parser internals.

### 3. Normalized Effective Configuration API
Civet projects configure parsing and compilation using `civet.json`, `civetconfig.json`, or umbrella flags like `coffeeCompat` and `esCompat`. Currently, Clint parses static JSON configuration files and checks rule capabilities against declared `parseOptions`.

Clint can adopt the existing `@danielx/civet/config` loader for official discovery and loading behavior. A complementary normalization API that resolves effective parse options by expanding umbrella presets and negations would allow Clint to determine the exact active compiler dial under all configuration styles.

---

## Future Technical Roadmap

The following improvements are planned for subsequent technical PRs:

1. **Adopt `@danielx/civet/config`:**
   - Migrate Clint's configuration loading to use `@danielx/civet/config` for the officially supported config filenames and dynamic formats.
2. **Normalize Compiler Options & Dial Expansion:**
   - Automatically expand umbrella configuration options (`coffeeCompat`, `esCompat`) into their constituent boolean and value flags to ensure precise dial capability matching.
3. **Extend Rule Capability System:**
   - Expand `meta.capabilities` beyond `requires` / `requiresAny` to support incompatible dial constraints (e.g., mutually exclusive parsing flags) and value-dependent constraints.
4. **Expanded Preset Ecosystem:**
   - `recommended`: Standard, dialect-neutral Civet best practices.
   - `coffee`: Idiomatic CoffeeScript-style conventions (`coffeeIsnt`, `coffeeRange`, `autoLet`).
   - `react`: React JSX shorthands and component patterns without requiring CoffeeScript operators.
   - `coffee-react`: Combined preset for CoffeeScript-style React codebases.
   - `coffee-to-standard`: Transitional rules for migrating CoffeeScript-compatible source back toward standard Civet (implemented for comments, `isnt`, `:=`, and exported auto-bindings).
   - `migration`: Future transitional rules designed for incremental migration from JavaScript/TypeScript to Civet.
   - `solid`: Dialect rules tailored for SolidJS JSX and fine-grained reactivity.
