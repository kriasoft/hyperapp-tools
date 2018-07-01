// Light version of webpack-hot-client/client for server bundle

/* global __webpack_hash__, __hotClientOptions__ */
const options = __hotClientOptions__

if (!options) {
  throw new Error(
    'Something went awry and __hotClientOptions__ is undefined.' +
      'Possible bad build. HMR cannot be enabled.',
  )
}

const log = {
  level: options.logLevel,
  index: (level) => ['trace', 'debug', 'info', 'warn', 'error', 'silent'].indexOf(level),
  trace: (message) => log.print('trace', message),
  debug: (message) => log.print('debug', message),
  info: (message) => log.print('info', message),
  warn: (message) => log.print('warn', message),
  error: (message) => log.print('error', message),
  print: (type, message) => {
    if (log.index(type) >= log.index(log.level)) {
      // eslint-disable-next-line no-console
      console[type](message)
    }
  },
}

if (module.hot) {
  log.info('Hot Module Replacement Enabled. Waiting for signal.')
} else {
  throw new Error('Hot Module Replacement is disabled.')
}

const refresh = 'Please restart the server.'
let currentHash = null

function reload() {
  log.info('Reloading Server')
  process.emit('SIGRELOAD')
}

function upToDate() {
  return currentHash.indexOf(__webpack_hash__) >= 0
}

function result(modules, appliedModules) {
  const unaccepted = modules.filter(
    (moduleId) => appliedModules && appliedModules.indexOf(moduleId) < 0,
  )

  if (unaccepted.length > 0) {
    log.warn(
      `The following modules could not be updated:\n` +
        `${unaccepted.map((moduleId) => `  ⦻ ${moduleId}`).join('\n')}`,
    )
  }

  if (!(appliedModules || []).length) {
    log.info('No Modules Updated.')
  } else {
    log.info(
      `The following modules were updated:\n` +
        `${appliedModules.map((moduleId) => `  ↻ ${moduleId}`).join('\n')}`,
    )

    const numberIds = appliedModules.every((moduleId) => typeof moduleId === 'number')
    if (numberIds) {
      log.info('Please consider using the NamedModulesPlugin for module names.')
    }
  }
}

function check() {
  module.hot
    .check()
    .then((modules) => {
      if (!modules) {
        log.warn('Cannot find update. The server may have been restarted.')
        reload()
        return null
      }

      return module.hot
        .apply({})
        .then((appliedModules) => {
          if (!upToDate()) {
            check()
          }

          result(modules, appliedModules)

          if (upToDate()) {
            log.info('App is up to date.')
          }
        })
        .catch((err) => {
          const status = module.hot.status()
          if (['abort', 'fail'].indexOf(status) >= 0) {
            log.warn(`Cannot apply update. ${refresh}`)
            log.warn(err.stack || err.message)
            reload()
          } else {
            log.warn(`Update failed: ${err.stack}` || err.message)
          }
        })
    })
    .catch((err) => {
      const status = module.hot.status()
      if (['abort', 'fail'].indexOf(status) >= 0) {
        log.warn(`Cannot check for update. ${refresh}`)
        log.warn(err.stack || err.message)
        reload()
      } else {
        log.warn(`Update check failed: ${err.stack}` || err.message)
      }
    })
}

process.on('SIGUPDATE', (hash) => {
  currentHash = hash
  if (!upToDate()) {
    const status = module.hot.status()

    if (status === 'idle') {
      log.info('Checking for updates to the bundle.')
      check()
    } else if (['abort', 'fail'].indexOf(status) >= 0) {
      log.warn(`Cannot apply update. A previous update ${status}ed. ${refresh}`)
      reload()
    }
  }
})
