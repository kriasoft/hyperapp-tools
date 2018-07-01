// Configuration defines how to minify javascript code
// http://lisperator.net/uglifyjs/
// https://github.com/webpack-contrib/uglifyjs-webpack-plugin

module.exports = (env) => ({
  cache: true,
  parallel: true,
  sourceMap: true,

  // https://github.com/mishoo/UglifyJS2/tree/harmony#minify-options
  uglifyOptions: {
    compress: env.browser,
    mangle: env.browser,
    output: {
      comments: false,
    },
  },
})
