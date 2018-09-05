const url = require('url')
const path = require('path')

module.exports = () => {
  const { PUBLIC_URL } = process.env
  if (typeof PUBLIC_URL === 'string') {
    return PUBLIC_URL
  }

  const pkg = require(path.resolve('package.json'))
  if (typeof pkg.homepage === 'string') {
    const { pathname } = url.parse(pkg.homepage)
    return pathname ? path.posix.join('/', pathname, '/') : ''
  }

  return '/'
}
