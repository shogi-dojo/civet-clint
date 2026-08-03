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

      const compiled = civet.compile(content, {
        filename: file,
        js: true,
        sync: true
      })
      await fs.writeFile(outPath, compiled, 'utf8')
    } else {
      const outPath = path.join(DIST_DIR, relPath)
      await fs.mkdir(path.dirname(outPath), { recursive: true })
      await fs.copyFile(file, outPath)
    }
  }

  // Create TypeScript declarations
  const indexDts = `export * from './index.js';
export interface RuleContext {
  source: string;
  ast: any;
  report(diagnostic: Diagnostic): void;
}
export interface Diagnostic {
  ruleId: string;
  severity: 'warn' | 'error';
  message: string;
  line: number;
  column: number;
  fix?: Fix;
}
export interface Fix {
  start: number;
  end: number;
  replacement: string;
}
export interface LintResult {
  filePath: string;
  source: string;
  fixedSource?: string;
  diagnostics: Diagnostic[];
  appliedFixesCount: number;
  isEquivalencePreserved: boolean;
}
export interface ClintConfig {
  preset?: string;
  civetConfig?: string;
  rules?: Record<string, 'off' | 'warn' | 'error'>;
}
`
  await fs.writeFile(path.join(DIST_DIR, 'index.d.ts'), indexDts, 'utf8')
  console.log(`Successfully built ${files.length} files to dist/`)
}

build().catch((err) => {
  console.error('Build failed:', err)
  process.exit(1)
})
