// http://facebook.github.io/jest/docs/en/webpack.html

const moduleRegExp = /\.module\.css$/

module.exports = {
  process(src, filename) {
    if (moduleRegExp.test(filename)) {
      return (
        `module.exports = new Proxy({}, {\n` +
        `  get: (target, key) => key === '__esModule' ? false : key\n` +
        `});\n`
      )
    }

    return 'module.exports = {};\n'
  },
}
