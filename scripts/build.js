const fs = require('fs-extra')
const path = require('path')
const webpack = require('webpack')
const gzipSize = require('gzip-size')
const { red, cyan, green, yellow } = require('colorette')
const loadConfig = require('../utils/load-config')
const formatFileSize = require('../utils/format-file-size')
const render = require('../utils/render')
const copy = require('../utils/copy')

const webpackConfig = loadConfig('webpack')
const browsersListConfig = loadConfig('browserslist')

module.exports = async function build(argv) {
  process.stdout.write('Creating an optimized production build...\n')
  process.env.NODE_ENV = 'production'
  process.env.BABEL_ENV = 'production'
  const publicPath = typeof process.env.PUBLIC_URL === 'string' ? process.env.PUBLIC_URL : '/'
  const webpackOptions = webpackConfig({ production: true, publicPath })
  const multiCompiler = webpack(webpackOptions)

  // Measure file sizes of previous build
  const prevSizes = new Map()
  try {
    const assets = await fs.readJson('build/assets.json')
    await Object.keys(assets).reduce(async (promise, assetName) => {
      await promise
      const file = path.join('build/public', assets[assetName])
      const size = await gzipSize.file(file)
      prevSizes.set(assetName, size)
    }, Promise.resolve())
  } catch (err) {
    // ignore
  }

  // Clean up the output directory
  await fs.emptyDir('build')

  // Copy files to the output folder
  await copy('public', 'build/public')
  await copy('package-lock.json', 'build/package-lock.json')
  await copy('yarn.lock', 'build/yarn.lock')
  await fs.outputJson(
    'build/package.json',
    {
      ...require(path.resolve('package.json')),
      devDependencies: undefined,
      scripts: {
        start: 'node server.js',
      },
    },
    { spaces: 2 },
  )

  // Create application bundles from the source files
  const stats = await new Promise((resolve, reject) => {
    multiCompiler.run((error, result) => {
      if (error || result.hasErrors()) {
        process.stderr.write(`${red('Failed to compile.')}\n`)
        const options = { all: false, errors: true, moduleTrace: true }
        return reject(error || new Error(stats.toString(options)))
      }
      return resolve(result)
    })
  })

  // Generate static files if necessary
  const assets = await fs.readJson('build/assets.json')
  const renderStatic = argv.includes('--render')
  if (renderStatic) {
    Object.assign(assets, await render({ publicPath }))
    await fs.outputJson('build/assets.json', assets, { spaces: 2 })
  }

  // Measure file sizes and compare with previous
  const files = []
  let sizesWidth = 0
  await Object.keys(assets).reduce(async (promise, assetName) => {
    await promise
    const asset = assets[assetName]
    const file = path.join('build/public', asset.slice(publicPath.length))
    const name = path.join(path.dirname(file), cyan(path.basename(file)))
    const size = await gzipSize.file(file)
    const prevSize = prevSizes.get(assetName)
    const diff = prevSize ? size - prevSize : 0

    let sizeToPrint = formatFileSize(size)
    let diffToPrint = `${diff > 0 ? '+' : ''}${formatFileSize(diff)}`
    const sizeWidth = sizeToPrint.length + (diff ? diffToPrint.length + 3 : 0)

    if (size >= 1024 * 250 /* 250 KiB */) {
      sizeToPrint = red(sizeToPrint)
    } else if (size >= 1024 * 100 /* 100 KiB */) {
      sizeToPrint = yellow(sizeToPrint)
    }

    if (diff) {
      if (diff >= 1024 * 50 /* 50 KiB */) {
        diffToPrint = red(diffToPrint)
      } else if (diff > 0) {
        diffToPrint = yellow(diffToPrint)
      } else {
        diffToPrint = green(diffToPrint)
      }
      sizeToPrint += ` (${diffToPrint})`
    }

    sizesWidth = Math.max(sizesWidth, sizeWidth)
    files.push({ name, size: sizeToPrint, sizeWidth: sizeToPrint.length - sizeWidth })
  }, Promise.resolve())

  // Print compilation warnings if any
  if (stats.hasWarnings()) {
    process.stdout.write(`${yellow('Compiled with warnings.')}\n`)
    const message = stats.toString({ all: false, warnings: true, moduleTrace: true })

    if ('CI' in process.env) {
      process.stderr.write(`${red('Treating warnings as errors because CI detected.')}\n`)
      throw new Error(message)
    }

    process.stdout.write(`${message}\n`)
  } else {
    process.stdout.write(`${green('Compiled successfully.')}\n`)
  }

  // Print results and base instructions
  const browsersList = browsersListConfig({ production: true })
  const browsers = browsersList.map((x) => cyan(x)).join(', ')
  process.stdout.write(
    `\nBuilt the bundle with browser support for ${browsers}.\n` +
      `File sizes after gzip:\n\n` +
      `${files
        .map((file) => `  ${file.size.padEnd(sizesWidth + file.sizeWidth)}  ${file.name}`)
        .join('\n')}\n\n` +
      `The ${cyan('build')} folder is ready to be deployed${
        renderStatic ? ` (or the ${cyan('build/public')} folder for a static site hosting)` : ''
      }.\n` +
      `You may start a production server:\n\n` +
      `  ${cyan('node')} build/server.js\n\n`,
  )
}
