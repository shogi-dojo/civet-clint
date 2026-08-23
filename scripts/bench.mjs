#!/usr/bin/env node
// Benchmark harness for civet-clint.
//
// The question this answers: "what did the rule I just added cost?" Rules are
// cheap individually and the total creeps up release over release, so this
// reports per-rule cost alongside the totals rather than a single wall time.
//
//   node scripts/bench.mjs                  # bench the bundled corpus
//   node scripts/bench.mjs --target ../app  # bench a real codebase
//   node scripts/bench.mjs --json           # machine-readable
//
// Per-rule timings are collected in a single corpus pass by wrapping each rule's
// check() with a timer, so cost stays measurable on a real codebase (running the
// corpus once per rule would mean N+1 full passes). The wrapped time excludes the
// shared parse and baseline compile, which the floor row reports separately.
import fs from "node:fs/promises"
import path from "node:path"
import os from "node:os"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "..")

const args = process.argv.slice(2)
const flag = (name, fallback = undefined) => {
  const i = args.indexOf(name)
  if (i === -1) return fallback
  return args[i + 1] ?? fallback
}
const asJson = args.includes("--json")
const runs = Number(flag("--runs", "3"))
const target = flag("--target")
const configPath = flag("--config")

const { lintSource } = await import(path.join(repoRoot, "dist/engine.js"))
const { defaultRuleRegistry } = await import(path.join(repoRoot, "dist/registry.js"))
const { loadConfig } = await import(path.join(repoRoot, "dist/config.js"))

// Corpus: either a real codebase or this repo's own sources, which are the most
// representative Civet available without a external dependency.
async function collect(dir) {
  const out = []
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await collect(full)))
    else if (entry.name.endsWith(".civet")) out.push(full)
  }
  return out
}

const corpusDir = target ? path.resolve(process.cwd(), target) : path.join(repoRoot, "src")
const files = (await collect(corpusDir)).sort()
if (files.length === 0) {
  console.error(`[bench] No .civet files under ${corpusDir}`)
  process.exit(1)
}
const sources = await Promise.all(
  files.map(async (f) => ({ file: f, text: await fs.readFile(f, "utf8") })),
)
const totalBytes = sources.reduce((a, s) => a + s.text.length, 0)

const baseConfig = loadConfig(configPath, corpusDir, defaultRuleRegistry)
const civetOptions = baseConfig.civetOptions ?? {}
const activeRules = Object.keys(baseConfig.rules).filter((r) => baseConfig.rules[r] !== "off")

// Median of N runs: less startup-sensitive than a mean, and this workload has a
// long tail from GC.
function median(xs) {
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

function timeCorpus(rules) {
  const samples = []
  for (let r = 0; r < runs; r++) {
    const t0 = performance.now()
    for (const { file, text } of sources) {
      lintSource(text, { civetOptions, rules, filename: file, registry: defaultRuleRegistry })
    }
    samples.push(performance.now() - t0)
  }
  return median(samples)
}

const allOff = Object.fromEntries(activeRules.map((r) => [r, "off"]))
const floor = timeCorpus(allOff)

// Wrap every active rule's check() to accumulate its own time. The registry hands
// out the same rule objects the engine uses, so this measures the real calls.
const spent = new Map(activeRules.map((r) => [r, 0]))
const originals = new Map()
for (const ruleId of activeRules) {
  const rule = defaultRuleRegistry.get(ruleId)
  if (!rule) continue
  originals.set(ruleId, rule.check)
  const inner = rule.check.bind(rule)
  rule.check = (ctx) => {
    const t0 = performance.now()
    try {
      return inner(ctx)
    } finally {
      spent.set(ruleId, spent.get(ruleId) + (performance.now() - t0))
    }
  }
}

const full = timeCorpus(baseConfig.rules)

for (const [ruleId, fn] of originals) {
  const rule = defaultRuleRegistry.get(ruleId)
  if (rule) rule.check = fn
}

// timeCorpus ran `runs` iterations; report per-iteration cost so the numbers are
// comparable to the totals above.
const perRule = activeRules
  .map((ruleId) => ({ ruleId, ms: spent.get(ruleId) / runs }))
  .sort((a, b) => b.ms - a.ms)

const report = {
  corpus: { dir: corpusDir, files: files.length, bytes: totalBytes },
  runs,
  cpus: os.availableParallelism?.() ?? os.cpus().length,
  floorMs: floor,
  totalMs: full,
  ruleWorkMs: Math.max(0, full - floor),
  rules: perRule,
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2))
} else {
  const fmt = (n) => `${n.toFixed(0)}ms`.padStart(8)
  console.log(`\ncivet-clint bench — ${files.length} files, ${(totalBytes / 1024).toFixed(0)} KiB, median of ${runs}\n`)
  console.log(`  ${fmt(floor)}  parse + emit floor (all rules off)`)
  console.log(`  ${fmt(report.ruleWorkMs)}  rule work`)
  console.log(`  ${fmt(full)}  total (single-threaded)\n`)
  console.log(`  per-rule cost (time inside each rule's check):\n`)
  for (const { ruleId, ms } of perRule) {
    const share = full > 0 ? (100 * ms) / full : 0
    console.log(`  ${fmt(ms)}  ${share.toFixed(1).padStart(5)}%  ${ruleId}`)
  }
  console.log()
}
