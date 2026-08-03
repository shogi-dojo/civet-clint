# civet-clint

Compiler-backed style checker and autofixer for [Civet](https://github.com/DanielXMoore/Civet) codebases.

## Features

- **Compiler-Guaranteed Equivalence**: Every autofix verifies that the emitted compiler output before and after rewriting is byte-identical.
- **Idiomatic Civet Style**: Rules for operator conventions, concise empty arrows, and JSX class/ID shorthands.
- **Safety Diagnostics**: Flags potential footguns such as ambiguous null comparisons and syntax traps.

## License

MIT (c) 2026 shogi-dojo
