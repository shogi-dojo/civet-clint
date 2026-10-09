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

## Graph-orientation-visualizer fork measurement

The fork's starting point was shogi-dojo/graph-orientation-visualizer at
8d90f54, with Civet 0.11.5 and the civet-idiomatic preset. Pattern counts below
cover the seven direct .civet files under src/ and test/; the closing-tag count
also includes HTML markup embedded in strings.

| Source pattern | Before | After |
| --- | ---: | ---: |
| Braced arrow bodies (=> {) | 132 | 13 |
| Lines containing only closing delimiters | 305 | 152 |
| Explicit return lines | 88 | 88 |
| if ( headers | 73 | 45 |
| for ( headers | 25 | 1 |
| Named const arrows | 49 | 0 |
| Line-ending commas | 397 | 0 |
| Trailing semicolons | 127 | 86 |
| Closing JSX tags / markup strings | 47 | 47 |
| class="…" attributes | 9 | 0 |

The nine Solid class attributes were hand-converted because the shorthand rule
skips multiline JSX attributes. The 88 returns remain because
prefer-implicit-return is opt-in. The closing tags remain where the compiler
and text layout make removal unsafe.

The source-only benchmark uses
node scripts/bench.mjs --target notes/graph-orientation-visualizer/src --config ../clint.config.json --runs 3 --json.
It compares the pre-fix measurement from the same five-file source corpus with
the final post-fix corpus:

| Measurement | Before | After |
| --- | ---: | ---: |
| Source bytes | 70,341 | 68,762 |
| Parse/emit floor | 5,399.67 ms | 4,046.79 ms |
| Full lint time | 40,047.77 ms | 8,421.75 ms |
| Sum of rule timers | 38,630.67 ms | 4,409.54 ms |
| no-trailing-semicolons | 22,609.57 ms | 84.42 ms |
| prefer-unless | 5,349.65 ms | 3,748.87 ms |
| no-trailing-commas | 5,110.78 ms | 3.13 ms |
| prefer-indented-blocks | 4,813.39 ms | 0.75 ms |

During migration, prefer-indented-blocks peaked at 22.7 seconds in a
single-run benchmark while it verified many candidate rewrites. The grouped
fallback reduced that from 32.9 seconds, and the clean final corpus now costs
under 1 ms for the rule. This is a migration-time optimization target, not a
reason to remove the rule. prefer-unless now accounts for about 85% of the
remaining rule work and is the next refactor candidate. A project that needs a
temporary latency tradeoff can disable it locally; this sample does not support
global deprecation. The semicolon and comma rules became inexpensive after
their candidate sets were cleaned up.

The final --fix src test pass converged to zero errors and 13 non-fixable
warnings (12 strict null/undefined comparisons and one callback placeholder).
The project passed Civet typecheck, all 45 Vitest tests, and the Vite build.
Normalized TypeScript ASTs matched in six of seven files. The only difference
is the reviewed allowedEdgeIds conditional: Civet had emitted its loop body
as an object expression, so the manual indentation fix restores the intended
loop. A browser smoke test confirmed edge orientation, undo/redo, and example
switching.

## Coverage matrix

| Civetify form | Clint rule | Coverage and limits |
| --- | --- | --- |
| `const` / `let` to Civet declarations | `prefer-walrus-declarations`, `prefer-bare-assignment` | Autofix; these opposing styles cannot both be enabled, so a project chooses one. |
| `&&`, `||`, and `!` to word operators | `prefer-word-operators` | Autofix with the output gate. |
| `===` / `!==` to `is` / `is not` | `prefer-word-operators`, `no-is-not`, `prefer-is-not` | Autofix; dial-specific rules are skipped when their CoffeeScript mode is absent. |
| `foo != null` / `foo == null` existential shorthand | `prefer-existential-check`, `no-null-equality` | Partial: strict `undefined` and `null` checks that would become loose are reported without a fix. |
| `T \| undefined` to `T?` | `prefer-optional-type` | Autofix for supported union shapes. |
| `.length` to `#` | `prefer-length-shorthand` | Autofix for supported member expressions. |
| `typeof x` comparisons to `<?` / `!<?` | `prefer-typeof-shorthand` | Autofix when the tested string and operator shape are supported. |
| `this` / `this.x` to `@` / `@x` | `prefer-at-shorthand` | Autofix. |
| Trailing statement semicolons | `no-trailing-semicolons` | Autofix, but 658 findings took 253.8 seconds on this sample; target projects can disable it while it is refactored. |
| Braced blocks to indentation | `no-braced-arrow-body`, `prefer-indented-blocks`, `prefer-indented-object` | Autofix or repair; object-like and expression-position braces stay guarded. |
| `b: a.b` to `a.b` in braced objects | `prefer-property-shorthand` | Autofix only for safe object-literal shapes. |
| Adjacent object property grouping | `prefer-property-group-shorthand` | Autofix only for adjacent compatible shorthand properties. |
| Trailing commas | `no-trailing-commas` | Autofix outside regex quantifiers, array elisions, and invalid rest-element forms. |
| `() => work()` to `=> work()` | `prefer-concise-arrow` | Autofix where the zero-argument arrow is unambiguous. |
| One-parameter arrows and implicit callback arguments | `prefer-implicit-arrow-arg`, `no-single-param-arrow-without-parens` | Partial: zero-argument call ambiguity and object-property argument capture are guarded. |
| Final explicit `return` | `prefer-implicit-return` | Available as an opt-in rule; deliberately absent from presets. |
| Call parentheses and block-call syntax | `prefer-implicit-call-args`, `prefer-implicit-block-call` | Partial: only unambiguous trailing or statement-ending forms; empty calls keep `()`. |
| `(x) => x.p` and related callback placeholders | `prefer-ampersand-shorthand` | Reports all supported sites; parameter-renaming fixes require `autofixPlaceholders: true`. |
| Named const arrows to function declarations | `prefer-function-declaration` | Guarded autofix; skips earlier uses, reassignment, and lexical `this` / `arguments` / `super` / `new.target`. |
| `new X()` to `new X` | `prefer-new-shorthand` | Autofix; retains grouping when a member or index access follows. |
| Parentheses on `if` / `switch` headers | `prefer-indented-blocks`, `prefer-switch` | Header cleanup is partial; `prefer-switch` only reports equality chains and does not autofix them. |
| One-line `if (...) return` to postfix conditional | `prefer-postfix-conditional` | Autofix when the compiler's block-brace output delta matches. |
| `if not`, `while not`, `while true` to `unless`, `until`, `loop` | `prefer-unless` | Autofix only when the whole condition is negated and precedence is preserved. |
| `for const ...` to `for ...` | `prefer-bare-for` | Autofix. |
| Numeric C-style loops to range loops | `prefer-range-loop` | Guarded autofix checks index writes, later reads, closure capture, and bound mutation/effects. Dynamic loops keep a C-style header. |
| `x.includes(y)` to `y is in x` | `prefer-in-operator` | Autofix for the supported member-call form; the equivalence gate rejects semantic drift. |
| Exclusive `.slice` calls to range indexing | `prefer-slice-shorthand` | Partial: `.slice()`, optional chains, and unsupported bounds are skipped. |
| Imports without the `import` keyword or module quotes | `prefer-terse-imports` | Autofix for supported module specifiers; type-only imports are preserved. |
| JSX closing tags and self-closing slash | `prefer-unclosed-jsx` | Partial: indentation, nesting, same-name ancestors, text nodes, `<pre>`, and `<textarea>` are guarded. |
| Simple JSX attribute braces and adjacent shorthand attrs | `prefer-jsx-attr-shorthand` | Autofix for safe forms; `prop={true}` is reported without a fix. |
| JSX `class` / `id` to `.class` / `#id` | `prefer-jsx-shorthand` | Works without React mode, using `class` for Solid and `className` when React mode is enabled. |
| JSX bare boolean values | `prefer-bare-jsx-values` | Autofix for supported static boolean attributes. |
| `for each` array-index substitution, CoffeeScript compatibility modes | No rule added here | Kept out of this native-style work; these require separate scope, capture, and iteration-semantics checks. |

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
