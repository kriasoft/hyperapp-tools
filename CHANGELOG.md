# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2018-08-12

- Update dependencies.

## [1.2.0] - 2018-07-24

- Exclude commonjs modules from server bundle.
- Enable source maps for server in development mode by default.
- Use external source maps in development mode.
- Fix memory leak in server hot module replacement.

## [1.1.0] - 2018-07-17

- Allow [namespaced JSX](https://babeljs.io/docs/en/next/babel-plugin-transform-react-jsx.html#throwifnamespace).
- Remove [`cssnano`](https://github.com/cssnano/cssnano) and [`last-call-webpack-plugin`](https://github.com/NMFR/last-call-webpack-plugin) dependencies in favor of [`optimize-cssnano-plugin`](https://github.com/intervolga/optimize-cssnano-plugin) with more accurate source maps generation.
- Replace [`chalk`](https://github.com/chalk/chalk)
  with a faster [`turbocolor`](https://github.com/jorgebucaran/turbocolor)
  ([#1](https://github.com/kriasoft/hyperapp-tools/pull/1)).

## [1.0.2] - 2018-07-03

- Fix WebSocket hostname to make hot updates work on external url.

## [1.0.1] - 2018-07-02

- Fix compatibility with Windows.

## 1.0.0 - 2018-07-01

- Initial public release.

[unreleased]: https://github.com/kriasoft/hyperapp-tools/compare/v1.2.1...HEAD
[1.2.1]: https://github.com/kriasoft/hyperapp-tools/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/kriasoft/hyperapp-tools/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/kriasoft/hyperapp-tools/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/kriasoft/hyperapp-tools/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/kriasoft/hyperapp-tools/compare/v1.0.0...v1.0.1
