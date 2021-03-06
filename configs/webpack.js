// Configuration define how to convert source code into distribution format
// https://webpack.js.org/
// https://github.com/webpack/webpack

const path = require('path')
const { HotModuleReplacementPlugin } = require('webpack')
const ManifestPlugin = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssnanoPlugin = require('@intervolga/optimize-cssnano-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const getLocalIdent = require('../utils/get-local-ident')
const targetNodeVersion = require('../utils/target-node-version')
const webpackExternals = require('../utils/webpack-externals')
const loadConfig = require('../utils/load-config')

const browsersListConfig = loadConfig('browserslist')
const cssnanoConfig = loadConfig('cssnano')
const terserConfig = loadConfig('terser')
const babelConfig = loadConfig('babel')()

module.exports = (env) => [
  // Configuration for the client-side bundle
  {
    context: process.cwd(),
    mode: env.production ? 'production' : 'development',
    name: 'client',
    target: 'web',

    entry: {
      app: [
        ...(env.production ? [] : [path.resolve(__dirname, '../utils/webpack-hot-client.js')]),
        './src/index',
      ],
    },

    output: {
      publicPath: env.publicPath.startsWith('/') ? `${env.publicPath}assets/` : '',
      path: path.resolve('build/public/assets'),
      filename: `[name]${env.production ? '.[contenthash:8]' : ''}.js`,
      chunkFilename: `[name]${env.production ? '.[contenthash:8]' : ''}.chunk.js`,
    },

    resolve: {
      extensions: ['.js', '.json', '.mjs', '.jsx'],
      mainFields: ['browser', 'esnext', 'module', 'main'],
    },

    module: {
      rules: [
        {
          oneOf: [
            {
              include: path.resolve('public'),
              loader: require.resolve('file-loader'),
              options: {
                context: path.resolve('public'),
                name: '[path][name].[ext]',
                emitFile: false,
              },
            },
            {
              test: /\.(js|jsx|mjs)$/,
              loader: require.resolve('babel-loader'),
              options: {
                ...babelConfig,
                cacheDirectory: !env.production,
                presets: [
                  [
                    require.resolve('@babel/preset-env'),
                    {
                      ...babelConfig.presets[0][1],
                      exclude: ['transform-regenerator', 'transform-async-to-generator'],
                      modules: false,
                      targets: { browsers: browsersListConfig(env) },
                      useBuiltIns: 'entry',
                      loose: true,
                    },
                  ],
                  ...babelConfig.presets.slice(1),
                ],
                plugins: [[require.resolve('fast-async'), { spec: true }], ...babelConfig.plugins],
              },
            },
            {
              test: /\.css$/,
              rules: [
                {
                  loader: env.production
                    ? MiniCssExtractPlugin.loader
                    : require.resolve('style-loader'),
                  options: { sourceMap: true },
                },
                {
                  oneOf: [
                    {
                      test: /\.module\.css$/,
                      loader: require.resolve('css-loader'),
                      options: {
                        modules: true,
                        getLocalIdent,
                        importLoaders: 1,
                        sourceMap: true,
                      },
                    },
                    {
                      loader: require.resolve('css-loader'),
                      options: { importLoaders: 1, sourceMap: true },
                    },
                  ],
                },
                {
                  loader: require.resolve('postcss-loader'),
                  options: {
                    config: { path: path.resolve(__dirname, '../utils/postcss.config.js') },
                  },
                },
              ],
            },
            {
              test: /\.svg$/,
              loader: require.resolve('../utils/webpack-svg-loader'),
              options: { name: '[name].[hash:8].[ext]' },
            },
            {
              test: /\.inline\.[^.]+$/,
              loader: require.resolve('url-loader'),
            },
            {
              exclude: /\.json$/,
              loader: require.resolve('file-loader'),
              options: { name: '[name].[hash:8].[ext]' },
            },
          ],
        },
      ],
    },

    plugins: [
      // Enable hot module replacement for development mode only
      // https://webpack.js.org/plugins/hot-module-replacement-plugin/
      ...(env.production ? [] : [new HotModuleReplacementPlugin()]),

      // Emit a file with assets paths
      // https://github.com/danethurber/webpack-manifest-plugin
      new ManifestPlugin({
        publicPath: `${env.publicPath}assets/`,
        fileName: '../../assets.json',
        filter: (asset) => /\.(css|js)$/.test(asset.path),
      }),

      // Extracts CSS into separate files
      // https://github.com/webpack-contrib/mini-css-extract-plugin
      new MiniCssExtractPlugin({
        filename: `[name]${env.production ? '.[contenthash:8]' : ''}.css`,
        chunkFilename: `[name]${env.production ? '.[contenthash:8]' : ''}.chunk.css`,
      }),
    ],

    optimization: {
      // minimize: false,
      minimizer: [
        new TerserPlugin(terserConfig({ production: env.production, browser: true })),
        new OptimizeCssnanoPlugin({
          sourceMap: true,
          cssnanoOptions: cssnanoConfig({ production: env.production }),
        }),
      ],
    },

    devtool: env.production ? 'source-map' : 'cheap-module-source-map',
  },

  // Configuration for the server-side bundle
  {
    context: process.cwd(),
    mode: env.production ? 'production' : 'development',
    name: 'server',
    target: 'node',

    entry: {
      server: [
        ...(env.production
          ? []
          : [
              require.resolve('source-map-support/register'),
              path.resolve(__dirname, '../utils/webpack-hot-server.js'),
            ]),
        './src/server',
      ],
    },

    output: {
      publicPath: env.publicPath.startsWith('/') ? `${env.publicPath}assets/` : '',
      path: path.resolve('build'),
      filename: '[name].js',
      chunkFilename: 'chunks/[name].js',
      hotUpdateMainFilename: 'updates/[hash].hot-update.json',
      hotUpdateChunkFilename: 'updates/[id].[hash].hot-update.js',
      libraryTarget: 'commonjs2',
    },

    resolve: {
      extensions: ['.js', '.json', '.mjs', '.jsx'],
      mainFields: ['esnext', 'module', 'main'],
    },

    externals: webpackExternals,

    module: {
      rules: [
        {
          oneOf: [
            {
              include: path.resolve('public'),
              loader: require.resolve('file-loader'),
              options: {
                context: path.resolve('public'),
                name: '[path][name].[ext]',
                emitFile: false,
              },
            },
            {
              test: /\.(js|jsx|mjs)$/,
              loader: require.resolve('babel-loader'),
              options: {
                ...babelConfig,
                cacheDirectory: !env.production,
                presets: [
                  [
                    require.resolve('@babel/preset-env'),
                    {
                      ...babelConfig.presets[0][1],
                      modules: false,
                      targets: { node: targetNodeVersion },
                      useBuiltIns: 'entry',
                      loose: true,
                    },
                  ],
                  ...babelConfig.presets.slice(1),
                ],
              },
            },
            {
              test: /\.module\.css$/,
              loader: require.resolve('css-loader/locals'),
              options: {
                modules: true,
                getLocalIdent,
              },
            },
            {
              test: /\.css$/,
              loader: require.resolve('null-loader'),
            },
            {
              test: /\.svg$/,
              loader: require.resolve('../utils/webpack-svg-loader'),
              options: { name: '[name].[hash:8].[ext]', emitFile: false },
            },
            {
              test: /\.inline\.[^.]+$/,
              loader: require.resolve('url-loader'),
            },
            {
              exclude: /\.json$/,
              loader: require.resolve('file-loader'),
              options: { name: '[name].[hash:8].[ext]', emitFile: false },
            },
          ],
        },
      ],
    },

    plugins: [
      // Enable hot module replacement for development mode only
      // https://webpack.js.org/plugins/hot-module-replacement-plugin/
      ...(env.production ? [] : [new HotModuleReplacementPlugin()]),
    ],

    optimization: {
      nodeEnv: false,
      minimizer: [new TerserPlugin(terserConfig({ production: env.production, browser: false }))],
    },

    // Do not replace node globals with polyfills
    // https://webpack.js.org/configuration/node/
    node: false,

    devtool: env.production ? 'source-map' : 'cheap-module-source-map',
  },
]
