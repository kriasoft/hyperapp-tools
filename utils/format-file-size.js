module.exports = (bytes) => {
  if (bytes < 1024) return `${bytes} Byte${Math.abs(bytes) === 1 ? '' : 's'}`
  const magnitude = Math.floor(Math.log(bytes) / Math.log(1024))
  const fixed = (bytes / 1024 ** magnitude).toFixed(2)
  return `${Number(fixed)} ${'BKMGTPEZY'[magnitude]}iB`
}
