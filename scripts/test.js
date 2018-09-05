const jest = require('jest')
const loadConfig = require('../utils/load-config')

const jestConfig = loadConfig('jest')()

module.exports = async function test(argv) {
  process.env.NODE_ENV = 'test'
  process.env.BABEL_ENV = 'test'
  const opts = ['--config', '-c']
  const args = argv.filter((arg, i, arr) => !opts.includes(arg) && !opts.includes(arr[i - 1]))
  args.push('--config', JSON.stringify(jestConfig))
  await jest.run(args)
}
