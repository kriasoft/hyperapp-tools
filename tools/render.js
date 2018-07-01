const cp = require('child_process')
const fs = require('fs-extra')
const path = require('path')
const http = require('http')
const loadConfig = require('./load-config')

const renderConfig = loadConfig('render')()

module.exports = async ({ publicPath }) => {
  let baseUrl
  const server = await new Promise((resolve, reject) => {
    const child = cp.spawn('node', ['build/server.js'], { stdio: ['ignore', 'pipe', 'inherit'] })
    child.stdout.on('data', function onStdOut(data) {
      const match = data.toString('utf8').match(/The server is running at (http[^\s]+)/)
      if (match) {
        const url = match[1]
        baseUrl = url.endsWith('/') ? url.slice(0, -1) : url
        child.stdout.removeListener('data', onStdOut)
        child.stdout.on('data', (x) => process.stdout.write(x))
        resolve(child)
      } else {
        process.stdout.write(data)
      }
    })
    child.on('exit', (code, signal) => {
      reject(new Error(`Server terminated unexpectedly with code: ${code} signal: ${signal}`))
    })
  })

  const assets = {}
  await renderConfig.pages.reduce(async (promise, page) => {
    await promise
    if (assets[page.path]) return
    const src = `${baseUrl}${page.path}`
    const filename = page.path.endsWith('/')
      ? 'index.html'
      : `${path.posix.basename(page.path, '.html')}.html`
    const basename = page.path.endsWith('/') ? page.path : path.posix.dirname(page.path)
    const dirname = basename.startsWith('/') ? basename.slice(1) : basename
    assets[page.path] = `${publicPath}${dirname}${filename}`
    await new Promise((resolve, reject) => {
      const request = http.get(src, (response) => {
        if (
          page.validStatus === undefined
            ? response.statusCode !== 200
            : response.statusCode !== page.validStatus
        ) {
          reject(
            new Error(
              `Failed to load resource: ` +
                `the server responded with a status of ${response.statusCode} ` +
                `(${response.statusMessage}) ${src}`,
            ),
          )
          return
        }

        const file = fs.createWriteStream(path.join('build/public', dirname, filename))
        file.on('error', reject)
        file.on('finish', resolve)
        response.pipe(file)
      })

      request.on('error', (error) => {
        reject(error)
      })
    })
  }, Promise.resolve())

  server.kill('SIGTERM')
  return assets
}
