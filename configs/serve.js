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
