import fs from 'node:fs/promises'
import path from 'node:path'
import civet from '@danielx/civet'

const SRC_DIR = path.resolve('src')
const DIST_DIR = path.resolve('dist')

async function cleanDir(dir) {
  await fs.rm(dir, { recursive: true, force: true })
  await fs.mkdir(dir, { recursive: true })
}

async function getFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await getFiles(fullPath)))
    } else if (entry.isFile() && (entry.name.endsWith('.civet') || entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
      files.push(fullPath)
    }
  }
  return files
}

async function build() {
  await cleanDir(DIST_DIR)
  const files = await getFiles(SRC_DIR)

  for (const file of files) {
    const relPath = path.relative(SRC_DIR, file)
    const content = await fs.readFile(file, 'utf8')

    if (file.endsWith('.civet')) {
      const outRelPath = relPath.replace(/\.civet$/, '.js')
      const outPath = path.join(DIST_DIR, outRelPath)
      await fs.mkdir(path.dirname(outPath), { recursive: true })

      let compiled = civet.compile(content, {
        filename: file,
        js: true,
        sync: true,
        parseOptions: { coffeeIsnt: true, rewriteCivetImports: '.js' }
      })

      await fs.writeFile(outPath, compiled, 'utf8')
    } else {
      const outPath = path.join(DIST_DIR, relPath)
      await fs.mkdir(path.dirname(outPath), { recursive: true })
      await fs.copyFile(file, outPath)
    }
  }

  // Create TypeScript declarations
  const indexDts = `export type Severity = 'warn' | 'error';
export type RuleLevel = 'off' | 'warn' | 'error';
export type RuleOptions = Record<string, any>;
export type RuleEntry = RuleLevel | [RuleLevel, RuleOptions];
export type EquivalenceReference = (source: string) => string | undefined;
export type OutputDelta = 'quote-style' | 'semicolon-style';
export type CompileDial = Record<string, any>;
export type CompileOptions = Record<string, any>;
export interface SourceRange {
  start: number;
  end: number;
}
export interface SourceToken {
  value: string;
  raw: string;
  range: SourceRange;
  synthetic: boolean;
}
export interface JsxAttribute {
  name?: string;
  value?: any;
  range?: SourceRange;
  start?: number;
  equals?: any;
  quotedValue?: string;
  expression?: any;
  bracedRange?: SourceRange;
  isSpread: boolean;
}
export interface JsxAttributeOptions {
  requireOpeningAtStart?: boolean;
}
export interface SyntaxNode {
  type?: string;
  range?: SourceRange;
  [key: string]: any;
}
export class SyntaxTree {
  source: string;
  root: SyntaxNode;
  constructor(ast: SyntaxNode, source: string);
  range(node: any): SourceRange | undefined;
  text(nodeOrRange: any): string;
  children(node: any): any[];
  tokens(node?: any): SourceToken[];
  findToken(node: any, tokenValue: string): SourceToken | undefined;
  visit(targetOrType: any, typeOrCallback?: any, callback?: any): void;
  jsxAttributes(jsxElementNode: any, options?: JsxAttributeOptions): JsxAttribute[];
  hasAncestorType(node: any, types: string | string[]): boolean;
  commentRanges(): SourceRange[];
  stringRanges(): SourceRange[];
}
export interface CompileDialOptions {
  dial: CompileDial;
  compileOptions?: CompileOptions;
  filename?: string;
}
export interface SyntaxParseOptions extends CompileDialOptions {}
export interface CompileResult {
  ok: boolean;
  output?: string;
  syntax?: SyntaxTree;
  error?: string;
  line?: number;
  column?: number;
  offset?: number;
}
export interface Fix {
  start: number;
  end: number;
  replacement: string;
}
export interface RuleReport {
  ruleId: string;
  severity?: Severity;
  message: string;
  line?: number;
  column?: number;
  pos?: number;
  fix?: Fix;
}
export interface RuleContext {
  source: string;
  syntax: SyntaxTree;
  filename?: string;
  parseOptions: CompileDial;
  options: RuleOptions;
  report(diagnostic: RuleReport): void;
  getLineColumn(pos: number): { line: number; column: number };
  declareEquivalenceReference?(delta: OutputDelta, build: EquivalenceReference): void;
}
export interface Diagnostic {
  ruleId: string;
  severity: 'warn' | 'error';
  message: string;
  line: number;
  column: number;
  pos?: number;
  fix?: Fix;
}
export interface RuleCapability {
  requires?: string[];
  requiresAny?: string[];
}
export type RulePhase = "repair" | "idiom" | "cleanup";
export declare const RULE_PHASE_ORDER: RulePhase[];
export interface RuleMeta {
  description: string;
  fixable: boolean;
  defaultSeverity: Severity;
  allowFixesInsideComments?: boolean;
  capabilities?: RuleCapability;
  conflictsWith?: string[];
  defaultOptions?: RuleOptions;
  phase?: RulePhase;
}
export interface Rule {
  id: string;
  meta: RuleMeta;
  check(context: RuleContext): void;
}
export interface Plugin {
  name: string;
  rules?: Rule[] | Record<string, Rule>;
}
export interface ConfigOverride {
  files: string | string[];
  preset?: string;
  civetConfig?: string;
  rules?: Record<string, RuleEntry>;
  civetOptions?: CompileDial;
  compileOptions?: CompileOptions;
}
export interface LintResult {
  filePath: string;
  source: string;
  fixedSource?: string;
  diagnostics: Diagnostic[];
  appliedFixesCount: number;
  isEquivalencePreserved: boolean;
  errorCount: number;
  warningCount: number;
  fixableCount: number;
}
export interface ClintConfig {
  preset?: string;
  civetConfig?: string;
  rules?: Record<string, RuleEntry>;
  overrides?: ConfigOverride[];
}
export interface SkippedRule {
  ruleId: string;
  reason: string;
}
export interface ResolvedConfig {
  preset: string;
  rules: Record<string, 'off' | 'warn' | 'error'>;
  ruleOptions: Record<string, RuleOptions>;
  civetConfigPath?: string;
  civetOptions: CompileDial;
  compileOptions: CompileOptions;
  configPath?: string;
  skippedRules: SkippedRule[];
  overrides?: ConfigOverride[];
  matchingOverrides?: string[];
}
export class RuleRegistry {
  constructor(initialRules?: Rule[] | Record<string, Rule>);
  register(rule: Rule): this;
  registerPlugin(plugin: Plugin): this;
  get(id: string): Rule | undefined;
  has(id: string): boolean;
  getRules(): Record<string, Rule>;
  getRuleList(): Rule[];
  clone(): RuleRegistry;
}
export function createDefaultRuleRegistry(): RuleRegistry;
export const defaultRuleRegistry: RuleRegistry;
export interface LintOptions {
  filename?: string;
  config?: ResolvedConfig;
  registry?: RuleRegistry;
  civetOptions?: Record<string, any>;
  compileOptions?: Record<string, any>;
  fix?: boolean;
  rules?: Record<string, RuleLevel>;
  ruleOptions?: Record<string, RuleOptions>;
  phase?: RulePhase;
  phases?: RulePhase[];
}
export interface CliOptions {
  check?: boolean;
  write?: boolean;
  rewrite?: boolean;
  config?: string;
  format?: 'text' | 'json';
  printConfig?: boolean;
  help?: boolean;
  version?: boolean;
  targets: string[];
  errors: string[];
}
export interface PresetDefinition {
  rules: Record<string, RuleLevel>;
  civetOptions: CompileDial;
  compileOptions: CompileOptions;
}
export const PRESETS: Record<string, PresetDefinition>;
export const allRules: Record<string, Rule>;
export const preferWordOperatorsRule: Rule;
export const preferConciseArrowRule: Rule;
export const preferJsxShorthandRule: Rule;
export const noNullEqualityRule: Rule;
export const noIsNotRule: Rule;
export const noMixedInterpolationRule: Rule;
export const noTrailingSemicolonsRule: Rule;
export const preferBareAssignmentRule: Rule;
export const preferExistentialCheckRule: Rule;
export const preferJsxAttrShorthandRule: Rule;
export const preferAmpersandShorthandRule: Rule;
export const noSingleParamArrowWithoutParensRule: Rule;
export const preferNamedExportDefaultRule: Rule;
export const noThinArrowRule: Rule;
export const noPipeOperatorRule: Rule;
export const preferRangeOperatorRule: Rule;
export const preferTerseImportsRule: Rule;
export const preferBareJsxValuesRule: Rule;
export const preferHashCommentsRule: Rule;
export function findConfigFile(cwd?: string): string | undefined;
export function findCivetConfigFile(cwd?: string): string | undefined;
export function loadCivetConfig(civetConfigPath?: string, cwd?: string): { dial: CompileDial; compileOptions: CompileOptions; resolvedPath?: string };
export function loadCivetOptions(civetConfigPath?: string, cwd?: string): CompileDial;
export function computeSkippedRules(rules: Record<string, RuleLevel>, dial: CompileDial, registry?: RuleRegistry): SkippedRule[];
export function loadConfig(explicitConfigPath?: string, cwd?: string, registry?: RuleRegistry): ResolvedConfig;
export function resolveConfigForFile(baseConfig: ResolvedConfig, filePath: string, cwd?: string, registry?: RuleRegistry): ResolvedConfig;
export function normalizeRuleEntry(ruleId: string, entry: RuleEntry, context: string, registry?: RuleRegistry): { level: RuleLevel; options?: RuleOptions };
export function resolveRuleOptions(ruleId: string, configured: RuleOptions | undefined, registry?: RuleRegistry): RuleOptions;
export function globToRegex(glob: string): RegExp;
export function matchesFilePattern(filePath: string, pattern: string, configBaseDir?: string): boolean;
export function parseSyntax(source: string, options: SyntaxParseOptions): CompileResult;
export function compileForOutput(source: string, options: CompileDialOptions): CompileResult;
export function compileSource(source: string, civetOptions?: Record<string, any>, filename?: string): string;
export function normalizeQuoteStyle(code: string): string;
export function normalizeSemicolonStyle(code: string): string;
export function lintSource(source: string, options?: LintOptions): LintResult;
export function lintPhased(source: string, options?: LintOptions): LintResult;
export function lintFile(filePath: string, options?: LintOptions): Promise<LintResult>;
export function rewriteFile(filePath: string, options?: LintOptions): Promise<LintResult>;
export function createLineColumnIndex(source: string): (pos: number) => { line: number; column: number };
export function walkAst(ast: any, visitor: (node: any, parent: any) => void): void;
export function collectCommentRanges(ast: any): { start: number; end: number }[];
export function intersectsRange(ranges: { start: number; end: number }[], start: number, end: number): boolean;
export function applyEdits(source: string, edits: Fix[]): { output: string; appliedEdits: Fix[]; conflicts: Fix[] };
export function detectLineEnding(source: string): string;
export function atomicWriteFile(filePath: string, content: string): Promise<void>;
export interface FindFilesOptions {
  extensions?: string[];
  rewrite?: boolean;
}
export function findCivetFiles(targets: string[], cwd?: string, options?: FindFilesOptions): Promise<string[]>;
export function parseCliArgs(args: string[]): CliOptions;
export function formatTextReport(results: LintResult[], isWriteMode: boolean, isRewriteMode?: boolean, totalRewritten?: number): { output: string; exitCode: number };
export function runCli(argv?: string[]): Promise<number>;
`
  await fs.writeFile(path.join(DIST_DIR, 'index.d.ts'), indexDts, 'utf8')
  console.log(`Successfully built ${files.length} files to dist/`)
}

build().catch((err) => {
  console.error('Build failed:', err)
  process.exit(1)
})
