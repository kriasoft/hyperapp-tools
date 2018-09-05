// http://facebook.github.io/jest/docs/en/webpack.html

const path = require('path')

const moduleRegExp = /\.module\.svg$/

module.exports = {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename))

    if (moduleRegExp.test(filename)) {
      return (
        `module.exports = {\n` +
        `  __esModule: true,\n` +
        `  default: function Svg() { return ${assetFilename} }\n` +
        `};\n`
      )
    }

    return `module.exports = ${assetFilename};\n`
  },
}
