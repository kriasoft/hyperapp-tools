// Configuration define how to convert source code into distribution format
// https://webpack.js.org/
// https://github.com/webpack/webpack

const path = require('path')
const cssnano = require('cssnano')
const { HotModuleReplacementPlugin } = require('webpack')
const ManifestPlugin = require('webpack-manifest-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const LastCallWebpackPlugin = require('last-call-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const getLocalIdent = require('../tools/get-local-ident')
const targetNodeVersion = require('../tools/target-node-version')
const loadConfig = require('../tools/load-config')

const browsersListConfig = loadConfig('browserslist')
const cssnanoConfig = loadConfig('cssnano')
const uglifyConfig = loadConfig('uglify')
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
        ...(env.production ? [] : [path.resolve(__dirname, '../tools/webpack-hot-client.js')]),
        './src/index.js',
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
                      modules: false,
                      targets: { browsers: browsersListConfig(env) },
                      useBuiltIns: 'entry',
                      loose: true,
                    },
                  ],
                  ...babelConfig.presets.slice(1),
                ],
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
                    config: { path: path.resolve(__dirname, '../tools/postcss.config.js') },
                  },
                },
              ],
            },
            {
              test: /\.svg$/,
              loader: require.resolve('../tools/webpack-svg-loader'),
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
      minimizer: [
        new UglifyJsPlugin(uglifyConfig({ production: env.production, browser: true })),
        new LastCallWebpackPlugin({
          assetProcessors: [
            {
              phase: LastCallWebpackPlugin.PHASES.OPTIMIZE_CHUNK_ASSETS,
              regExp: /\.css$/,
              async processor(assetName, asset, assets) {
                const { source, map: prev } = asset.sourceAndMap()
                const postcssOpts = {
                  from: assetName,
                  map: {
                    inline: false,
                    annotation: true,
                    prev,
                  },
                }
                const cssnanoOpts = cssnanoConfig({ production: env.production })
                const result = await cssnano.process(source, postcssOpts, cssnanoOpts)
                let map = result.map ? result.map.toJSON() : null
                if (map) {
                  map.sources = map.sources.map(
                    (file) =>
                      `webpack:///./${path.relative(process.cwd(), file).replace(/\\/g, '/')}`,
                  )
                  map.sourceRoot = ''
                  map = JSON.stringify(map)
                }
                assets.setAsset(`${assetName}.map`, map)
                return result.css
              },
            },
          ],
        }),
      ],
    },

    devtool: env.production ? 'source-map' : 'cheap-module-inline-source-map',
  },

  // Configuration for the server-side bundle
  {
    context: process.cwd(),
    mode: env.production ? 'production' : 'development',
    name: 'server',
    target: 'node',

    entry: {
      server: [
        ...(env.production ? [] : [path.resolve(__dirname, '../tools/webpack-hot-server.js')]),
        './src/server.js',
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

    externals: [
      './assets.json',
      nodeExternals({
        modulesFromFile: { include: ['dependencies'] },
        whitelist: [/\.(?!(?:js|jsx|mjs|json)$).{1,5}$/],
      }),
    ],

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
              loader: require.resolve('../tools/webpack-svg-loader'),
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
      minimizer: [new UglifyJsPlugin(uglifyConfig({ production: env.production, browser: false }))],
    },

    // Do not replace node globals with polyfills
    // https://webpack.js.org/configuration/node/
    node: false,

    devtool: env.production ? 'source-map' : 'cheap-module-inline-source-map',
  },
]
