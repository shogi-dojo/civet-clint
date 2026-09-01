# Civet style-guide coverage — worked examples for `civet-clint`

Hi Erik — you asked for real JS/TS on one side and the Civet you'd want on the
other, so a rule can be extracted or widened from it. This is that, built from
your `civet.txt` cheat-sheet.

Two pairs:

| before | after | what it exercises |
|---|---|---|
| `before-utils.ts` | `after-utils.civet` | declarations, operators, loops, `@`, `#`, `<?`, optional types `T?`, de-braced classes/functions, property grouping `a.{b,c}`, implicit return |
| `before-Card.tsx` | `after-Card.civet` | JSX attributes, unclosed tags, slashless self-closing, `<pre>` exception, and class/id shorthands |

Every `after-*.civet` file is **the literal output of the tool**, not hand-written
— see `transcript.md` for the commands and their real output. Both pairs compile
to the same JavaScript under `@danielx/civet@0.11.15` (identical once trailing
semicolons and whitespace layout are normalised, which is the only delta `--write` introduces here).

The interesting part isn't what works. It's the three places where the
cheat-sheet's literal syntax doesn't compile the way it reads, and the open
questions on the remaining style points.

---

## 1. Three corrections to the cheat-sheet

All checked against `@danielx/civet@0.11.15`.

### `is not` vs `isnt` — dial-dependent, and the direction flips

The sheet says *"Use `is` over `===`; `is not` over `!==`"*. Which of `is not`
and `isnt` is correct depends on the parse dial, and each is **silently wrong**
under the other:

| source | default dial | `coffeeIsnt` | `coffeeNot` / `coffeeCompat` |
|---|---|---|---|
| `a is not b` | `a !== b` ✅ | `a !== b` ✅ | `a === !b` ❌ |
| `a isnt b` | `a(isnt(b))` ❌ | `a !== b` ✅ | `a !== b` ✅ |

Under the plain dial `isnt` isn't a keyword at all — `a isnt b` parses as the
**call** `a(isnt(b))`. Under `coffeeNot`, `is not` becomes `is (not b)`, i.e.
`a === !b`. Only `coffeeIsnt` makes both forms mean inequality.

If the sheet is meant to be dial-agnostic, it may be worth saying *"`isnt` (with
`coffeeIsnt` enabled)"* — that's the form that survives `coffeeNot`, which
`is not` does not.

### `#` for `.length` is postfix

The sheet says *"Use `#` shorthand for `.length`"*. The prefix form compiles to a
private field:

```
#arr    ->  this.#arr        # a private class field, not a length
arr#    ->  arr.length       # this is the shorthand
```

Postfix works everywhere we tried: `a.b.c#`, `xs[0]#`, `fn()#`, `` `str`# ``,
`obj# = 0`.

There's a second half to this one, and it's the sharper edge: **under
`coffeeComment`, `#` opens a line comment**, so the postfix form isn't a
shorthand there at all — it silently eats the rest of the line.

```
# with coffeeComment enabled
n := arr#          ->  const n = arr//
x := c# is 0       ->  const x = c// is 0
<A n={m#} />       ->  parse error
```

We only found this by running the rule across a 441-file `coffeeComment`
codebase: it produced 391 findings, every one rejected by the equivalence gate.
`civet-clint` now skips the rule entirely when `coffeeComment` is on. If the
cheat-sheet is used on a CoffeeScript-compatible dial, `#` for `.length` is not
available — worth a note in the sheet.

### `unless` needs the negation to cover the *whole* condition

Your parenthetical — *"(if entire condition is negated)"* — is load-bearing, and
worth spelling out, because `not` binds tighter than `and`/`or`:

```
if not a and b   ->  (!a) && b        # not the same as
unless a and b   ->  !(a && b)
```

The existential is a second trap in the same shape:

```
if not a?        ->  a == null        # not the same as
unless a?        ->  !(a != null)
```

`civet-clint` therefore only rewrites to `unless` when the operand of `not`/`!`
is a single primary or unary expression, or a paren wrapping the entire
condition. `if not a and b` is left alone.

