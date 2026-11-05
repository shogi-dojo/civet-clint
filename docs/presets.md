# Presets

## `default`
The baseline neutral preset that relies on Civet's standard word-operator parsing without enforcing specific framework or dialect styles:
- `style/prefer-word-operators`: `"error"` (fixable)
- `style/prefer-concise-arrow`: `"error"` (fixable)
- `style/no-mixed-interpolation`: `"warn"` (diagnostic)
- `style/no-trailing-semicolons`: `"error"` (fixable)
- Compiler options: `{}`

## `civet-idiomatic`
Comprehensive preset enforcing standard, modern Civet idioms (derived from Erik Demaine's official Civet style guide) without legacy CoffeeScript options:
- `style/prefer-word-operators`: `"error"` (fixable)
- `style/prefer-concise-arrow`: `"error"` (fixable)
- `style/prefer-walrus-declarations`: `"error"` (fixable)
- `style/prefer-terse-imports`: `"error"` (fixable)
- `style/no-trailing-commas`: `"error"` (fixable)
- `style/prefer-indented-object`: `"error"` (fixable)
- `style/prefer-indented-blocks`: `"error"` (fixable)
- `style/no-trailing-semicolons`: `"error"` (fixable)
- `style/prefer-implicit-block-call`: `"error"` (fixable)
- `style/prefer-implicit-call-args`: `"error"` (fixable)
- `style/prefer-implicit-arrow-arg`: `"error"` (fixable)
- `style/prefer-implicit-object-arg`: `"error"` (fixable)
- `style/prefer-jsx-shorthand`: `"error"` (fixable; uses `class` on the neutral/Solid dial and `className` with `react`)
- `style/prefer-bare-jsx-values`: `"error"` (fixable)
- `style/prefer-unclosed-jsx`: `"error"` (fixable)
- `style/prefer-unless`: `"error"` (fixable)
- `style/prefer-at-shorthand`: `"error"` (fixable)
- `style/prefer-length-shorthand`: `"error"` (fixable, forbids `coffeeComment`)
- `style/prefer-typeof-shorthand`: `"error"` (fixable)
- `style/prefer-in-operator`: `"error"` (fixable)
- `style/prefer-new-shorthand`: `"error"` (fixable)
- `style/prefer-slice-shorthand`: `"error"` (fixable)
- `style/prefer-range-loop`: `"warn"` (fixable when guards hold; otherwise uses Civet's C-style loop header)
- `style/prefer-switch`: `"warn"` (fixable for plain literal chains in indentation form; otherwise report-only)
- `style/prefer-property-shorthand`: `"error"` (fixable)
- `style/prefer-property-group-shorthand`: `"error"` (fixable)
- `style/prefer-bare-for`: `"error"` (fixable)
- `style/prefer-bare-conditions`: `"error"` (fixable)
- `style/prefer-existential-check`: `"warn"` (fixable)
- `style/prefer-optional-type`: `"error"` (fixable)
- `style/prefer-postfix-conditional`: `"error"` (fixable)
- `style/prefer-ampersand-shorthand`: `"warn"` (diagnostic)
- `style/prefer-jsx-attr-shorthand`: `"warn"` (diagnostic/fixable; supports Solid and React JSX)
- Compiler options: `{}`

## `coffee-react`
Tailored for idiomatic Civet + React codebases:
- `style/prefer-word-operators`: `"error"` (fixable)
- `style/prefer-concise-arrow`: `"error"` (fixable)
- `style/prefer-jsx-shorthand`: `"error"` (fixable, requires `react`)
- `style/prefer-bare-assignment`: `"error"` (fixable, requires `autoLet`)
- `style/prefer-terse-imports`: `"error"` (fixable)
- `style/prefer-bare-jsx-values`: `"error"` (fixable, requires `react`)
- `style/prefer-hash-comments`: `"error"` (fixable, requires `coffeeComment`)
- `style/no-trailing-semicolons`: `"error"` (fixable)
- `style/prefer-existential-check`: `"warn"` (diagnostic)
- `style/prefer-jsx-attr-shorthand`: `"warn"` (diagnostic, requires `react`)
- `style/prefer-ampersand-shorthand`: `"warn"` (diagnostic)
- `style/no-single-param-arrow-without-parens`: `"warn"` (diagnostic)
- `style/prefer-named-export-default`: `"warn"` (diagnostic)
- `style/no-thin-arrow`: `"warn"` (diagnostic)
- `style/no-pipe-operator`: `"error"` (diagnostic)
- `style/prefer-range-operator`: `"warn"` (diagnostic, requires `coffeeRange`)
- `style/no-null-equality`: `"warn"` (diagnostic)
- `style/no-is-not`: `"warn"` (diagnostic)
- `style/no-mixed-interpolation`: `"warn"` (diagnostic)
- Compiler options: `{ "autoLet": true, "coffeeComment": true, "coffeeIsnt": true, "coffeeRange": true, "react": true }`

## `coffee-to-standard`

A transition preset for legacy CoffeeScript-compatible source. It parses with the
same compiler options as `coffee-react`, but enables the safe inverse rules instead
of their Coffee-style counterparts:

- `style/prefer-slash-comments`: `"error"` (`#` → `//`)
- `style/prefer-is-not`: `"error"` (`isnt` → `is not`)
- `style/prefer-explicit-declarations`: `"error"` (`:=` and exported auto-bindings)
- The three dialect-independent `default` rules remain enabled. The existing
  word-operator rule stays out because it selects `isnt` while `coffeeIsnt` is active;
  the transition preset must converge directly on `is not`.
- Compiler options: `{ "autoLet": true, "coffeeComment": true, "coffeeIsnt": true, "coffeeRange": true, "react": true }`

Use it as a staged migration rather than turning compiler options off immediately:

1. Select `"preset": "coffee-to-standard"` while keeping the existing Civet dial.
2. Run `clint config` and inspect `skippedRules`. In particular,
   `style/prefer-is-not` is skipped while `coffeeNot` is enabled because that option
   changes the meaning of `is not`.
3. Disable `coffeeNot` only after compiling/testing the project without it, then run
   `clint fix`, review the diff, and run it again to verify a no-op.
4. Repeat until `clint check` is clean; unsupported cases remain untouched.
5. Disable migrated Coffee options in `civet.json` and switch to `"preset": "default"`.
6. Compile and test the application after each compiler-option removal.

Opposing rules cannot be enabled together. Clint rejects those configurations before
linting, preventing repeated autofix runs from oscillating between styles.
