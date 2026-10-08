# Clint and Civetify comparison

This note records the rule coverage and cost from the 0.7 work, the conversion of
`graph-orientation-visualizer`, and the remaining CoffeeScript compatibility
candidates. The rule timing corpus is the project's original seven `.civet`
files, using the project's Civet 0.11.5. Timings are time inside `rule.check()`;
shared parse and baseline compilation took 3,096 ms. The semicolon rule was
timed separately because it took several minutes by itself.

## Rule impact and runtime

Across 50 rules, this corpus produced 2,389 findings and applied 2,348 edits.
The measured rule time was 262,928 ms, of which `no-trailing-semicolons` used
253,787 ms (96.5%). This is a single-project diagnostic. It identifies the
semicolon rule as the first optimization target; it is not enough evidence to
deprecate it globally. Projects with a similar cost can disable it in their
config while it is refactored.

`prefer-unless` is the next clear optimization candidate: nine edits cost
5,623 ms. `prefer-indented-blocks` cost 1,926 ms for 46 edits. Every other rule
was below 133 ms on this corpus. Keep behavior-sensitive rules behind their
guards and equivalence checks; CPU cost is not a reason to remove them. A zero
finding count on seven files is also not evidence that a rule is obsolete.

| Rule | Findings | Applied edits | Files | Source lines | Rule time (ms) |
| --- | ---: | ---: | ---: | ---: | ---: |
| `style/no-trailing-semicolons` | 658 | 658 | 5 | 658 | 253786.75 |
| `style/prefer-unless` | 9 | 9 | 1 | 9 | 5623.33 |
| `style/prefer-indented-blocks` | 46 | 46 | 3 | 66 | 1925.64 |
| `style/prefer-function-declaration` | 77 | 66 | 5 | 839 | 132.97 |
| `style/prefer-implicit-return` | 54 | 54 | 5 | 54 | 131.59 |
| `style/prefer-word-operators` | 223 | 223 | 4 | 148 | 69.62 |
| `style/prefer-in-operator` | 1 | 1 | 1 | 1 | 69.61 |
| `style/no-trailing-commas` | 125 | 125 | 5 | 125 | 69.49 |
| `style/no-mixed-interpolation` | 0 | 0 | 0 | 0 | 63.38 |
| `style/prefer-property-shorthand` | 16 | 16 | 3 | 11 | 57.89 |
| `style/prefer-unclosed-jsx` | 95 | 95 | 1 | 128 | 127.16 |
| `style/prefer-jsx-shorthand` | 65 | 65 | 1 | 65 | 51.24 |
| `style/prefer-jsx-attr-shorthand` | 0 | 0 | 0 | 0 | 49.25 |
| `style/prefer-bare-jsx-values` | 16 | 16 | 1 | 16 | 48.07 |
| `style/prefer-explicit-declarations` | 0 | 0 | 0 | 0 | 45.97 |
| `style/prefer-implicit-block-call` | 0 | 0 | 0 | 0 | 44.21 |
| `style/prefer-implicit-call-args` | 0 | 0 | 0 | 0 | 41.71 |
| `style/prefer-ampersand-shorthand` | 1 | 0 | 1 | 0 | 37.44 |
| `style/prefer-slice-shorthand` | 4 | 4 | 1 | 4 | 34.88 |
| `style/prefer-property-group-shorthand` | 0 | 0 | 0 | 0 | 34.34 |
| `style/prefer-bare-conditions` | 0 | 0 | 0 | 0 | 33.46 |
| `style/prefer-postfix-conditional` | 6 | 6 | 2 | 6 | 32.57 |
| `style/prefer-switch` | 0 | 0 | 0 | 0 | 30.54 |
| `style/prefer-concise-arrow` | 97 | 97 | 3 | 95 | 29.59 |
| `style/prefer-typeof-shorthand` | 2 | 2 | 1 | 2 | 29.22 |
| `style/prefer-bare-for` | 0 | 0 | 0 | 0 | 28.93 |
| `style/prefer-length-shorthand` | 38 | 38 | 4 | 36 | 28.44 |
| `style/prefer-implicit-arrow-arg` | 0 | 0 | 0 | 0 | 27.60 |
| `style/no-is-not` | 0 | 0 | 0 | 0 | 27.41 |
| `style/prefer-range-loop` | 0 | 0 | 0 | 0 | 25.77 |
| `style/prefer-terse-imports` | 23 | 23 | 5 | 17 | 24.63 |
| `style/no-discarded-arrow-return` | 0 | 0 | 0 | 0 | 24.40 |
| `style/prefer-hash-comments` | 5 | 5 | 2 | 5 | 24.40 |
| `style/no-braced-arrow-body` | 0 | 0 | 0 | 0 | 24.12 |
| `style/prefer-new-shorthand` | 0 | 0 | 0 | 0 | 23.89 |
| `style/prefer-slash-comments` | 0 | 0 | 0 | 0 | 22.50 |
| `style/prefer-existential-check` | 12 | 0 | 2 | 0 | 21.94 |
| `style/prefer-optional-type` | 2 | 2 | 2 | 2 | 4.11 |
| `style/no-null-equality` | 14 | 0 | 2 | 0 | 3.76 |
| `style/no-thin-arrow` | 1 | 0 | 1 | 0 | 3.55 |
| `style/no-pipe-operator` | 0 | 0 | 0 | 0 | 2.48 |
| `style/prefer-at-shorthand` | 2 | 2 | 1 | 2 | 1.67 |
| `style/prefer-walrus-declarations` | 401 | 401 | 5 | 401 | 1.56 |
| `style/prefer-is-not` | 0 | 0 | 0 | 0 | 1.54 |
| `style/prefer-indented-object` | 0 | 0 | 0 | 0 | 1.48 |
| `style/no-single-param-arrow-without-parens` | 1 | 0 | 1 | 0 | 1.38 |
| `style/prefer-bare-assignment` | 394 | 394 | 5 | 394 | 1.15 |
| `style/no-redundant-jsx-parens` | 0 | 0 | 0 | 0 | 0.84 |
| `style/prefer-range-operator` | 1 | 0 | 1 | 0 | 0.58 |
| `style/prefer-named-export-default` | 0 | 0 | 0 | 0 | 0.39 |

