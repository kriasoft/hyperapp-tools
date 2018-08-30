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
const tasks = ['start', 'build', 'test', 'lint']
const taskIndex = args.findIndex((arg) => tasks.includes(arg))

if (taskIndex === -1) {
  process.stderr.write(
    `Unknown command ${red(JSON.stringify(args.join(' ')))}.\n` +
      `\nUsage:\n  ${cyan(`${packageJson.name} [node-options]`)}` +
      ` ${green(`<${tasks.join('|')}> [task-options]`)}\n` +
      `\nExample:\n  ${cyan(packageJson.name)} ${green('start')}\n`,
  )
  process.exit(1)
}

process.on('unhandledRejection', (error) => {
  throw error
})

if (taskIndex > 0) {
  const nodeArgs = args.slice(0, taskIndex)
  const runPath = path.resolve(__dirname, '../index.js')
  const runArgs = args.slice(taskIndex)
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
  const taskPath = path.resolve(__dirname, '../tasks', args[taskIndex])
  const taskArgs = args.slice(taskIndex + 1)
  const task = require(taskPath)
  task(taskArgs).then((code) => {
    if (code !== -1) {
      process.exit(code)
    }
  })
}
