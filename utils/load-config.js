const fs = require('fs')
const path = require('path')

function load(name) {
  const configPath = path.resolve(`configs/${name}.js`)
  if (fs.existsSync(configPath)) {
    return require(configPath)
  }
  return require(`../configs/${name}.js`)
}

module.exports = (name) => {
  const config = load(name)
  return typeof config === 'function' ? config : () => config
}
