# Civet style-guide coverage — worked examples for `civet-clint`

Hi Erik — you asked for real JS/TS on one side and the Civet you'd want on the
other, so a rule can be extracted or widened from it. This is that, built from
your `civet.txt` cheat-sheet.

Two pairs:

| before | after | what it exercises |
|---|---|---|
| `before-utils.ts` | `after-utils.civet` | declarations, operators, loops, `@`, `#`, `<?`, implicit return |
| `before-Card.tsx` | `after-Card.civet` | JSX attributes and class/id shorthands |

Every `after-*.civet` file is **the literal output of the tool**, not hand-written
— see `transcript.md` for the commands and their real output. Both pairs compile
to the same JavaScript under `@danielx/civet@0.11.15` (identical once trailing
semicolons are normalised, which is the only delta `--write` introduces here).

The interesting part isn't what works. It's the three places where the
cheat-sheet's literal syntax doesn't compile the way it reads, and the four
places where I couldn't tell what you'd want.

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

15 automated, 6 partial, 2 report-only, 1 not covered.

| # | Cheat-sheet item | Status | Rule |
|---|---|---|---|
| 1 | `x := y` for const, `.=` for let | ✅ | `prefer-walrus-declarations` |
| 2 | `and` / `or` / `not` | ✅ | `prefer-word-operators` |
| 3 | `is` over `===`, `isnt` over `!==` | ✅ dial-dependent | `prefer-word-operators`, `prefer-is-not` / `no-is-not` |
| 4 | `foo?` / `not foo?` | ⚠️ partial | `prefer-existential-check` — autofixes only the **loose** `!= null` / `== null`; see below |
| 5 | `T?` for `T \| undefined` | 📋 report-only | `prefer-optional-type` — TS emit wraps it as `(T \| undefined)` |
| 6 | `#` for `.length` | ✅ | `prefer-length-shorthand` (postfix — correction above) |
| 7 | `x <? "foo"` | ✅ | `prefer-typeof-shorthand` |
| 8 | No `;` | ✅ | `no-trailing-semicolons` |
| 9 | Braces not needed / implicit blocks | ⚠️ partial | `prefer-indented-blocks`, `prefer-indented-object` — see gap below |
| 10 | `b: a.b` → `a.b`; `a.{b,c}` | ⚠️ partial | `prefer-property-shorthand` does the first; `a.{b,c}` isn't implemented |
| 11 | No trailing commas | ✅ | `no-trailing-commas` |
| 12 | `()` not needed in `() =>` | ✅ | `prefer-concise-arrow` |
| 13 | Implicit `return` | ✅ | `prefer-implicit-return` |
| 14 | Calls without parens | ⚠️ partial | three rules with hardcoded callee lists (test blocks, matchers, zero-arg arrows) |
| 15 | `.pinned` for `(f) => f.pinned` | ⚠️ partial | `prefer-ampersand-shorthand` suggests `&.pinned`, report-only — **Q1** |
| 16 | `if`/`switch` without parens | ✅ | `prefer-bare-conditions` |
| 17 | `return if …` | 📋 report-only | `prefer-postfix-conditional` — emit differs by block braces |
| 18 | `for const …` → `for …` | ✅ | `prefer-bare-for` |
| 19 | `unless` instead of `if not` | ✅ | `prefer-unless` (with the guard above) |
| 20 | `@` for `this.` / `this` | ✅ | `prefer-at-shorthand` |
| 21 | Terse imports | ✅ | `prefer-terse-imports` |
| 22 | JSX tags need not be closed | ❌ | not implemented — **Q4** |
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

### On item 9 — the visible gap

This is the one that shows up worst in `after-utils.civet`. `prefer-indented-blocks`
only recognises a head that **still has its parens**:

```
if (a) {  ->  if a          ✅ de-braced
if a {    ->  if a {        ❌ braces stranded
```

And nothing de-braces a **function, class, or method body** at all — so
`export function summarize(...) {` keeps its braces, and (until 0.7.0's guards)
any block nested inside a braced body was skipped too. That's why the `after`
files still look half-converted around the outer scopes. It's the single biggest
remaining gap against your item 9, and it's what I'd build next.

---

## 3. Four questions I couldn't answer from the sheet

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

**Q4 — unclosed JSX tags (item 22).** Dropping `</span>` changes the emit by a
newline, and the false-positive surface looked large enough that I left it out.
Worth automating, or is that one you'd rather hand-edit?

---

## Reproducing

```bash
npm i -D civet-clint@0.7.0
npx clint --rewrite before-utils.ts before-Card.tsx --config clint.config.json
npx clint --write  after-utils.civet after-Card.civet --config clint.config.json
```

`clint.config.json` is one line: `{"preset": "civet-idiomatic"}` — a preset added
in 0.7.0 that turns on the dial-free idiom rules plus the JSX ones.

Every autofix is verified by compiling the candidate and comparing emitted output
against the original; anything that isn't provably equivalent (or bounded by a
declared delta such as `semicolon-style`) is rejected rather than applied.

Repo: https://github.com/shogi-dojo/civet-clint
