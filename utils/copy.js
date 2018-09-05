const fs = require('fs-extra')

module.exports = async (src, dest) => {
  if (await fs.pathExists(src)) {
    await fs.copy(src, dest, { dereference: true })
  }
}
