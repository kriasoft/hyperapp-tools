// https://webpack.js.org/configuration/externals/

const fs = require('fs')
const path = require('path')
const { builtinModules } = require('module')

const modulesDir = path.resolve(process.cwd(), 'node_modules')
const extensions = ['.js', 'jsx', '.mjs', '.json']
const hotServer = path.resolve(__dirname, './webpack-hot-server.js')

function isExternal(context, request) {
  if (request === './assets.json') return true
  if (request === hotServer) return false
  if (builtinModules.includes(request)) return true
  const filename = path.resolve(request.charAt(0) === '.' ? context : modulesDir, request)
  const paths = filename.split(path.sep)
  const modulesIndex = paths.lastIndexOf('node_modules')
  if (modulesIndex !== -1) {
    const moduleName = paths[modulesIndex + 1] || ''
    const isScoped = moduleName.charAt(0) === '@'
    const moduleFileIndex = modulesIndex + (isScoped ? 3 : 2)
    const moduleDirPaths = paths.slice(0, moduleFileIndex)
    const moduleFilePaths = paths.slice(moduleFileIndex)
    if (moduleFilePaths.length > 0) {
      const extname = path.extname(moduleFilePaths.join(path.sep))
      if (extname && !extensions.includes(extname)) return false
    }
    moduleDirPaths.push('package.json')
    const pkgJson = moduleDirPaths.join(path.sep)
    if (fs.existsSync(pkgJson)) {
      const pkg = require(pkgJson)
      if (pkg.module) return false
    }
    return true
  }
  return false
}

module.exports = (context, request, callback) => {
  if (isExternal(context, request)) {
    return callback(null, `commonjs ${request}`)
  }
  return callback()
}
