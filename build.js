process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'
process.on('unhandledRejection', (error) => {
  throw error
})

const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const semver = require('semver')
const babel = require('@babel/core')
const prettier = require('prettier')
const prettierConfig = require('./configs/prettier')
const pkg = require('./package.json')

function transformFile(src, dist, targets) {
  return new Promise((resolve, reject) => {
    babel.transformFile(
      src,
      {
        babelrc: false,
        comments: false,
        compact: true,
        presets: [['@babel/preset-env', { targets, useBuiltIns: 'entry', loose: true }]],
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        fs.outputFile(
          dist,
          prettier.format(result.code, { ...prettierConfig, filepath: src }),
          'utf8',
          (err) => (err ? reject(err) : resolve()),
        )
      },
    )
  })
}

async function transform(pattern, targets) {
  const files = await new Promise((resolve, reject) =>
    glob(pattern, (error, result) => (error ? reject(error) : resolve(result))),
  )
  await files.reduce(async (promise, file) => {
    await promise
    await transformFile(file, path.join('build', file), targets)
  }, Promise.resolve())
}

async function build() {
  // Clean up the output directory
  await fs.emptyDir('build')

  // Copy readme and license
  await Promise.all([
    fs.copy('README.md', 'build/README.md'),
    fs.copy('LICENSE.md', 'build/LICENSE.md'),
  ])

  // Compile source code into a distributable format with Babel
  const targetNode = semver.valid(semver.coerce(pkg.engines.node))
  await transform('bin/index.js', { node: '0.1' })
  await transform('configs/*.js', { node: targetNode })
  await transform('tasks/*.js', { node: targetNode })
  await transform('tools/*.js', { node: targetNode })
  await transform('index.js', { node: targetNode })

  // Create package.json for npm publishing
  const libPkg = { ...pkg }
  delete libPkg.private
  delete libPkg.devDependencies
  delete libPkg.scripts
  await fs.outputJson('build/package.json', libPkg, { spaces: 2 })
}

module.exports = build()
