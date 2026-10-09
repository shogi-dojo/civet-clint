# Full coverage — item by item

Against the 24 items in the cheat-sheet. Everything here is on the **default
Civet dial** unless a row says otherwise.

| # | Item | Rule |
|---|---|---|
| 1 | `x := y` for const, `.=` for let | `prefer-walrus-declarations` |
| 2 | `and` / `or` / `not` | `prefer-word-operators` |
| 3 | `is` over `===`, `is not` over `!==` | `prefer-word-operators`, `no-is-not` |
| 4 | `foo?` / `not foo?` | `prefer-existential-check` — **loose form only**, see below |
| 5 | `T?` for `T \| undefined` | `prefer-optional-type` |
| 6 | `#` for `.length` | `prefer-length-shorthand` (postfix — `arr#`) |
| 7 | `x <? "foo"` | `prefer-typeof-shorthand` |
| 8 | No `;` | `no-trailing-semicolons` |
| 9 | Braces not needed | `prefer-indented-blocks`, `prefer-indented-object` |
| 10 | `b: a.b` → `a.b`; `a.{b,c}` | `prefer-property-shorthand`, `prefer-property-group-shorthand` |
| 11 | No trailing commas | `no-trailing-commas` |
| 12 | `()` not needed in `() =>` | `prefer-concise-arrow` |
| 13 | Implicit `return` | `prefer-implicit-return` — opt-in, see below |
| 14 | Calls without parens | `prefer-implicit-call-args`, `-block-call`, `-arrow-arg` |
| 15 | `.pinned` for `(f) => f.pinned` | `prefer-ampersand-shorthand` — **report-only, Q1** |
| 16 | `if`/`switch` without parens | `prefer-bare-conditions` |
| 17 | `return if …` | `prefer-postfix-conditional` |
| 18 | `for const …` → `for …` | `prefer-bare-for` |
| 19 | `unless` instead of `if not` | `prefer-unless` |
| 20 | `@` for `this.` / `this` | `prefer-at-shorthand` |
| 21 | Terse imports | `prefer-terse-imports` |
| 22 | JSX tags need not be closed | `prefer-unclosed-jsx` |
| 23 | JSX attribute braces omitted | `prefer-bare-jsx-values`, `prefer-jsx-attr-shorthand` |
| — | Parens left around a returned JSX element | `no-redundant-jsx-parens` (not a sheet item; falls out of implicit return) |
| 24 | JSX classes `.foo .bar` | `prefer-jsx-shorthand` — **partial, Q2/Q3** |

### Item 4 — why only the loose form

`x?` lowers to `x != null`, which is a *loose* check. So:

```
x != null   ->  x?           # safe, autofixed
x !== null  ->  x?           # NOT safe: true for undefined, x? is false
```

The strict comparisons are reported with the reason, not rewritten.

### Item 13 — why implicit return is opt-in

It's enabled explicitly in this sample's config rather than being part of the
preset. On a 441-file production codebase it still proposes 22 fixes the
equivalence check rejects, and a rejected fix is reported as an error — so at
`error` in a default preset it would fail CI on conforming code. Clean here.

### Item 22 — two things the sheet doesn't mention

Both found by running the rule over a real codebase:

1. **`<pre>` and `<textarea>` keep their closers.** Civet re-emits a dropped
   closer on a new line, which changes the text content of a whitespace-sensitive
   element.
2. **A same-name closer can reparent.** In `<div .outer><div .spot /></div>`, the
   `</div>` cannot be dropped — Civet would pair it with `<div .spot>` instead of
   `<div .outer>` and silently adopt the following siblings. Guarded.

---

## If you use the CoffeeScript dials

None of this applies to default Civet — it's here because the codebase this was
built against runs `coffeeComment`, `coffeeNot`, and friends.

**`isnt` is not a keyword by default.** `a isnt b` parses as the call
`a(isnt(b))` — silently, no error. It only means `!==` under `coffeeIsnt`.
Your `is not` is the spelling that works out of the box.

|  | default | `coffeeIsnt` | `coffeeNot` |
|---|---|---|---|
| `a is not b` | `a !== b` ✅ | `a !== b` ✅ | `a === !b` ❌ |
| `a isnt b` | `a(isnt(b))` ❌ | `a !== b` ✅ | `a(isnt(b))` ❌ |

Note `coffeeNot` *breaks* `is not`: it reparses as `is (not b)`.

**`coffeeComment` disables the `#` length shorthand entirely.** `#` becomes a
line comment, so `arr#` compiles to `arr//` — it eats the rest of the line.

```
n := arr#        ->  const n = arr//
<A n={m#} />     ->  parse error
```

We found this by running the rule across a 441-file `coffeeComment` codebase: 391
findings, every one caught by the equivalence check. The rule now switches itself
off when `coffeeComment` is on.
