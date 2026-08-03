import {
  allRules,
  compileForOutput,
  findCivetFiles,
  lintFile,
  lintSource,
  loadConfig,
  parseRawAst,
  parseCliArgs,
  type ClintConfig,
  type CompileDialOptions,
  type CompileResult,
  type LintOptions,
  type LintResult,
  type Rule,
} from '../../dist/index.js'

const userConfig: ClintConfig = {
  preset: 'coffee-react',
  rules: { 'style/no-is-not': 'warn' },
}
const resolved = loadConfig()
const options: LintOptions = { config: resolved, fix: true }
const result: LintResult = lintSource('fn := () => a === b', options)
const compileOptions: CompileDialOptions = { dial: {}, compileOptions: { js: true } }
const compiled: CompileResult = compileForOutput('x := 1', compileOptions)
const parsed: CompileResult = parseRawAst('x := 1', { dial: {} })
const rule: Rule | undefined = allRules['style/prefer-word-operators']
const customRule: Rule = {
  id: 'example/rule',
  meta: { description: 'Example', fixable: false, defaultSeverity: 'warn' },
  check(context) {
    context.report({ ruleId: 'example/rule', message: 'Example diagnostic' })
  },
}

void userConfig
void result
void compiled
void parsed
void rule
void customRule
void lintFile('example.civet', options)
void findCivetFiles(['src'])
void parseCliArgs(['--check'])