---

## 2. Coverage of the 24 items

21 automated, 3 partial, 0 report-only, 0 not covered.

| # | Cheat-sheet item | Status | Rule |
|---|---|---|---|
| 1 | `x := y` for const, `.=` for let | ✅ | `prefer-walrus-declarations` |
| 2 | `and` / `or` / `not` | ✅ | `prefer-word-operators` |
| 3 | `is` over `===`, `isnt` over `!==` | ✅ dial-dependent | `prefer-word-operators`, `prefer-is-not` / `no-is-not` |
| 4 | `foo?` / `not foo?` | ⚠️ partial | `prefer-existential-check` — autofixes only the **loose** `!= null` / `== null`; see below |
| 5 | `T?` for `T \| undefined` | ✅ | `prefer-optional-type` — verified via `type-paren-style` delta |
| 6 | `#` for `.length` | ✅ | `prefer-length-shorthand` (postfix, and **not** under `coffeeComment` — correction above) |
| 7 | `x <? "foo"` | ✅ | `prefer-typeof-shorthand` |
| 8 | No `;` | ✅ | `no-trailing-semicolons` |
| 9 | Braces not needed / implicit blocks | ✅ | `prefer-indented-blocks`, `prefer-indented-object` — statement blocks, paren-free heads, function/class/method declaration bodies |
| 10 | `b: a.b` → `a.b`; `a.{b,c}` | ✅ | `prefer-property-shorthand` and `prefer-property-group-shorthand` |
| 11 | No trailing commas | ✅ | `no-trailing-commas` |
| 12 | `()` not needed in `() =>` | ✅ | `prefer-concise-arrow` |
| 13 | Implicit `return` | ✅ opt-in | `prefer-implicit-return` — enabled explicitly in this gist's config; see below |
| 14 | Calls without parens | ✅ | `prefer-implicit-call-args`, `prefer-implicit-block-call`, `prefer-implicit-arrow-arg` |
| 15 | `.pinned` for `(f) => f.pinned` | ⚠️ partial | `prefer-ampersand-shorthand` suggests `&.pinned`, report-only — **Q1** |
| 16 | `if`/`switch` without parens | ✅ | `prefer-bare-conditions` |
| 17 | `return if …` | ✅ | `prefer-postfix-conditional` — verified via `block-brace-style` delta |
| 18 | `for const …` → `for …` | ✅ | `prefer-bare-for` |
| 19 | `unless` instead of `if not` | ✅ | `prefer-unless` (with the guard above) |
| 20 | `@` for `this.` / `this` | ✅ | `prefer-at-shorthand` |
| 21 | Terse imports | ✅ | `prefer-terse-imports` |
| 22 | JSX tags need not be closed | ✅ | `prefer-unclosed-jsx` — unclosed tags, slashless self-closing, `<pre>`/`<textarea>` exception |
| 23 | JSX attribute braces omitted | ✅ | `prefer-bare-jsx-values`, `prefer-jsx-attr-shorthand` |
| 24 | JSX classes `.foo .bar` | ⚠️ partial | `prefer-jsx-shorthand` emits `.foo.bar` on `className` — **Q2, Q3** |

### On item 4 — why only the loose form autofixes

`x?` lowers to the **loose** `x != null`, so only two shapes can be rewritten
without changing behaviour:

```
x != null   ->  x?          ✅ identical emit
x == null   ->  not x?      ✅ identical emit

x !== null       ❌  true for undefined; `x?` is false
x !== undefined  ❌  true for null;      `x?` is false
```

The strict and `undefined` forms are still reported, but with no fix attached and
a message saying why. You can see both kinds in `transcript.md`.

### On item 9 — de-bracing function, class, and method bodies

