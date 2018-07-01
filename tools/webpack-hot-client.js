// Light version of webpack-hot-client/client for client bundle

/* global window, WebSocket, __webpack_hash__, __hotClientOptions__ */
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

const refresh = 'Please refresh the page.'
const maxRetries = 10
let retry = maxRetries
let currentHash = null
let initial = true
let isUnloading = false

window.addEventListener('beforeunload', () => {
  isUnloading = true
})

function reload() {
  log.info('Refreshing Page')
  window.location.reload()
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
        log.warn(`Cannot find update. The server may have been restarted. ${refresh}`)
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

function update() {
  if (isUnloading) {
    return
  }

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
}

function connect(handler) {
  if (typeof WebSocket === 'undefined') {
    log.warn('WebSocket is not supported')
    return
  }
  const { host, port } = options.webSocket
  let open = false
  let socket = new WebSocket(
    `${options.https ? 'wss' : 'ws'}://${host === '*' ? window.location.hostname : host}:${port}/`,
  )

  socket.addEventListener('open', () => {
    open = true
    retry = maxRetries
    log.info('WebSocket connected')
  })

  socket.addEventListener('close', () => {
    log.warn('WebSocket closed')

    open = false
    socket = null

    const timeout = 1000 * (maxRetries - retry) ** 2 + Math.random() * 100

    if (open || retry <= 0) {
      log.warn(`WebSocket: ending reconnect after ${maxRetries} attempts`)
      return
    }

    log.info(`WebSocket: attempting reconnect in ${parseInt(timeout / 1000, 10)}s`)

    setTimeout(() => {
      retry -= 1

      connect(handler)
    }, timeout)
  })

  socket.addEventListener('message', (event) => {
    log.debug('WebSocket: message:', event.data)

    const message = JSON.parse(event.data)

    if (handler[message.type]) {
      handler[message.type](message.data)
    }
  })
}

connect({
  compile({ compilerName }) {
    log.info(`webpack: Compiling (${compilerName})`)
  },

  errors({ errors }) {
    log.warn('webpack: Encountered errors while compiling. Reload prevented.')

    for (let i = 0; i < errors.length; i += 1) {
      log.error(errors[i])
    }
  },

  hash({ hash }) {
    currentHash = hash
  },

  invalid({ fileName }) {
    log.info(`App updated. Recompiling ${fileName}`)
  },

  ok() {
    if (initial) {
      initial = false
      return
    }

    update()
  },

  'window-reload': () => {
    reload()
  },

  warnings({ warnings }) {
    log.warn('Warnings while compiling.')

    for (let i = 0; i < warnings.length; i += 1) {
      log.warn(warnings[i])
    }

    if (initial) {
      initial = false
      return
    }

    update()
  },
})
