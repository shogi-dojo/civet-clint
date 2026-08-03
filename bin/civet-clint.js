#!/usr/bin/env node
import { runCli } from '../dist/cli.js'

runCli().then(code => {
  if (code !== 0) {
    process.exit(code)
  }
}).catch(err => {
  console.error(err)
  process.exit(1)
})