The `prefer-unclosed-jsx` row was remeasured after adding the nested-text guard:
it now offers 95 safe edits, retaining 18 closers whose removal would change
JSX text. The row's timing is from a later isolated run, so use its scale rather
than comparing its last decimal place to the earlier rows.

The built-in benchmark on Clint's own 62-file source corpus (340,008 bytes,
three runs) measured 15,616 ms parse/emit floor, 17,968 ms full run, and 556 ms
summed rule timers. The independently sampled wall-clock delta was 2,352 ms;
this is noisier than the in-rule timers, so the benchmark now reports both.

## Coverage matrix

| Civetify construct | Clint coverage | Limits and safety |
| --- | --- | --- |
| Imports without `import` and quotes | `prefer-terse-imports` | Preserves type-only imports and unsupported module names. |
| `const` / `let` to Civet declarations | `prefer-walrus-declarations`, `prefer-bare-assignment` | Competing styles cannot both be enabled; projects choose one. |
| `&&`, `||`, `!`, strict equality, and negated equality | `prefer-word-operators`, `no-is-not`, `prefer-is-not`, `prefer-unless` | `unless`/`until` applies only when the whole condition is negated. |
| Array membership and `typeof` | `prefer-in-operator`, `prefer-typeof-shorthand` | Narrow expression shapes; the equivalence gate checks each fix. |
| Null checks and optional types | `prefer-existential-check`, `prefer-optional-type`, `no-null-equality` | Existential suggestions that conflate `undefined` and `null` remain report-only. |
| `this` and `.length` | `prefer-at-shorthand`, `prefer-length-shorthand` | Syntax-only rewrites. |
| Semicolons, commas, braces, and indented blocks | `no-trailing-semicolons`, `no-trailing-commas`, `no-braced-arrow-body`, `prefer-indented-blocks`, `prefer-indented-object` | Semicolon scanning is the measured hotspot. Repair rules run before style rules. |
| Braced object property shorthand and grouping | `prefer-property-shorthand`, `prefer-property-group-shorthand` | Only safe braced-object shapes are changed. |
| Named functions, concise arrows, implicit return | `prefer-function-declaration`, `prefer-concise-arrow`, `prefer-implicit-return` | Function conversion guards hoisting, reassignment, and lexical bindings; implicit return is opt-in. |
| Implicit calls, block calls, callback arguments | `prefer-implicit-call-args`, `prefer-implicit-block-call`, `prefer-implicit-arrow-arg` | Limited to unambiguous call and statement positions. |
| Placeholder callbacks | `prefer-ampersand-shorthand` | Parameter-renaming autofixes require `autofixPlaceholders: true`. |
| `new X()` | `prefer-new-shorthand` | Keeps grouping where chained access needs it. |
| `if` / `unless`, postfix conditions, `while` / `until`, `loop` | `prefer-unless`, `prefer-postfix-conditional` | Whole-condition and precedence checks apply. |
| Numeric C-style loops and `switch` | `prefer-range-loop`, `prefer-bare-for`, `prefer-switch` | Range loop autofixes require guards for mutation, captures, bound effects, and later reads. `prefer-switch` is report-only. `for each` array-index substitution is not implemented. |
| Exclusive `.slice` forms | `prefer-slice-shorthand` | Optional chains, `.slice()`, and unsupported bounds are skipped. |
| JSX class/id, attribute values, shorthand attributes | `prefer-jsx-shorthand`, `prefer-bare-jsx-values`, `prefer-jsx-attr-shorthand` | Works without React mode, including Solid's `class`; `prop={true}` is reported without a fix. |
| JSX closing tags and self-closing slash | `prefer-unclosed-jsx` | Indentation, same-name ancestors, text nodes, `<pre>`, and `<textarea>` are guarded. |
| Equality chains, `for each`, general CoffeeScript compatibility | No native-style rule added here | These need separate behavior-preserving analysis or remain Coffee-mode migrations. |

