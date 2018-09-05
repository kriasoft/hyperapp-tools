const path = require('path')
const semver = require('semver')
const { red } = require('colorette')

const packageJsonProject = require(path.resolve('package.json'))
const packageJson = require('../package.json')

const engines = { ...packageJson.engines, ...packageJsonProject.engines }
const targetNodeVersion = semver.valid(semver.coerce(engines.node))

if (!targetNodeVersion) {
  process.stderr.write(`${red('Field "engines.node" in package.json is required.')}\n`)
  process.exit(1)
}

if (semver.ltr(process.version, targetNodeVersion)) {
  process.stderr.write(
    `${red(
      `You are running Node ${process.version}.\n` +
        `Application requires Node ${targetNodeVersion} or higher.\n` +
        `Please update version of Node or change package.json engines field.`,
    )}\n`,
  )
  process.exit(1)
}

module.exports = targetNodeVersion
