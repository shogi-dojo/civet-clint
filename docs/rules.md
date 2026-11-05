# Rules Catalog

`civet-clint` has 51 built-in rules. Each links to its source. Presets that enable them are in [presets.md](presets.md).

## Fixable Rules

| Rule ID | Description | Required Dial |
|---|---|---|
| [`style/prefer-word-operators`](../src/rules/prefer-word-operators.civet) | Convert `===`, `!==`, `&&`, `||`, `!` to `is`, `isnt`, `and`, `or`, `not`. | — |
| [`style/prefer-concise-arrow`](../src/rules/prefer-concise-arrow.civet) | Convert parameterless `() =>` to concise `=>`. | — |
| [`style/no-trailing-semicolons`](../src/rules/no-trailing-semicolons.civet) | **Phase `cleanup`.** Disallow unnecessary trailing semicolons at statement ends. Keeps any semicolon that suppresses an implicit return — see below. Verified via `semicolon-style` output delta. | — |
| [`style/prefer-jsx-shorthand`](../src/rules/prefer-jsx-shorthand.civet) | Convert `class="btn"` (or React `className="btn"`) and `id="main"` to `.btn` and `#main` shorthands. Only where the shorthand lowers in place — see below. | — |
| [`style/prefer-bare-assignment`](../src/rules/prefer-bare-assignment.civet) | Prefer bare `x = 1` for `let` and `:=` for `CONST_CASE` bindings. | `autoLet` |
| [`style/prefer-walrus-declarations`](../src/rules/prefer-walrus-declarations.civet) | Convert `const x = …` to `x := …` and `let x = …` to `x .= …`, including destructuring patterns. Byte-identical output. Conflicts with `prefer-bare-assignment`. | — |
| [`style/prefer-existential-check`](../src/rules/prefer-existential-check.civet) | Convert `x != null`, `null != x`, `x !== undefined` to `x?`, and `x == null`, `x === undefined` to `not x?`. | — |
| [`style/prefer-unless`](../src/rules/prefer-unless.civet) | Convert negated `if` conditions and `while not` / `while true` loops to `unless`, `until`, and `loop`. Guards whole-condition precedence. | — |
| [`style/prefer-at-shorthand`](../src/rules/prefer-at-shorthand.civet) | Convert `this.x`, `this?.x`, `this[k]`, `this.#p`, and `this` to `@x`, `@?.x`, `@[k]`, `@#p`, and `@`. | — |
| [`style/prefer-length-shorthand`](../src/rules/prefer-length-shorthand.civet) | Convert `arr.length` and `arr?.length` to `arr#` and `arr?#`. Skipped under `coffeeComment`, where `#` opens a line comment and `arr#` would truncate the line. | not `coffeeComment` |
| [`style/prefer-typeof-shorthand`](../src/rules/prefer-typeof-shorthand.civet) | Convert positive `typeof x` checks to `x <? "type"` and negated checks to `x !<? "type"`. | — |
| [`style/prefer-in-operator`](../src/rules/prefer-in-operator.civet) | Convert `values.includes(x)` and its negation to `x is in values` / `x is not in values`. An implicit-call operand gets its parens (`Number(id) is in ids`) and a bare JSX attribute value its braces (`checked={x is in xs}`); an operand looser than membership (`b or c`, a ternary, a comparison) is reported without a fix. | — |
| [`style/prefer-new-shorthand`](../src/rules/prefer-new-shorthand.civet) | Remove empty constructor-call parentheses (`new Foo()` → `new Foo`), preserving grouping before chained access. | — |
| [`style/prefer-slice-shorthand`](../src/rules/prefer-slice-shorthand.civet) | Convert exclusive `.slice` calls to Civet range-index syntax. Optional chains and unsupported forms are skipped. | — |
| [`style/prefer-property-shorthand`](../src/rules/prefer-property-shorthand.civet) | Convert `{ b: a.b }` and `{ c: a.b.c }` to `{ a.b }` and `{ a.b.c }`. Judged by the property's own object: a brace-free argument list nested inside a braced literal has no shorthand and is left alone. | — |
| [`style/prefer-property-group-shorthand`](../src/rules/prefer-property-group-shorthand.civet) | Group a run of shorthand properties sharing a receiver: `{ a.b, a.c }` → `{ a.{b,c} }`. Plain-identifier receivers only — see below. | — |
| [`style/prefer-postfix-conditional`](../src/rules/prefer-postfix-conditional.civet) | Prefer postfix conditional `return if a` over one-liner `if (a) return`. Verified via the `block-brace-style` output delta. | — |
| [`style/prefer-optional-type`](../src/rules/prefer-optional-type.civet) | Prefer optional type shorthand `T?` over `T \| undefined`. Verified via the `type-paren-style` output delta. | — |
| [`style/prefer-implicit-return`](../src/rules/prefer-implicit-return.civet) | Drop explicit `return` at trailing position of functions, methods, and arrows. Bails on generators, object returns, loops, valueless `return`, a class constructor's `return` (`new` yields what it returns), a function typed `: void` or `Promise<void>`, `return` before a statement form (`switch`, a loop, an `else if` chain), and any `return` that is not textually last. A one-line `return if c then a else b` becomes `if c then a else b` (`conditional-return` delta). A one-line `get data() { return x }` loses its braces too (`get data() x`), because `{ x }` would re-parse as an object literal. **Not in any preset** — see below. | — |
| [`style/prefer-bare-for`](../src/rules/prefer-bare-for.civet) | Convert `for const x of xs` and `for (const x of xs)` to `for x of xs`. | — |
| [`style/prefer-range-loop`](../src/rules/prefer-range-loop.civet) | Convert guarded numeric C-style loops to range loops; otherwise rewrite the head to Civet's equivalent `for i .= start; test; i++` form. Guards index mutation, bound mutation/effects, captures, and later reads. A counter the body never reads is written `_` (`for _ of [0..<n]`). | — |
| [`style/prefer-function-declaration`](../src/rules/prefer-function-declaration.civet) | Convert a named `const` arrow with a block body to a function declaration when it has no earlier uses, reassignment, or lexical `this`/`arguments`/`super`/`new.target`. Unsafe sites are reported without a fix. Warn-level in `civet-idiomatic`. | — |
| [`style/prefer-bare-conditions`](../src/rules/prefer-bare-conditions.civet) | Omit outer parentheses around `if`, `unless`, `while`, and `switch` condition expressions. Verified via `whitespace-style` output delta. | — |
| [`style/prefer-implicit-block-call`](../src/rules/prefer-implicit-block-call.civet) | Drop the call parens on multi-line `describe`/`it`/`test` blocks and hooks so indentation closes them, removing stacked `)))` closers. | — |
| [`style/prefer-implicit-call-args`](../src/rules/prefer-implicit-call-args.civet) | Drop call parens on trailing calls when the argument list is unambiguous. Single-line, statement-ending calls only; an empty argument list keeps its parens. | — |
| [`style/prefer-implicit-arrow-arg`](../src/rules/prefer-implicit-arrow-arg.civet) | Drop call parens when the sole argument is a zero-parameter arrow (`vi.fn => x`, `lazy => import(…)`), including the implicit-call form `createMemo (=> x)`. Never fires on an object property followed by more properties — the arrow would absorb them — or on a multi-argument call, and it defers to `style/no-single-param-arrow-without-parens` so a fix never trades one finding for another. | — |
| [`style/prefer-implicit-object-arg`](../src/rules/prefer-implicit-object-arg.civet) | Drop the braces from a single-line object that closes its line and is the last argument of a paren-free call (`f x, { a: 1 }` → `f x, a: 1`), a JSX attribute value (`p={{ a: 1 }}` → `p={a: 1}`), or an arrow body (`=> ({ a: 1 })` → `=> a: 1`). Keeps shorthand entries, spreads, methods and getters, a first key Civet reads as syntax (`when`, `from`, `do`, `await`, …), explicit-paren calls and anything after the object. Verified via the `whitespace-style` output delta. | — |
| [`style/prefer-terse-imports`](../src/rules/prefer-terse-imports.civet) | Omit the optional `import` keyword and unquote safe module paths (`{ t } from ../i18n`). Accepts [`unquoteSingleQuotes`](rules.md#rule-options). | — |
| [`style/prefer-jsx-attr-shorthand`](../src/rules/prefer-jsx-attr-shorthand.civet) | Convert `prop={prop}` to `{prop}` and combine adjacent `{foo} {bar}` into `{foo, bar}`. `prop={true}` is reported but not fixed — see below. | — |
| [`style/prefer-bare-jsx-values`](../src/rules/prefer-bare-jsx-values.civet) | Convert braced values `attr={value}` to bare values `attr=value` for identifiers, member expressions, and non-string literals. | — |
| [`style/prefer-unclosed-jsx`](../src/rules/prefer-unclosed-jsx.civet) | Drop a redundant closing tag (`<span>hi</span>` → `<span>hi`) and the `/` from a self-closing tag (`<Foo a=1 />` → `<Foo a=1>`), where indentation already delimits the element. `<pre>`/`<textarea>` keep their closers — see below. | — |
| [`style/prefer-hash-comments`](../src/rules/prefer-hash-comments.civet) | Convert `//` line comments to CoffeeScript `#` comments. | `coffeeComment` |
| [`style/prefer-slash-comments`](../src/rules/prefer-slash-comments.civet) | Convert CoffeeScript `#` comments to standard Civet `//` comments while preserving directives, shebangs, block comments, and JSX text. | `coffeeComment` |
| [`style/prefer-is-not`](../src/rules/prefer-is-not.civet) | Convert CoffeeScript `isnt` to standard Civet `is not`. | `coffeeIsnt` |
| [`style/prefer-explicit-declarations`](../src/rules/prefer-explicit-declarations.civet) | Convert `:=` and exported auto-bindings to explicit `const`/`let` declarations. Bare `autoLet` requires scope/hoisting analysis and remains untouched. | `autoLet` |
| [`style/no-trailing-commas`](../src/rules/no-trailing-commas.civet) | Remove commas before a closing bracket, brace or paren. With `lineEndings: true` (on in `civet-idiomatic`), also remove commas at the end of lines in multiline lists, compiler-checking ambiguous cases; never edits regex literals, array elisions, or a comma after a rest element. Trailing commas use the `trailing-comma-style` output delta. | — |
| [`style/prefer-indented-object`](../src/rules/prefer-indented-object.civet) | Drop the braces from a multi-line object literal bound to a declaration, letting indentation delimit it. | — |
| [`style/prefer-indented-blocks`](../src/rules/prefer-indented-blocks.civet) | Drop the braces from a JS-style block, letting indentation delimit the body: statement blocks (`if` / `unless` / `for` / `while` / `switch` / `try` / `catch` / `finally`, with or without head parens), declaration bodies (`function` / `class` / method), and compiler-equivalent arrow bodies. Arrow candidates are compiled in a batch and unsafe candidates are skipped. Verified via `whitespace-style` output delta. Two other shapes are reported without a fix — see below. | — |
| [`style/no-braced-arrow-body`](../src/rules/no-braced-arrow-body.civet) | **Phase `repair`.** De-brace a `=> { ... }` body that Civet parses as an object literal. Fixed only by `clint convert`; `clint fix` reports it, because the fix changes emitted output. | — |
| [`style/no-discarded-arrow-return`](../src/rules/no-discarded-arrow-return.civet) | **Phase `repair`.** Remove a trailing `;` that collapses a concise arrow into a block discarding its return value. Fixed only by `clint convert`; `clint fix` reports it, because the fix changes emitted output. | — |

## Rule options

### `style/prefer-terse-imports`

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

### `style/prefer-ampersand-shorthand`

`autofixPlaceholders` defaults to `false`. Set it to `true` to rewrite a direct
single-parameter property callback such as `(x) => x.id` to `&.id`. The compiler
renames that one parameter to `$`, so Clint keeps the transformation opt-in and
checks it with a narrow alpha-renaming output delta.

The second check is what makes the first safe to trust. A reference source is supplied
by the rule, so on its own it would let a rule authorize its own rewrite; the
engine-owned delta bound is not something a rule can widen. The strict byte-identity
check is unchanged for every other rule and for this rule's default path.

### `style/no-single-param-arrow-without-parens`

| Option | Type | Default | Description |
|---|---|---|---|
| `extraZeroArgCallees` | string[] | `[]` | Project-local callees whose callback takes no arguments, exempted from the ambiguity warning. An entry is a name or a pattern where `*` matches any run of identifier characters (`"use*"`, `"render*"`). |

In Civet `name => x` always compiles to the call `name(() => x)`, so the warning is
about readers coming from JavaScript, not about a different program. Patterns exist so
a family of hooks or test helpers can be listed once: `use*` also matches `user`, so
prefer a prefix that names the family. A pattern needs a literal character (a bare
`*` would disable the rule), and entries are validated when the config loads.

## Rule notes

### `style/prefer-implicit-return` — why it is opt-in

The rule is correct for the shapes it handles, but Civet's implicit-return
semantics are subtle enough that it still proposes fixes the equivalence gate
rejects: 22 sites across a 441-file production codebase. A rejected fix surfaces
as a `compiler-equivalence-mismatch` error, so at `error` in a preset it would
make `clint check` exit non-zero on style-guide-conformant code, on every run.

It is registered and fully supported — enable it explicitly:

```json
{ "rules": { "style/prefer-implicit-return": "error" } }
```

It will move into `civet-idiomatic` once that number is zero.

### `style/prefer-indented-blocks` — what counts as a block

Statement heads and declaration bodies both qualify; every shape below was probed
byte-identical against `@danielx/civet@0.11.15`:

```civet
if (a) {  ✅   if a {  ✅   function f(x) {  ✅   class A {  ✅   m(x) {  ✅

function C(p: { x: number }) {  ✅    // a brace in the parameter list is fine here:
                                      // the `function` keyword is what makes the
                                      // line unambiguously a declaration
```

Four do not, each for a different reason:

```civet
f := (x) => { … }    // style/no-braced-arrow-body's — de-bracing is a repair,
                     // not a layout change, and blocks nested inside one are
                     // skipped too until that rule has run
f(x) { a: 1 }        // a CALL, not a method: compiles to `f(x)({a: 1})`. The same
                     // line only means "method" inside a class or object literal
clone() { … },       // the closer carries a `,` that separates object properties;
                     // de-bracing would strand it
m(p: { x: 1 }) { … } // a method has no keyword to tell it from a call, so a brace
                     // in ITS parameter list is left alone -- `f(a, {b: 1}) {` must
                     // not be de-braced, and the two are not distinguishable here
```

### `style/prefer-indented-blocks` — the two shapes reported without a fix

Both are cases where the *before* side of the equivalence check is itself the bug,
so autofixing would be verifying a repair against broken output.

A **single-statement body ending in `;`** parses as an object with a method
definition — `if (a) { g(); }` becomes `if (a) ({ g() {; } })`, and `g()` never
runs.

A **block in expression position** (the last statement of a function) already
mis-parses into a returned object literal:

```civet
afterEach =>
  if (original) {
    Object.defineProperty(proto, 'scrollTo', original)
  } else {
    delete proto.scrollTo
  }
```

```js
// what Civet actually emits — both branches become returned objects
if (original) { return ({
  defineProperty: Object.defineProperty(proto, 'scrollTo', original)
})} else return ({ scrollTo: delete proto.scrollTo })
```

De-bracing *repairs* this, so the emitted output legitimately changes and the gate
correctly rejects the fix. Repair it by hand, adding a trailing `;` where the block
should return nothing.

Blocks nested inside a braced `=> { … }` arrow body are skipped entirely: de-bracing
the inner block while the arrow keeps its braces breaks compilation. Run
`style/no-braced-arrow-body` first, and this rule sees them on a later pass.

### `style/prefer-jsx-attr-shorthand` — why only one of the two forms is fixed

`prop={prop}` → `{prop}` re-expands to exactly `prop={prop}`, including after a
`{...spread}`, so compiled output is unchanged and the fix is applied.

`prop={true}` → `prop` is **reported without a fix**. Civet emits the bare attribute
as `prop`, so the compiled output genuinely differs. React treats both as `true`, but
that is a render-equivalence claim, and the gate only accepts byte-identical output.
Note the two forms are not interchangeable in source either: a bare `prop` is the
*boolean* shorthand, so writing it in place of `prop={prop}` would change meaning.

### `style/no-trailing-semicolons` — the semicolons it will not remove

In Civet a trailing `;` is not always cosmetic: inside a function body it is one of
the sanctioned ways to suppress the implicit return of the last statement.

```civet
useEffect =>
  setCount 5;        # without the `;` this becomes `return setCount(5)`, and React
                     # treats a non-function return value as a cleanup callback.
```

That position is decided from syntax: a `;` ending the last statement of a
value-returning function is left alone without compiling anything. A function
declared `: void` and a constructor have no implicit return, and a statement that
already exits (`return`, `throw`, `break`, `continue`) cannot be suppressed, so
their semicolons stay candidates.

The same goes for a JS-style braced callback made only of bare calls
(`batch(=> { setA(1); setB(2); })`): without its semicolons Civet reads the body as
an object literal, so they are kept until the braces are gone.

Every other trailing `;` in a file is verified together, with one compile compared
against the engine's baseline. Only when that fails are the candidates bisected to
find the one that matters, within a fixed budget of compiles per file.

To also remove a function-tail semicolon wherever the emit proves it redundant, at
the cost of extra compiles, enable `verifyFunctionTails`:

```json
{ "rules": { "style/no-trailing-semicolons": ["error", { "verifyFunctionTails": true }] } }
```

Note this is the opposite of `style/no-discarded-arrow-return`, where the semicolon
*must* go. The two never overlap: that rule fires only when the body is not a real
block.

### `style/prefer-jsx-shorthand` — what it will and won't rewrite

Civet lowers the `.class`/`#id` shorthand to the **front of the tag, on the tag-name
line**, wherever it was written. The rule therefore only rewrites attributes that are
already there — the leading run of `className`/`id` on the tag line:

```civet
<div className="a" id="b" onClick={f}>   ✅  → <div .a #b onClick={f}>
<div className="a" {...props}>           ✅  → <div .a {...props}>
<Icon size={16} className="i" />         ❌  would emit className before size
<div {...props} className="a">           ❌  would invert spread precedence
<button                                  ❌  would collapse the line break
  className="a"
>
```

The last two matter beyond formatting: moving `className` ahead of a `{...spread}`
changes which value wins. Skipped sites are still reported, so they surface for review.

### `style/prefer-unclosed-jsx` — when a tag can stay open

Style-guide item 22 has two halves and this rule does both: drop a closing tag, and
drop the `/` from a self-closing one. They live in one rule because the engine's
combined-fix pass verifies a batch by re-deriving each rule's edits on the text the
*other* rules already changed — split in two, dropping a `</div>` moves what the
slash half sees on the next line, the replay stops matching, and the whole batch is
rejected. Use `closingTags` / `selfClosingSlash` to take only one half:

```json
{ "rules": { "style/prefer-unclosed-jsx": ["error", { "selfClosingSlash": false }] } }
```

Civet decides where an unclosed element ends from what *follows* it, so both halves
are guarded by the next non-blank line:

```civet
<div>
  <span>hi</span>      ✅  → <span>hi
  <Icon size=16 />     ✅  → <Icon size=16>
</div>

<span>a</span> tail          ❌  "tail" would become a child of the span
<div><Foo /><Bar /></div>    ❌  <Foo> would swallow <Bar/>
<pre>code</pre>              ❌  the guide's stated exception

<div .outer>
  <div .spot />              ❌  `</div>` would pair with <div .spot>, not <div .outer>
</div>

slot={cond ? null : (
  <Timer id=1 />             ❌  a `)` or `}` closer next stops the parse
)}
```

