// Configuration defines how to compile modern javascript into something browsers understand
// https://babeljs.io/
// https://github.com/babel/babel
// https://babeljs.io/docs/usage/api/#options

module.exports = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  plugins: [
    require.resolve('@babel/plugin-syntax-dynamic-import'),
    [
      require.resolve('@babel/plugin-transform-react-jsx'),
      {
        pragma: 'h',
        pragmaFrag: 'Fragment',
        useBuiltIns: true,
        throwIfNamespace: false,
      },
    ],
  ],
  env: {
    test: {
      plugins: [
        require.resolve('babel-plugin-dynamic-import-node'),
        // require.resolve('@babel/plugin-transform-react-jsx-source'),
      ],
    },
    development: {
      plugins: [
        // require.resolve('@babel/plugin-transform-react-jsx-source')
      ],
    },
  },
}
