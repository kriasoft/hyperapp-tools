// Development server configuration
// https://github.com/webpack-contrib/webpack-serve

const path = require('path')

module.exports = (env) => ({
  compiler: env.compiler,
  logLevel: 'error',
  content: path.resolve('public'),
  port: process.env.PORT,
  host: process.env.HOST || '0.0.0.0',
  clipboard: false,
  open: false,

  // https://github.com/webpack/webpack-dev-middleware
  devMiddleware: {
    logLevel: 'silent',
    publicPath: '/',
    writeToDisk() {
      // There are problems with loading modules from memory on Windows, sorry :'(
      return process.platform === 'win32'
    },
  },

  // https://github.com/webpack-contrib/webpack-hot-client
  hotClient: {
    logLevel: 'error',
    autoConfigure: false,
  },

  async add(app, middleware) {
    await middleware.webpack()
    await middleware.content()
    await env.middleware(app)
  },
})
