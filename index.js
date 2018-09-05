require('dotenv').load()
const start = require('./scripts/start')
const build = require('./scripts/build')
const test = require('./scripts/test')
const lint = require('./scripts/lint')

const scripts = { start, build, test, lint }

if (!module.parent) {
  process.on('unhandledRejection', (error) => {
    throw error
  })
  const script = scripts[process.argv[2]] || start
  const args = process.argv.slice(3)
  script(args).then((code) => {
    if (code !== -1) {
      process.exit(code)
    }
  })
}

module.exports = scripts
