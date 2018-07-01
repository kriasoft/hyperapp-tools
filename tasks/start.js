const fs = require('fs')
const { ufs } = require('unionfs')
const { patchRequire } = require('fs-monkey')
const opn = require('opn')
const path = require('path')
const chalk = require('chalk')
const address = require('address')
const webpack = require('webpack')
const webpackServe = require('webpack-serve')
const loadConfig = require('../tools/load-config')
const clearConsole = require('../tools/clear-console')

const webpackConfig = loadConfig('webpack')
const serveConfig = loadConfig('serve')
const isInteractive = process.stdout.isTTY

module.exports = async function start() {
  process.stdout.write('Starting the development server...\n')
  process.env.NODE_ENV = 'development'
  process.env.BABEL_ENV = 'development'
  const useYarn = fs.existsSync('yarn.lock')
  const webpackOptions = webpackConfig({ production: false, publicPath: '/' })
  const multiCompiler = webpack(webpackOptions)
  const serverCompiler = multiCompiler.compilers.find((comp) => comp.name === 'server')
  const serverPath = path.resolve(serverCompiler.outputPath, 'server.js')

  process.on('SIGRELOAD', () => {
    delete require.cache[serverPath]
  })

  const serveOptions = serveConfig({
    production: false,
    compiler: multiCompiler,
    middleware(app) {
      serverCompiler.outputFileSystem.realpathSync =
        serverCompiler.outputFileSystem.realpathSync || ((p) => p)
      patchRequire(ufs.use(fs).use(serverCompiler.outputFileSystem))
      app.use((ctx) => {
        let fn = require(serverPath) || {}
        if (fn.default) fn = fn.default // export default
        if (typeof fn.handle === 'function') fn = fn.handle.bind(fn) // express
        if (typeof fn.callback === 'function') fn = fn.callback() // koa
        if (typeof fn === 'function') {
          ctx.respond = false
          fn(ctx.req, ctx.res)
        }
      })
    },
  })

  const server = await webpackServe({}, serveOptions)
  const { port, address: host } = server.app.server.address()
  const isUnspecifiedHost = host === '0.0.0.0' || host === '::'
  const internalHost = isUnspecifiedHost ? 'localhost' : host
  const externalHost = isUnspecifiedHost && address.ip()
  const schema = server.options.https ? 'https' : 'http'
  const internalUrl = `${schema}://${internalHost}:${port}/`
  const externalUrl = externalHost && `${schema}://${externalHost}:${port}/`
  const invalidCompilers = new Set()
  let compilationsCount = multiCompiler.compilers.length

  function printInstructions() {
    if (invalidCompilers.size > 0) return
    if (isInteractive) clearConsole()
    const status = compilationsCount > 0 ? 'compiling...' : 'idle (waiting for file changes)'
    process.stdout.write(
      `\nThe development server is up and running.\n\n` +
        `${isInteractive && status ? `  ${chalk.bold('Build status:')} ${status}\n` : ''}` +
        `${
          externalUrl
            ? `  ${chalk.bold('Internal URL:')} ${internalUrl}\n` +
              `  ${chalk.bold('External URL:')} ${externalUrl}\n`
            : `  ${chalk.bold('URL:')} ${internalUrl}\n`
        }\nNote that the development build is not optimized.` +
        `\nTo create a production build, use ` +
        `${chalk.cyan(`${useYarn ? 'yarn' : 'npm run'} build`)}.\n\n`,
    )
  }

  printInstructions()

  server.on('build-started', ({ compiler }) => {
    invalidCompilers.delete(compiler.name)
    compilationsCount += 1
    if (isInteractive) {
      printInstructions()
    } else {
      process.stdout.write(`Compiling ${compiler.name}...\n`)
    }
  })

  server.on('build-finished', ({ compiler, stats }) => {
    compilationsCount -= 1
    if (isInteractive && invalidCompilers.size === 0) clearConsole()
    if (stats.hasErrors()) {
      invalidCompilers.add(compiler.name)
      process.stderr.write(
        `${chalk.red(`Failed to compile ${compiler.name}.`)}\n` +
          `${stats.toString({ all: false, errors: true, moduleTrace: true })}\n`,
      )
      return
    }
    if (stats.hasWarnings()) {
      invalidCompilers.add(compiler.name)
      process.stdout.write(
        `${chalk.yellow(`Compiled ${compiler.name} with warnings.`)}\n` +
          `${stats.toString({ all: false, warnings: true, moduleTrace: true })}\n`,
      )
    } else if (isInteractive) {
      printInstructions()
    } else {
      process.stdout.write(`${chalk.green(`Compiled ${compiler.name} successfully.`)}\n`)
    }

    if (compiler.name === 'server') {
      process.emit('SIGUPDATE', stats.hash)
    }
  })

  const browser = String(process.env.BROWSER || '')
  if (browser.toLowerCase() !== 'none') {
    await opn(internalUrl, { app: browser })
  }

  return -1
}
