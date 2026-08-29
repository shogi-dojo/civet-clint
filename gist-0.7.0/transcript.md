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
  14:18    error    Drop the call parens on '@entries.push' and let the argument list close the line  [style/prefer-implicit-call-args] (fixable)
  14:24    error    Remove the closing paren for '@entries.push'  [style/prefer-implicit-call-args] (fixable)
  15:5     error    Drop explicit 'return' at end of function body  [style/prefer-implicit-return] (fixable)
  18:5     error    Drop explicit 'return' at end of function body  [style/prefer-implicit-return] (fixable)
  18:30    warning  Use '&' shorthand '.flatMap &.tags' instead of verbose callback  [style/prefer-ampersand-shorthand]
  25:3     error    Prefer indentation over braces for a statement block  [style/prefer-indented-blocks] (fixable)
  27:3     error    Prefer indentation over braces for a statement block  [style/prefer-indented-blocks] (fixable)
  30:5     error    Prefer indentation over braces for a statement block  [style/prefer-indented-blocks] (fixable)
  30:9     warning  Consider existential postfix 'not player.score?' instead of 'player.score === null' (no autofix: '===' is strict, but '?' lowers to the loose '!= null')  [style/prefer-existential-check]
  30:34    warning  Consider existential postfix 'not player.score?' instead of 'player.score is undefined' (no autofix: '?' lowers to '!= null', which is not equivalent to a comparison against undefined)  [style/prefer-existential-check]
  32:5     error    Prefer indentation over braces for a statement block  [style/prefer-indented-blocks] (fixable)
  34:16    error    Drop the call parens on 'board.add' and let the argument list close the line  [style/prefer-implicit-call-args] (fixable)
  34:37    error    Remove the closing paren for 'board.add'  [style/prefer-implicit-call-args] (fixable)
  37:37    warning  Use '&' shorthand '.map &.trim()' instead of verbose callback  [style/prefer-ampersand-shorthand]
  40:3     error    Drop explicit 'return' at end of function body  [style/prefer-implicit-return] (fixable)
  44:3     error    Drop explicit 'return' at end of function body  [style/prefer-implicit-return] (fixable)
  46:5     error    Drop explicit 'return' at end of function body  [style/prefer-implicit-return] (fixable)

✖ 19 problems (14 errors, 5 warnings)
✔ Rewrote 2 files
```

The fixes listed there are reported but not applied in this pass: several only
become valid once the first round of rewrites has landed, so a second pass
picks them up.

## 3. `--write`: run to convergence

```
$ npx clint --write u.civet c.civet --config clint.config.json
c.civet
  6:14     warning  Consider existential postfix 'player.rank?' instead of 'player.rank !== null' (no autofix: '!==' is strict, but '?' lowers to the loose '!= null')  [style/prefer-existential-check]

u.civet
  18:30    warning  Use '&' shorthand '.flatMap &.tags' instead of verbose callback  [style/prefer-ampersand-shorthand]
  30:9     warning  Consider existential postfix 'not player.score?' instead of 'player.score === null' (no autofix: '===' is strict, but '?' lowers to the loose '!= null')  [style/prefer-existential-check]
  30:34    warning  Consider existential postfix 'not player.score?' instead of 'player.score is undefined' (no autofix: '?' lowers to '!= null', which is not equivalent to a comparison against undefined)  [style/prefer-existential-check]
  37:37    warning  Use '&' shorthand '.map &.trim()' instead of verbose callback  [style/prefer-ampersand-shorthand]

✖ 5 problems (0 errors, 5 warnings)
✔ Fixed 14 problems
```

Pass 2 converges:

```
$ npx clint --write u.civet c.civet --config clint.config.json
c.civet
  6:14     warning  Consider existential postfix 'player.rank?' instead of 'player.rank !== null' (no autofix: '!==' is strict, but '?' lowers to the loose '!= null')  [style/prefer-existential-check]

u.civet
  18:23    warning  Use '&' shorthand '.flatMap &.tags' instead of verbose callback  [style/prefer-ampersand-shorthand]
  29:8     warning  Consider existential postfix 'not player.score?' instead of 'player.score === null' (no autofix: '===' is strict, but '?' lowers to the loose '!= null')  [style/prefer-existential-check]
  29:33    warning  Consider existential postfix 'not player.score?' instead of 'player.score is undefined' (no autofix: '?' lowers to '!= null', which is not equivalent to a comparison against undefined)  [style/prefer-existential-check]
  35:37    warning  Use '&' shorthand '.map &.trim()' instead of verbose callback  [style/prefer-ampersand-shorthand]

✖ 5 problems (0 errors, 5 warnings)
✔ Fixed 1 problem
```

## 4. Final state

No errors, and nothing left claiming to be fixable — the remaining diagnostics
are the ones that genuinely cannot be autofixed, and each says why.

```
$ npx clint u.civet c.civet --config clint.config.json
c.civet
  6:14     warning  Consider existential postfix 'player.rank?' instead of 'player.rank !== null' (no autofix: '!==' is strict, but '?' lowers to the loose '!= null')  [style/prefer-existential-check]

u.civet
  18:23    warning  Use '&' shorthand '.flatMap &.tags' instead of verbose callback  [style/prefer-ampersand-shorthand]
  29:8     warning  Consider existential postfix 'not player.score?' instead of 'player.score === null' (no autofix: '===' is strict, but '?' lowers to the loose '!= null')  [style/prefer-existential-check]
  29:33    warning  Consider existential postfix 'not player.score?' instead of 'player.score is undefined' (no autofix: '?' lowers to '!= null', which is not equivalent to a comparison against undefined)  [style/prefer-existential-check]
  35:37    warning  Use '&' shorthand '.map &.trim()' instead of verbose callback  [style/prefer-ampersand-shorthand]

✖ 5 problems (0 errors, 5 warnings)
```

## 5. Equivalence verification

Both pairs compile to the same JavaScript.

```
before-utils.ts    vs u.civet     equivalent: true
before-Card.tsx    vs c.civet     equivalent: true
```
