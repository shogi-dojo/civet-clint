# Your Civet style guide, automated

Hi Erik — you asked for real JS/TS on one side and the Civet you'd want on the
other. This is that, built from your cheat-sheet and turned into a linter that
autofixes **21 of its 24 items** on stock Civet, no dials required.

**Everything in the `after-*` files is literal tool output, not hand-written.**

---

## 1. What's covered

Declarations and operators, `@`, `arr#`, `<?`, `T?`, no semicolons or trailing
commas, implicit blocks and returns, paren-free calls and conditions, `unless`,
`return if`, terse imports, and all three JSX items — unclosed tags, slashless
self-closing, and attribute braces.

Item-by-item mapping is in **`coverage.md`**.

**Three need your call.** They're flagged but never autofixed, because each
would change the emitted JavaScript rather than just the layout:

| # | Item | Why it stops |
|---|---|---|
| 4 | `foo?` | `x?` lowers to the loose `x != null`. Rewriting `x !== null` would flip the answer for `undefined`. |
| 15 | `.pinned` | Emits `$ => $.pinned` — that renames the parameter. **Q1** |
| 24 | `.foo .bar` | `class` passes through untouched; only `className` lowers. **Q2, Q3** |

Every fix is checked by compiling before and after and comparing the output.
Anything that doesn't match is reported, not rewritten.

---

## 2. Try it before merging anything

No publish needed — it installs straight from git:

```bash
npm i -D github:shogi-dojo/civet-clint#feat/civet-idiomatic-rules

npx clint --rewrite before-utils.ts before-Card.tsx --config clint.config.json
npx clint --write  after-utils.civet after-Card.civet --config clint.config.json
```

`--rewrite` converts JS/TS to Civet; `--write` applies the style rules. Run
`--write` twice — some fixes only become available once earlier ones land.

Full command output is in `transcript.md`.

---

## 3. What it produces

`before-Card.tsx` → `after-Card.civet`:

```civet
React from react
{ Badge } from ./Badge

export default function PlayerCard(props: { player: Player; onSelect: () => void })
  player := props.player
  hasRank := player.rank !== null

  <div .player-card.featured #main-card onClick=props.onSelect>
    <Badge label=player.name count=player.tags# active=props.active>
    <span .score>{formatScore(player.score)}
    <pre .raw>{JSON.stringify(player)}</pre>
```

The imports are item 21. Item 22 runs throughout: `<Badge>` loses its `/`,
`<span>` loses its closing tag, and `<pre>` keeps both — it's whitespace-sensitive,
so dropping the closer would change the rendered text. `<textarea>` too.

That `!== null` on line 6 is item 4 declining to fire, for the reason above.

`after-utils.civet` covers the non-JSX items. Two things stay braced there on
purpose: **arrow bodies** (Civet parses `=> { ... }` as an object literal, so
de-bracing is a behaviour fix, not a style fix) and **method heads** (`m(x) {`
is indistinguishable from a call like `f(a, {b: 1}) {`, whose block must stay).

---

## 4. Two notes on the sheet

Both on the default dial, checked against `@danielx/civet@0.11.15`.

**`#` for `.length` is postfix.** It's `arr#`; `#arr` is a private field:

```
arr#    ->  arr.length
#arr    ->  this.#arr
```

**"(if entire condition is negated)" is load-bearing** — worth spelling out,
because `not` binds tighter than `and`:

```
if not a and b   ->  (!a) && b     # not the same as
unless a and b   ->  !(a && b)
```

Same trap with the existential: `if not a?` is `a == null`, but `unless a?` is
`!(a != null)`. The tool leaves both alone rather than rewriting them.

---

## 5. Open questions

**Q1 — `.pinned` or `&.pinned`?** Both compile, but they emit differently:

```
xs.filter .pinned    ->  xs.filter($ => $.pinned)
xs.filter &.pinned   ->  xs.filter(x => x.pinned)
```

`.pinned` renames the parameter, so it can't be autofixed under byte-equality.
Is the rename acceptable, or is `&.pinned` equally fine?

**Q2 — `.foo .bar` or `.foo.bar`?** You write them space-separated; the tool
emits them dot-joined. Both compile to `className="foo bar"`. Preference, or
should it be an option?

**Q3 — `class` or `className`?** The sheet says `class="foo bar"`, but Civet
passes `class` through untouched — only `className` lowers to the shorthand. So
rewriting `class` would change the emitted attribute. Is `class` intended
(React 19 accepts it), or is `className` the real target?

---

Repo: https://github.com/shogi-dojo/civet-clint
