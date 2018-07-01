// This file exist because postcss-loader is unable to load
// config files with names other then "postcss.config.*"

const loadConfig = require('./load-config')

const postcssConfig = loadConfig('postcss')

module.exports = ({ env }) => postcssConfig({ production: env === 'production' })
