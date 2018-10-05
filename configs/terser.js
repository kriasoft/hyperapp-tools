// Configuration defines how to minify javascript code
// https://github.com/terser-js/terser
// https://github.com/webpack-contrib/terser-webpack-plugin

module.exports = (env) => ({
  cache: true,
  parallel: true,
  sourceMap: true,

  // https://github.com/fabiosantoscode/terser#minify-options
  terserOptions: {
    compress: env.browser
      ? true
      : {
          booleans: false,
          join_vars: false,
          keep_classnames: true,
          keep_fnames: true,
          keep_infinity: true,
        },
    mangle: env.browser,
    output: {
      beautify: !env.browser,
      comments: false,
    },
  },
})
