# Transcript

Captured verbatim from a real run. `u.ts` / `c.tsx` are copies of
`before-utils.ts` / `before-Card.tsx`.

## 1. Version

```
$ npx clint --version
clint v0.7.0
```

## 2. `--rewrite`: JS/TS to Civet, then autofix

```
$ npx clint --rewrite u.ts c.tsx --config clint.config.json
c.civet
  6:14     warning  Consider existential postfix 'player.rank?' instead of 'player.rank !== null' (no autofix: '!==' is strict, but '?' lowers to the loose '!= null')  [style/prefer-existential-check]
  8:3      error    Drop explicit 'return' at end of function body  [style/prefer-implicit-return] (fixable)

u.civet
  6:9      warning  Use optional type shorthand 'number?' instead of 'number | undefined' (autofix disabled: TypeScript emit wraps union types)  [style/prefer-optional-type]
  15:5     error    Drop explicit 'return' at end of function body  [style/prefer-implicit-return] (fixable)
  19:5     error    Drop explicit 'return' at end of function body  [style/prefer-implicit-return] (fixable)
  19:30    warning  Use '&' shorthand '.flatMap &.tags' instead of verbose callback  [style/prefer-ampersand-shorthand]
  32:5     error    Prefer indentation over braces for a statement block  [style/prefer-indented-blocks] (fixable)
  32:9     warning  Consider existential postfix 'not player.score?' instead of 'player.score === null' (no autofix: '===' is strict, but '?' lowers to the loose '!= null')  [style/prefer-existential-check]
  32:34    warning  Consider existential postfix 'not player.score?' instead of 'player.score is undefined' (no autofix: '?' lowers to '!= null', which is not equivalent to a comparison against undefined)  [style/prefer-existential-check]
  34:5     error    Prefer indentation over braces for a statement block  [style/prefer-indented-blocks] (fixable)
  40:37    warning  Use '&' shorthand '.map &.trim()' instead of verbose callback  [style/prefer-ampersand-shorthand]
  43:3     error    Drop explicit 'return' at end of function body  [style/prefer-implicit-return] (fixable)
  48:3     error    Drop explicit 'return' at end of function body  [style/prefer-implicit-return] (fixable)
  50:5     error    Drop explicit 'return' at end of function body  [style/prefer-implicit-return] (fixable)

✖ 14 problems (8 errors, 6 warnings)
✔ Rewrote 2 files
```

Eight fixes are reported but not applied in this pass: they only become valid
once the first round of rewrites has landed, so a second pass picks them up.

## 3. `--write`: run to convergence

```
$ npx clint --write u.civet c.civet --config clint.config.json
c.civet
  6:14     warning  Consider existential postfix 'player.rank?' instead of 'player.rank !== null' (no autofix: '!==' is strict, but '?' lowers to the loose '!= null')  [style/prefer-existential-check]

u.civet
  6:9      warning  Use optional type shorthand 'number?' instead of 'number | undefined' (autofix disabled: TypeScript emit wraps union types)  [style/prefer-optional-type]
  19:30    warning  Use '&' shorthand '.flatMap &.tags' instead of verbose callback  [style/prefer-ampersand-shorthand]
  32:9     warning  Consider existential postfix 'not player.score?' instead of 'player.score === null' (no autofix: '===' is strict, but '?' lowers to the loose '!= null')  [style/prefer-existential-check]
  32:34    warning  Consider existential postfix 'not player.score?' instead of 'player.score is undefined' (no autofix: '?' lowers to '!= null', which is not equivalent to a comparison against undefined)  [style/prefer-existential-check]
  40:37    warning  Use '&' shorthand '.map &.trim()' instead of verbose callback  [style/prefer-ampersand-shorthand]

✖ 6 problems (0 errors, 6 warnings)
✔ Fixed 8 problems
```

## 4. Final state

No errors. Nothing left that claims to be fixable, because the remaining
diagnostics are the ones that genuinely cannot be autofixed.

```
$ npx clint u.civet c.civet --config clint.config.json
c.civet
  6:14     warning  Consider existential postfix 'player.rank?' instead of 'player.rank !== null' (no autofix: '!==' is strict, but '?' lowers to the loose '!= null')  [style/prefer-existential-check]

u.civet
  6:9      warning  Use optional type shorthand 'number?' instead of 'number | undefined' (autofix disabled: TypeScript emit wraps union types)  [style/prefer-optional-type]
  19:23    warning  Use '&' shorthand '.flatMap &.tags' instead of verbose callback  [style/prefer-ampersand-shorthand]
  32:8     warning  Consider existential postfix 'not player.score?' instead of 'player.score === null' (no autofix: '===' is strict, but '?' lowers to the loose '!= null')  [style/prefer-existential-check]
  32:33    warning  Consider existential postfix 'not player.score?' instead of 'player.score is undefined' (no autofix: '?' lowers to '!= null', which is not equivalent to a comparison against undefined)  [style/prefer-existential-check]
  39:37    warning  Use '&' shorthand '.map &.trim()' instead of verbose callback  [style/prefer-ampersand-shorthand]

✖ 6 problems (0 errors, 6 warnings)
```

## 5. Equivalence verification

Both pairs compile to the same JavaScript. The only raw difference is the
trailing semicolons that `no-trailing-semicolons` removes — the engine's
`semicolon-style` delta, which it verifies independently before applying.

```
before-utils.ts    vs u.civet     raw: false   semicolon-normalised: true
before-Card.tsx    vs c.civet     raw: false   semicolon-normalised: true
```
