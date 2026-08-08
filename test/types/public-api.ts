import {
  allRules,
  compileForOutput,
  createDefaultRuleRegistry,
  defaultRuleRegistry,
  findCivetFiles,
  lintFile,
  lintSource,
  loadConfig,
  resolveConfigForFile,
  parseSyntax,
  SyntaxTree,
  type SourceRange,
  type SourceToken,
  parseCliArgs,
  RuleRegistry,
  noTrailingSemicolonsRule,
  preferBareAssignmentRule,
  preferExistentialCheckRule,
  preferJsxAttrShorthandRule,
  preferAmpersandShorthandRule,
  noSingleParamArrowWithoutParensRule,
  preferNamedExportDefaultRule,
  noThinArrowRule,
  noPipeOperatorRule,
  preferRangeOperatorRule,
  preferBareJsxValuesRule,
  preferHashCommentsRule,
  type ClintConfig,
  type CompileDialOptions,
  type CompileResult,
  type ConfigOverride,
  type LintOptions,
  type LintResult,
  type Plugin,
  type Rule,
} from '../../dist/index.js'

const override: ConfigOverride = {
  files: ['test/**/*.civet'],
  rules: { 'style/prefer-concise-arrow': 'warn' },
}

const userConfig: ClintConfig = {
  preset: 'coffee-react',
  rules: { 'style/no-is-not': 'warn' },
  overrides: [override],
}

const registry = new RuleRegistry()
const customRule: Rule = {
  id: 'example/rule',
  meta: { description: 'Example', fixable: false, defaultSeverity: 'warn' },
  check(context) {
    context.report({ ruleId: 'example/rule', message: 'Example diagnostic' })
  },
}
registry.register(customRule)

const plugin: Plugin = {
  name: 'my-plugin',
  rules: [customRule],
}
const defaultReg = createDefaultRuleRegistry()
const clonedReg = defaultRuleRegistry.clone()

const resolved = loadConfig(undefined, undefined, defaultRuleRegistry)
const fileResolved = resolveConfigForFile(resolved, 'src/test.civet', undefined, defaultRuleRegistry)

const options: LintOptions = { config: resolved, registry: defaultReg, fix: true }
const result: LintResult = lintSource('fn := () => a === b', options)
const compileOptions: CompileDialOptions = { dial: {}, compileOptions: { js: true } }
const compiled: CompileResult = compileForOutput('x := 1', compileOptions)
const parsed: CompileResult = parseSyntax('x := 1', { dial: {} })
const rule: Rule | undefined = allRules['style/prefer-word-operators']

void userConfig
void override
void registry
void plugin
void defaultReg
void clonedReg
void fileResolved
void result
void compiled
void parsed
void rule
void customRule
void noTrailingSemicolonsRule
void preferBareAssignmentRule
void preferExistentialCheckRule
void preferJsxAttrShorthandRule
void preferAmpersandShorthandRule
void noSingleParamArrowWithoutParensRule
void preferNamedExportDefaultRule
void noThinArrowRule
void noPipeOperatorRule
void preferRangeOperatorRule
void lintFile('example.civet', options)
void findCivetFiles(['src'])
void parseCliArgs(['--check'])
