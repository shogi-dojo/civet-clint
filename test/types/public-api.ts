import {
  allRules,
  findCivetFiles,
  lintFile,
  lintSource,
  loadConfig,
  parseCliArgs,
  type ClintConfig,
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
void rule
void customRule
void lintFile('example.civet', options)
void findCivetFiles(['src'])
void parseCliArgs(['--check'])
