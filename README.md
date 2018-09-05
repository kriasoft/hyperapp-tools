# <img height="24" src="https://cdn.rawgit.com/kriasoft/hyperapp-tools/master/logo.svg"> Hyperapp Tools

[![npm version](https://img.shields.io/npm/v/hyperapp-tools.svg)](https://www.npmjs.com/package/hyperapp-tools)
[![npm downloads](https://img.shields.io/npm/dw/hyperapp-tools.svg)](https://www.npmjs.com/package/hyperapp-tools)
[![slack chat](https://hyperappjs.herokuapp.com/badge.svg)](https://hyperappjs.herokuapp.com 'Join us')

Build automation tools for [Hyperapp](https://hyperapp.js.org/) projects.

## Prerequisites

- MacOS, Windows, or Linux
- [Node.js](https://nodejs.org/) v8.9.0 or newer

## Getting Started

To create a new app, run a single command:

```bash
npm init hyperapp-starter
```

It will generate the initial project structure based on
[`Hyperapp Starter`](https://github.com/kriasoft/hyperapp-starter)
inside the current directory and install the dependencies.

## Available Scripts

In the project directory, you can run:

### `npm start` <sub><sup>(`hyperapp-tools start`)</sup></sub>

Runs the app in the development mode with "live reload". Uses `src/index.js` and `src/server.js` files as entry points for client-side and server-side apps.

### `npm test` <sub><sup>(`hyperapp-tools test`)</sup></sub>

Launches the test runner. It will look for test files with `.test.js` or `.spec.js` suffix. Also you can use any [cli options](https://jestjs.io/docs/en/cli#options) which [Jest](https://jestjs.io/) supports.

### `npm run lint` <sub><sup>(`hyperapp-tools lint`)</sup></sub>

Finds problematic patterns in code using [ESLint](https://eslint.org/) and [stylelint](https://stylelint.io/). Using `--fix` option you can automatically fix some of them and also format files using [Prettier](https://prettier.io/).

### `npm run build` <sub><sup>(`hyperapp-tools build`)</sup></sub>

Builds the app for production to the build folder. It correctly bundles, optimizes and minifyes the build for the best performance and the filenames include the hashes for a long term caching. Using `--render` option you can generate html files for a static site hosting.

## Environment Variables

You can adjust various development and production settings by setting [environment variables](https://en.wikipedia.org/wiki/Environment_variable) in your shell. To define permanent environment variables, create a file called `.env` in the root of your project:

```bash
# The host the app should bind to. By default binds to localhost.
HOST = "0.0.0.0"

# The port the app should listen on. From 0 to 65535 inclusive.
# If port is omitted or is 0, the operating system will assign an arbitrary unused port.
PORT = 0

# Open the default system browser during the development server startup.
# Use the favorite application name or "none" to disable disable it completely.
BROWSER = ""

# The base path for all the static files within the application in production mode.
# Examples: `"https://cdn.example.com/"`, `"/base/path/"` or `""` for relative urls.
PUBLIC_URL = "/"
```

## License

Hyperapp Tools are MIT licensed.
See [LICENSE](https://github.com/kriasoft/hyperapp-tools/blob/master/LICENSE.md).