`prefer-indented-blocks` de-braces statement blocks (`if`, `unless`, `for`, `while`,
`switch`, `try`, `catch`, `finally` with or without head parens) as well as
`function`, `class`, and method declaration bodies. Arrow bodies (`=> { ... }`)
stay braced by design: Civet parses a braced arrow body as an object literal, so
de-bracing one is a semantic repair handled by `style/no-braced-arrow-body` during
`--rewrite`.

One asymmetry worth flagging, because it is visible in `after-Card.civet`. A brace
inside the *parameter list* is fine on a `function` declaration -- the ordinary React
component signature `function C(p: { x: number }) {` de-braces normally. The same
brace on a bare method head does not, and that is deliberate: a method head has no
keyword to tell it apart from a call, and `f(a, {b: 1}) {` is a call whose trailing
block must stay put. `function` is the disambiguator, so only heads carrying it get
the looser treatment.

---

## 3. Three questions on remaining style points

**Q1 — `.pinned` or `&.pinned`?** The sheet says `.pinned` for
`(folder) => folder.pinned`. Both compile, but they emit differently:

```
xs.filter (folder) => folder.pinned   ->  xs.filter((folder) => folder.pinned)
xs.filter .pinned                     ->  xs.filter($ => $.pinned)
xs.filter &.pinned                    ->  xs.filter(x => x.pinned)
```

`.pinned` renames the parameter in the emit, so it can't be autofixed under
byte-equality. Is `.pinned` the form you want (and is a parameter rename an
acceptable delta), or is `&.pinned` equally fine?

**Q2 — `.foo .bar` or `.foo.bar`?** You write the classes space-separated;
`civet-clint` emits them dot-joined. Both compile to `className="foo bar"`.
Preference, or should it be an option?

**Q3 — `class` or `className`?** The sheet says `class="foo bar"`, but Civet
passes `class` straight through — only `className` lowers to the shorthand:

```
<div className="foo bar" />  ->  <div className="foo bar" />
<div class="foo bar" />      ->  <div class="foo bar" />       # unchanged
```

So `class="foo bar"` → `.foo .bar` would change the emitted attribute. Is `class`
intended (React 19 accepts it), or is `className` the real target?

### Notes on item 22 (unclosed JSX)

Item 22 is automated in `style/prefer-unclosed-jsx` covering both unclosed tags
(`<span>hi</span>` → `<span>hi`) and slashless self-closing (`<Foo a=1 />` → `<Foo a=1>`).
Two findings from implementing it:
1. **`<pre>` and `<textarea>` whitespace preservation**: Civet re-emits unclosed
   closers on a new line, which changes text content for whitespace-sensitive
   tags. They are preserved with their closers intact.
2. **Same-name closer reparenting hazard**: `<div .outer><div .spot /></div>`
   cannot drop `</div>` because Civet would pair `</div>` with `<div .spot>` rather
   than `<div .outer>`, silently reparenting subsequent sibling nodes. The rule
   guards against this.

---

## Reproducing

```bash
# Test directly from git (no publish required):
npm i -D github:shogi-dojo/civet-clint#c41e907

# (Once published on npm: npm i -D civet-clint@0.7.0)

npx clint --rewrite before-utils.ts before-Card.tsx --config clint.config.json
npx clint --write  after-utils.civet after-Card.civet --config clint.config.json
```

`clint.config.json` is the `civet-idiomatic` preset added in 0.7.0 — the
dial-free idiom rules plus the JSX ones — with `prefer-implicit-return` turned on
explicitly:

```json
{
  "preset": "civet-idiomatic",
  "rules": { "style/prefer-implicit-return": "error" }
}
```

That rule is opt-in rather than part of the preset: on a 441-file production
codebase it still proposes 22 fixes the equivalence gate rejects, and a rejected
fix surfaces as an error, so at `error` in a preset it would fail CI on
conformant code. It is clean on this sample.

Every autofix is verified by compiling the candidate and comparing emitted output
against the original; anything that isn't provably equivalent (or bounded by a
declared delta such as `semicolon-style`, `block-brace-style`, or `type-paren-style`)
is rejected rather than applied.

Repo: https://github.com/shogi-dojo/civet-clint
