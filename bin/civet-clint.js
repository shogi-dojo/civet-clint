#!/usr/bin/env node
import { runCli } from '../dist/cli.js'

runCli().then(code => {
  process.exitCode = code
}).catch(err => {
  console.error(err)
  process.exitCode = 2
})
