#!/usr/bin/env node
import { execFileSync } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"
import os from "node:os"

const repoRoot = process.cwd()
const smokeDir = await fs.mkdtemp(path.join(os.tmpdir(), "civet-clint-smoke-"))
const npmCache = path.join(smokeDir, ".npm-cache")

// This script runs under `prepublishOnly`, so `npm publish --dry-run` leaks
// npm_config_dry_run into every nested npm call. That would make the pack below
// print a tarball name without writing the file, breaking the smoke test on the
// exact command a maintainer uses to rehearse a release.
const npmEnv = { ...process.env, npm_config_cache: npmCache }
delete npmEnv.npm_config_dry_run

console.log(`[smoke-test] Isolated smoke directory: ${smokeDir}`)

try {
  // 1. Pack tarball into smoke directory
  console.log("[smoke-test] Packing civet-clint tarball...")
  execFileSync("npm", ["pack", "--pack-destination", smokeDir, "--ignore-scripts"], {
    cwd: repoRoot,
    env: npmEnv,
    stdio: "inherit"
  })

  const filesInSmokeDir = await fs.readdir(smokeDir)
  const tarballFilename = filesInSmokeDir.find(f => f.endsWith(".tgz"))
  if (!tarballFilename) {
    throw new Error(`Could not find generated .tgz in ${smokeDir}`)
  }
  const tarballPath = path.join(smokeDir, tarballFilename)
  const stat = await fs.stat(tarballPath)

  console.log(`[smoke-test] Found tarball: ${tarballFilename} (${stat.size} bytes)`)

  // 2. Initialize isolated test consumer project
  const testProject = path.join(smokeDir, "consumer")
  await fs.mkdir(testProject, { recursive: true })
  await fs.writeFile(
    path.join(testProject, "package.json"),
    JSON.stringify({
      name: "civet-clint-smoke-consumer",
      version: "1.0.0",
      type: "module",
      private: true
    }, null, 2)
  )

  // 3. Install tarball into consumer project
  console.log("[smoke-test] Installing tarball into consumer project...")
  execFileSync("npm", ["install", tarballPath, "--no-audit", "--no-fund", "--cache", npmCache], {
    cwd: testProject,
    env: npmEnv,
    stdio: "inherit"
  })

  // Resolve the binary the tarball actually installed. Using `npx clint` here
  // would happily fall back to a globally installed or registry-fetched clint,
  // which would silently verify the wrong build.
  const clintBin = path.join(testProject, "node_modules", ".bin", "clint")
  await fs.access(clintBin)

  // 4. Test binary execution: --version
  console.log("[smoke-test] Testing clint --version...")
  const versionOutput = execFileSync(clintBin, ["--version"], {
    cwd: testProject,
    encoding: "utf8"
  })
  const expectedVersion = JSON.parse(
    await fs.readFile(path.join(repoRoot, "package.json"), "utf8")
  ).version
  if (!versionOutput.includes(expectedVersion)) {
    throw new Error(`Expected clint --version to contain '${expectedVersion}', received: ${versionOutput}`)
  }

  // 5. Test binary execution: --print-config
  console.log("[smoke-test] Testing clint --print-config...")
  const configOutput = execFileSync(clintBin, ["--print-config"], {
    cwd: testProject,
    encoding: "utf8"
  })
  const parsedConfig = JSON.parse(configOutput)
  if (!parsedConfig.rules || !parsedConfig.rules["style/prefer-word-operators"]) {
    throw new Error(`Expected print-config output to include default rules, received: ${configOutput}`)
  }

  // 6. Test CLI linting & autofixing on fixture
  console.log("[smoke-test] Testing CLI check & write modes...")
  const fixturePath = path.join(testProject, "sample.civet")
  await fs.writeFile(fixturePath, "a === b and () => 123\n", "utf8")

  let checkFailedAsExpected = false
  try {
    execFileSync(clintBin, ["sample.civet"], {
      cwd: testProject,
      stdio: "pipe"
    })
  } catch (err) {
    if (err.status === 1) {
      checkFailedAsExpected = true
    } else {
      throw err
    }
  }

  if (!checkFailedAsExpected) {
    throw new Error("Expected initial 'clint sample.civet' to fail with exit code 1")
  }

  // Run --write
  execFileSync(clintBin, ["--write", "sample.civet"], {
    cwd: testProject,
    stdio: "inherit"
  })

  const fixedContent = await fs.readFile(fixturePath, "utf8")
  if (fixedContent !== "a is b and => 123\n") {
    throw new Error(`Expected fixed content 'a is b and => 123\\n', received: '${fixedContent}'`)
  }

  // Run check again (must succeed now)
  execFileSync(clintBin, ["sample.civet"], {
    cwd: testProject,
    stdio: "inherit"
  })

  // 7. Test programmatic ESM API
  console.log("[smoke-test] Testing programmatic ESM API import...")
  const importScript = path.join(testProject, "test-api.mjs")
  await fs.writeFile(
    importScript,
    `import { lintSource, defaultRuleRegistry, loadConfig } from "civet-clint"

const res = lintSource("a === b", {
  rules: { "style/prefer-word-operators": "error" },
  fix: true
})

if (!res.isEquivalencePreserved || res.fixedSource !== "a is b") {
  console.error("Unexpected lintSource result:", res)
  process.exit(1)
}

if (!defaultRuleRegistry.has("style/prefer-word-operators")) {
  console.error("Default rule registry missing expected rule")
  process.exit(1)
}

console.log("Programmatic ESM API verified successfully.")
`,
    "utf8"
  )

  execFileSync("node", ["test-api.mjs"], {
    cwd: testProject,
    stdio: "inherit"
  })

  console.log("[smoke-test] ✅ All smoke tests passed successfully!")
} finally {
  console.log("[smoke-test] Cleaning up temporary files...")
  await fs.rm(smokeDir, { recursive: true, force: true })
}