## Compiler regression

The read-only Ranked-Telegram-App corpus contained 585 source files. With both
Civet 0.11.15 and 0.11.16, `--check` reported the same 3,339 errors and 20
warnings, with identical per-file diagnostics and no internal rule errors.
On separate copies, each `--fix` run applied 4,157 fixes, had zero equivalence
gate rejections, and left 22 errors. After the fixes, the two compilers again
reported identical diagnostics; the `.11.5` JSX whitespace-separator case
found during this comparison was fixed and covered by a regression test.

## Clint gate and `compare-ast.cjs`

Clint's fix gate checks emitted text against a delta declared by the rule. It is
useful for syntax rewrites and explicitly allowed style changes, while the
official `compare-ast.cjs` preserves declaration kinds, operators, bindings,
JSX text, and other AST distinctions.

On the same seven before/after files, the strict official comparison matched 2/7
files (`src/App.civet` and `src/index.civet`). Five differ on style forms the
Clint rules intentionally change, such as semicolons, trailing commas, block
braces, operators, and declarations. Applying reviewed normalizers for those
declared forms matched 6/7. The remaining `src/Visualizer.civet` difference is
19 empty JSXText nodes; there are no remaining non-empty JSXText differences
after restoring the text-bearing closing tags. Comments were unchanged.

The gate does not prove every source-level property. In particular,
`prefer-walrus-declarations` can turn a `const` into emitted `let` under its
declared declaration-style delta. The converted project passed its typecheck,
tests, and build, but that comparator exception should remain explicit.

## `unfolding-polytopes` conversion

Commit `edemaine/unfolding-polytopes@d9e8788` changed 27 `.civet` files with
3,701 insertions and 3,626 deletions. The hunks are predominantly mechanical
style conversion:

| Hunk class | Observed changes |
| --- | --- |
| Declarations and imports | `const`/`let` declarations become `:=`/`.=`, and supported imports drop `import` and quotes. |
| Operators and expressions | JavaScript logical/equality operators become Civet words; length, slices, property shorthand, and implicit-call forms are used where the emitted expression matches. |
| Blocks and control flow | Braced blocks and statement semicolons become indentation; loop and conditional headers use Civet syntax. |
| Functions and callbacks | Named functions and concise callbacks use Civet's preferred declaration and arrow forms, with explicit returns retained where needed. |
| Tests and presentation | The test runner has the largest line churn (2,237 lines); most changes are the same syntax and formatting transformations. |

This classification describes syntax changes in that commit, not a formal
behavior proof. Its diff should still be checked with the project's compiler,
typecheck, and tests before treating the conversion as behavior-preserving.

## CoffeeScript mode candidates

No CoffeeScript compatibility rules were implemented in this work. These six
modes are candidates for separately gated rules:

| Mode | Candidate | Main guard or caveat |
| --- | --- | --- |
| `coffeeEq` | `==` / `!=` to `is` / `is not` | Preserve strictness and chained comparison grouping. |
| `coffeeOf` | Membership and property-membership syntax | Array membership may differ for `NaN`, sparse arrays, and overridden methods; object property membership is a separate form. |
| `coffeeForLoops` | CoffeeScript loop forms to `for each` / `for of` / `for in` | Check binding scope, captures, reads after the loop, collection mutation, and evaluation frequency. |
| `coffeeBooleans` | `yes` / `on` / `no` / `off` to booleans | Rewrite tokens only, never identifiers or text. |
| `coffeeDiv` | `//` to floor division | JavaScript `/` truncation/rounding differs, especially for negative inputs. |
| `coffeePrototype` | `X::` to `X.prototype` | Preserve receiver and property lookup behavior. |