The `<div .spot />` case is the subtle one: it only bites when the tag name matches
the enclosing element's, so it shows up on HTML-cased tags and never on components.
`<pre>` and `<textarea>` are skipped on the guide's authority, not the compiler's —
the equivalence gate accepts dropping their closers, but re-emitting a closer on its
own line inside a whitespace-preserving element is not a change worth assuming away.

### `style/prefer-property-group-shorthand` — why the receiver must be an identifier

Style-guide item 10 has two halves. `style/prefer-property-shorthand` does the first
(`b: a.b` → `a.b`); this rule groups the result. It matches only the already-shortened
form on purpose — grouping the long form directly would put two rules' edits over the
same characters in one pass. Both are in `civet-idiomatic`, so long-form source
converges in two passes.

The receiver has to be a plain identifier, because Civet caches a compound one to keep
it single-evaluation:

```civet
{ a.b, a.c }      ✅  → { a.{b,c} }        emits  {b: a.b, c: a.c}
{ a?.b, a?.c }    ✅  → { a?.{b,c} }
{ a.q.b, a.q.c }  ❌  → { a.q.{b,c} }      emits  let ref;{b:(ref = a.q).b,c:ref.c}
```

That last one is a behaviour change, not a layout one, so the rule leaves it alone.

## Diagnostic Rules

