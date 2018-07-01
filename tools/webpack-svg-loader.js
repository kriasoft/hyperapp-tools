const path = require('path')
const Svgo = require('svgo')
const fileLoader = require('file-loader')
const babel = require('@babel/core')
const loadConfig = require('./load-config')

const production = process.env.NODE_ENV === 'production'
const browsersListConfig = loadConfig('browserslist')
const svgoConfig = loadConfig('svgo')
const babelConfig = loadConfig('babel')()
const babelTransformOptions = {
  ...babelConfig,
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        ...babelConfig.presets[0][1],
        modules: false,
        targets: { browsers: browsersListConfig({ production }) },
        useBuiltIns: 'entry',
        loose: true,
      },
    ],
    ...babelConfig.presets.slice(1),
  ],
}

const moduleRegExp = /\.module\.svg$/
const inlineRegExp = /\.inline\.svg$/
const toUpperRegExp = /[_.-\s]+./g
const svgTagRegExp = /(<svg[^>]*)(>)/
const escapeRegExp = /[\n"#%&<>]/g
const escapeLookup = new Map([
  ['"', "'"],
  ['#', '%23'],
  ['%', '%25'],
  ['&', '%26'],
  ['<', '%3C'],
  ['>', '%3E'],
])

function escaper(match) {
  return escapeLookup.get(match)
}

function getComponentName(resourcePath) {
  const filenameOrFolder =
    path.basename(resourcePath) === 'index.module.svg'
      ? path.basename(path.dirname(resourcePath))
      : path.basename(resourcePath, '.module.svg')
  const filename = `${filenameOrFolder}Svg`
  const camelCase = filename.replace(toUpperRegExp, (s) => s[s.length - 1].toUpperCase())
  const upperCamelCase = camelCase[0].toUpperCase() + camelCase.slice(1)
  try {
    // eslint-disable-next-line no-new, no-new-func
    new Function(upperCamelCase, `var ${upperCamelCase}`)
  } catch (e) {
    return 'Svg'
  }
  return upperCamelCase
}

async function loader(source) {
  const env = {
    production,
    module: moduleRegExp.test(this.resourcePath),
    inline: inlineRegExp.test(this.resourcePath),
  }
  const svgoOptions = svgoConfig(env)
  const svgo = new Svgo(svgoOptions)
  const { data } = await svgo.optimize(source, { path: this.resourcePath })

  if (env.module) {
    const { code } = babel.transform(
      `import { h } from "hyperapp";\n` +
        `export default function ${getComponentName(this.resourcePath)}(props) {\n` +
        `  return (${data.replace(svgTagRegExp, '$1 {...props}$2')});\n` +
        `}\n`,
      babelTransformOptions,
    )
    return code
  }

  if (env.inline) {
    const dataURI = `data:image/svg+xml;charset=utf-8,${data.replace(escapeRegExp, escaper)}`
    return `module.exports = "${dataURI}";\n`
  }

  return fileLoader.call(this, data)
}

module.exports = function webpackSvgLoader(source) {
  const callback = this.async()
  loader
    .call(this, source)
    .then((result) => callback(null, result))
    .catch((error) => callback(error instanceof Error ? error : new Error(error)))
}
