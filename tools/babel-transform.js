// http://facebook.github.io/jest/docs/en/webpack.html

const babelJest = require('babel-jest')
const loadConfig = require('./load-config')

const babelConfig = loadConfig('babel')()

module.exports = babelJest.createTransformer(babelConfig)
