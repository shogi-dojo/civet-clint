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
  ast: any;
  filename?: string;
  report(diagnostic: RuleReport): void;
  getLineColumn(pos: number): { line: number; column: number };
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
export interface RuleMeta {
  description: string;
  fixable: boolean;
  defaultSeverity: Severity;
}
export interface Rule {
  id: string;
  meta: RuleMeta;
  check(context: RuleContext): void;
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
  rules?: Record<string, 'off' | 'warn' | 'error'>;
}
export interface ResolvedConfig {
  preset: string;
  rules: Record<string, 'off' | 'warn' | 'error'>;
  civetConfigPath?: string;
  civetOptions: Record<string, any>;
  configPath?: string;
}
export interface LintOptions {
  filename?: string;
  config?: ResolvedConfig;
  civetOptions?: Record<string, any>;
  fix?: boolean;
  rules?: Record<string, RuleLevel>;
}
export interface CliOptions {
  check?: boolean;
  write?: boolean;
  config?: string;
  format?: 'text' | 'json';
  help?: boolean;
  version?: boolean;
  targets: string[];
  errors: string[];
}
export const PRESETS: Record<string, { rules: Record<string, RuleLevel>; civetOptions: Record<string, any> }>;
export const allRules: Record<string, Rule>;
export const preferWordOperatorsRule: Rule;
export const preferConciseArrowRule: Rule;
export const preferJsxShorthandRule: Rule;
export const noNullEqualityRule: Rule;
export const noIsNotRule: Rule;
export const noMixedInterpolationRule: Rule;
export function findConfigFile(cwd?: string): string | undefined;
export function findCivetConfigFile(cwd?: string): string | undefined;
export function loadCivetOptions(civetConfigPath?: string, cwd?: string): Record<string, any>;
export function loadConfig(explicitConfigPath?: string, cwd?: string): ResolvedConfig;
export function compileSource(source: string, civetOptions?: Record<string, any>, filename?: string): string;
export function lintSource(source: string, options?: LintOptions): LintResult;
export function lintFile(filePath: string, options?: LintOptions): Promise<LintResult>;
export function createLineColumnIndex(source: string): (pos: number) => { line: number; column: number };
export function walkAst(ast: any, visitor: (node: any, parent: any) => void): void;
export function applyEdits(source: string, edits: Fix[]): { output: string; appliedEdits: Fix[]; conflicts: Fix[] };
export function detectLineEnding(source: string): string;
export function atomicWriteFile(filePath: string, content: string): Promise<void>;
export function findCivetFiles(targets: string[], cwd?: string): Promise<string[]>;
export function parseCliArgs(args: string[]): CliOptions;
export function formatTextReport(results: LintResult[], isWriteMode: boolean): { output: string; exitCode: number };
export function runCli(argv?: string[]): Promise<number>;
`
  await fs.writeFile(path.join(DIST_DIR, 'index.d.ts'), indexDts, 'utf8')
  console.log(`Successfully built ${files.length} files to dist/`)
}

build().catch((err) => {
  console.error('Build failed:', err)
  process.exit(1)
})
