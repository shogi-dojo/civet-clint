# civet-clint 0.7.0: Idiomatic Civet Style Transformation

This Gist demonstrates automated conversion from standard TypeScript/React (`before.tsx`) to idiomatic modern Civet (`after.civet`) using **`civet-clint 0.7.0`** with the new `civet-idiomatic` preset.

`after.civet` was produced completely automatically by running `clint --rewrite before.tsx` in a single pass. Both files compile to **byte-identical JavaScript** under the `@danielx/civet` compiler.

---

## 24 Style Guide Items Covered

The `civet-idiomatic` preset implements and verifies the 24 style conventions defined in Erik Demaine's Civet style guide:

1. **Terse Imports**: `import { a } from "b"` → `{ a } from b` (`style/prefer-terse-imports`)
2. **Optional Type Annotation**: `T | undefined` → `T?` (`style/prefer-optional-type`)
3. **Implicit Class Fields**: `@x` for `this.x` (`style/prefer-at-shorthand`)
4. **Member Access Shorthands**: `@[k]`, `@#p`, `@?.x` (`style/prefer-at-shorthand`)
5. **Length Shorthand**: `arr.length` → `arr#`, `arr?.length` → `arr?#` (`style/prefer-length-shorthand`)
6. **Property Shorthand**: `{ count: @count }` → `{ @count }` (`style/prefer-property-shorthand`)
7. **Typeof Shorthand**: `typeof x is "type"` → `x <? "type"` (`style/prefer-typeof-shorthand`)
8. **Unless Statements**: `if (!x)` → `unless x` with precedence guards (`style/prefer-unless`)
9. **Bare For Loops**: `for (const x of xs)` → `for x of xs` (`style/prefer-bare-for`)
10. **Bare Conditions**: `if (a)` → `if a` (`style/prefer-bare-conditions`)
11. **Walrus Declarations**: `const x = …` → `x := …`, `let x = …` → `x .= …` (`style/prefer-walrus-declarations`)
12. **Existential Checks**: `x != null` → `x?`, `x == null` → `not x?` (`style/prefer-existential-check`)
13. **Implicit Returns**: Drops trailing explicit `return` at end of functions/methods (`style/prefer-implicit-return`)
14. **Word Operators**: `===`, `!==`, `&&`, `||`, `!` → `is`, `isnt`, `and`, `or`, `not` (`style/prefer-word-operators`)
15. **Concise Arrow**: `() =>` → `=>` (`style/prefer-concise-arrow`)
16. **Indented Objects & Blocks**: Multi-line braces replaced by indentation (`style/prefer-indented-object`, `style/prefer-indented-blocks`)
17. **No Trailing Semicolons**: Eliminates unnecessary semicolons (`style/no-trailing-semicolons`)
18. **No Trailing Commas**: Eliminates unnecessary trailing commas (`style/no-trailing-commas`)
19. **JSX Class/Id Shorthands**: `className="card"` → `.card`, `id="user"` → `#user` (`style/prefer-jsx-shorthand`)
20. **Bare JSX Values**: `attr={val}` → `attr=val` (`style/prefer-bare-jsx-values`)
21. **JSX Attribute Shorthand**: `prop={prop}` → `{prop}` (`style/prefer-jsx-attr-shorthand`)
22. **Implicit Call Arguments**: `expect(a).toBe 'x'` (`style/prefer-implicit-call-args`)
23. **Implicit Block Calls**: `describe "suite", ->` (`style/prefer-implicit-block-call`)
24. **Implicit Arrow Arguments**: `vi.fn => x` (`style/prefer-implicit-arrow-arg`)

---

## Verification

Compiled with `@danielx/civet@0.11.15`:
```bash
civet -c before.tsx -o before.js
civet -c after.civet -o after.js
diff -u before.js after.js
# 0 diff lines (Byte-identical compiled JavaScript output!)
```
