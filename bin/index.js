#!/usr/bin/env node

const currentNodeVersion = process.versions.node
const semver = currentNodeVersion.split('.')
const major = semver[0]
const minor = semver[1]

if (major < 8 || (major < 9 && minor < 9)) {
  process.stderr.write(
    `\x1b[31m` + // red
      `You are running Node ${currentNodeVersion}.\n` +
      `Hyperapp Tools requires Node 8.9.0 or higher.\n` +
      `Please update your version of Node.\x1b[0m\n`,
  )
  process.exit(1)
}

require('dotenv').load()
const path = require('path')
const cp = require('child_process')
const { red, cyan, green } = require('colorette')
const packageJson = require('../package.json')

const args = process.argv.slice(2)
const scripts = ['start', 'build', 'test', 'lint']
const scriptIndex = args.findIndex((arg) => scripts.includes(arg))

if (scriptIndex === -1) {
  process.stderr.write(
    `Unknown command ${red(JSON.stringify(args.join(' ')))}.\n` +
      `\nUsage:\n  ${cyan(`${packageJson.name} [node-options]`)}` +
      ` ${green(`<${scripts.join('|')}> [script-options]`)}\n` +
      `\nExample:\n  ${cyan(packageJson.name)} ${green('start')}\n`,
  )
  process.exit(1)
}

process.on('unhandledRejection', (error) => {
  throw error
})

if (scriptIndex > 0) {
  const nodeArgs = args.slice(0, scriptIndex)
  const runPath = path.resolve(__dirname, '../index.js')
  const runArgs = args.slice(scriptIndex)
  const result = cp.spawnSync('node', [...nodeArgs, runPath, ...runArgs], { stdio: 'inherit' })

  if (result.signal) {
    if (result.signal === 'SIGKILL') {
      process.stderr.write(
        `The command failed because the process exited too early. ` +
          `This probably means the system ran out of memory or someone called ` +
          `"kill -9" on the process.\n`,
      )
    } else if (result.signal === 'SIGTERM') {
      process.stderr.write(
        `The command failed because the process exited too early. ` +
          `Someone might have called "kill" or "killall", or the system could ` +
          `be shutting down.\n`,
      )
    }
    process.exit(1)
  }

  process.exit(result.status)
} else {
  const scriptPath = path.resolve(__dirname, '../scripts', args[scriptIndex])
  const scriptArgs = args.slice(scriptIndex + 1)
  const script = require(scriptPath)
  script(scriptArgs).then((code) => {
    if (code !== -1) {
      process.exit(code)
    }
  })
}