| Rule ID | Description | Required Dial |
|---|---|---|
| [`style/prefer-jsx-attr-shorthand`](../src/rules/prefer-jsx-attr-shorthand.civet) | Report `prop={true}`, which lowers to `prop` and so is not byte-identical. The fixable forms are listed above. | — |
| [`style/prefer-ampersand-shorthand`](../src/rules/prefer-ampersand-shorthand.civet) | Prefer `&` shorthand for single-parameter callbacks. Placeholder parameter renames are autofixed only with `autofixPlaceholders: true`. | — |
| [`style/prefer-switch`](../src/rules/prefer-switch.civet) | Rewrite a chain of equality tests on one variable as a pattern `switch` (`3 then 'A'`). Every branch must test the same variable; a chain that mixes in `count > 3` or `and current.id` is not reported. The fix covers statement-position chains in indentation form against literals; a chain assigned to a variable, compared against an identifier, braced, or with a comment between branches is reported without one. Verified via the `block-brace-style` and `whitespace-style` deltas. | — |
| [`style/no-single-param-arrow-without-parens`](../src/rules/no-single-param-arrow-without-parens.civet) | Flag `name => x`, which Civet compiles to the call `name(() => x)` rather than an arrow with a parameter. Callees known to take a zero-argument callback are exempt; add project-local ones, or whole families such as `"use*"`, with [`extraZeroArgCallees`](#styleno-single-param-arrow-without-parens). | — |
| [`style/prefer-named-export-default`](../src/rules/prefer-named-export-default.civet) | Prefer named default exports (`export default MyComp = ...`). | — |
| [`style/no-thin-arrow`](../src/rules/no-thin-arrow.civet) | Disallow thin arrows `->` in favor of fat arrows `=>`. | — |
| [`style/no-pipe-operator`](../src/rules/no-pipe-operator.civet) | Disallow pipe operator `\|>`. | — |
| [`style/prefer-range-operator`](../src/rules/prefer-range-operator.civet) | Prefer `[0...N].map` range loops over `Array.from({ length: N }, ...)`. | `coffeeRange` |
| [`style/no-null-equality`](../src/rules/no-null-equality.civet) | Disallow direct comparisons with `null`. | — |
| [`style/no-is-not`](../src/rules/no-is-not.civet) | Disallow `is not` in favor of `isnt`. | `coffeeIsnt` or `coffeeNot` |
| [`style/no-mixed-interpolation`](../src/rules/no-mixed-interpolation.civet) | Disallow mixing `${...}` and `#{...}` within the same file. | — |

## Style-Guide Coverage

Clint automates the *mechanical* conventions of a Civet style guide — the ones with
a deterministic, compiler-verifiable rewrite. Several conventions are deliberately
out of scope; their absence is a design boundary, not a missing feature.

| Convention | Status | Notes |
|---|---|---|
| Word operators, existential checks, terse declarations/exports, terse imports, JSX shorthands, arrow style, range loops | **Automated** | See the rule tables above. |
| JSX class/id shorthand where the attribute is not already first on the tag line | Partially automated | The shorthand lowers to the front of the tag, so rewriting elsewhere reorders emitted attributes — or changes precedence against a `{...spread}`. Reported, not autofixed. |
| Side-effect import ordering | Not automated | Reordering imports can change evaluation order, so it is not compiler-equivalent. |
| Single-quoted module paths | Automated, opt-in | Off by default, because unquoting `'./x'` changes the emitted quote character. Set [`unquoteSingleQuotes`](rules.md#rule-options) on `style/prefer-terse-imports` to enable it; the fix is then verified against a reference compile so the change is provably confined to specifier quote style. |
| Removing unused or default `React` imports | Not automated | Requires whole-program binding analysis; deleting a binding is not an equivalence-preserving edit. |
| Comment quality, naming, file/layer organization, architectural policy (i18n via `t()`, no `fetch` in components) | Not automated | Qualitative judgments with no mechanical rewrite. Enforce in review. |
