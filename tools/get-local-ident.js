const path = require('path')
const loaderUtils = require('loader-utils')

const packageJsonProject = require(path.resolve('package.json'))
const packageJson = require('../package.json')

const production = process.env.NODE_ENV === 'production'
const hashSalt = packageJsonProject.name || packageJson.name
const hashDigestLength = 5

module.exports = ({ resourcePath }, localIdentName, localName) => {
  const relativePath = path.relative(process.cwd(), resourcePath)
  const hash = loaderUtils.getHashDigest(
    hashSalt + relativePath + localName,
    'md5',
    'base64',
    hashDigestLength,
  )
  if (production) {
    return hash
  }
  const filenameOrFolder =
    path.basename(relativePath) === 'index.module.css'
      ? path.basename(path.dirname(relativePath))
      : path.basename(relativePath, '.module.css')
  return `${filenameOrFolder}-${localName}-${hash}`
}
