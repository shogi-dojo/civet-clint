# Programmatic API & Plugins

`civet-clint` exports a typed ESM API:

```typescript
import {
  lintSource,
  lintFile,
  loadConfig,
  resolveConfigForFile,
  RuleRegistry,
  createDefaultRuleRegistry
} from 'civet-clint';

const registry = createDefaultRuleRegistry();
registry.register({
  id: 'custom/no-debugger',
  meta: {
    description: 'Disallow debugger statements',
    fixable: false,
    defaultSeverity: 'error'
  },
  check(context) {
    if (context.source.includes('debugger')) {
      context.report({
        ruleId: 'custom/no-debugger',
        message: 'Avoid debugger statements in production code'
      });
    }
  }
});

const config = loadConfig();
const result = lintSource('fn := () => a === b', {
  config,
  registry,
  fix: true
});

console.log(result.isEquivalencePreserved); // true
console.log(result.fixedSource);            // "fn := => a is b"
```

Fixes that intentionally rewrite comment text must declare
`meta.allowFixesInsideComments: true`; comment edits from every other built-in or
plugin rule are rejected before the compiler-equivalence gate.

Two hooks let a rule cooperate with its configuration and its siblings:

- `meta.validateOptions(options)` runs when a config loads, after the key and type
  checks. Return a message to reject the options (the config fails to load) or
  `undefined` to accept them. `style/no-single-param-arrow-without-parens` uses it to
  validate `extraZeroArgCallees` patterns.
- `context.activeRuleOptions(ruleId)` returns another rule's resolved options when that
  rule is enabled and not skipped by the compiler dial, and `undefined` otherwise.
  `style/prefer-implicit-arrow-arg` uses it so its fix never produces a finding that
  `style/no-single-param-arrow-without-parens` would then report.
