# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2018-10-05

- Replace [@babel/plugin-transform-async-to-generator](https://babeljs.io/docs/en/babel-plugin-transform-async-to-generator)
  with [fast-async](https://github.com/MatAtBread/fast-async)
  to reduce bundle size when `async/await` are used.
- Replace [uglifyjs-webpack-plugin](https://github.com/webpack-contrib/uglifyjs-webpack-plugin)
  with [terser-webpack-plugin](https://github.com/webpack-contrib/terser-webpack-plugin)
  because `uglify-es` is abandoned.
- Keep `role` attribute for svg tags imported as a module.

## [2.0.0] - 2018-09-05

- Update dependencies. Use Babel `v7` and ESlint `v5`.
- Change required Node.js version from `v8.3` to `v8.9`.
- Use pathname from `homepage` package.json field as a public path for assets in production mode.
- Replace legacy `turbocolor` package with a brand new `colorette`.
- Rename `tasks` to `scripts` and `tools` to `utils`.
- Ignore `coverage` directory during linting.

## [1.2.2] - 2018-08-12

- Allow `.js`, `.mjs` and `.jsx` extensions for `src/index` and `src/server` entry points.

## [1.2.1] - 2018-08-12

- Update dependencies.

## [1.2.0] - 2018-07-24

- Exclude commonjs modules from server bundle.
- Enable source maps for server in development mode by default.
- Use external source maps in development mode.
- Fix memory leak in server hot module replacement.

## [1.1.0] - 2018-07-17

- Allow [namespaced JSX](https://babeljs.io/docs/en/next/babel-plugin-transform-react-jsx.html#throwifnamespace).
- Remove [`cssnano`](https://github.com/cssnano/cssnano)
  and [`last-call-webpack-plugin`](https://github.com/NMFR/last-call-webpack-plugin)
  dependencies in favor of [`optimize-cssnano-plugin`](https://github.com/intervolga/optimize-cssnano-plugin)
  with more accurate source maps generation.
- Replace [`chalk`](https://github.com/chalk/chalk)
  with a faster [`turbocolor`](https://github.com/jorgebucaran/turbocolor)
  ([#1](https://github.com/kriasoft/hyperapp-tools/pull/1)).

## [1.0.2] - 2018-07-03

- Fix WebSocket hostname to make hot updates work on external url.

## [1.0.1] - 2018-07-02

- Fix compatibility with Windows.

## 1.0.0 - 2018-07-01

- Initial public release.

[unreleased]: https://github.com/kriasoft/hyperapp-tools/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/kriasoft/hyperapp-tools/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/kriasoft/hyperapp-tools/compare/v1.2.2...v2.0.0
[1.2.2]: https://github.com/kriasoft/hyperapp-tools/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/kriasoft/hyperapp-tools/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/kriasoft/hyperapp-tools/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/kriasoft/hyperapp-tools/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/kriasoft/hyperapp-tools/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/kriasoft/hyperapp-tools/compare/v1.0.0...v1.0.1
