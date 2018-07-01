require('dotenv').load()
const start = require('./tasks/start')
const build = require('./tasks/build')
const test = require('./tasks/test')
const lint = require('./tasks/lint')

const tasks = { start, build, test, lint }

if (!module.parent) {
  process.on('unhandledRejection', (error) => {
    throw error
  })
  const task = tasks[process.argv[2]] || start
  const args = process.argv.slice(3)
  task(args).then((code) => {
    if (code !== -1) {
      process.exit(code)
    }
  })
}

module.exports = tasks
