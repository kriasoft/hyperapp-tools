// Configuration defines how to lint and fix js code using ESLint tool
// https://eslint.org/
// https://github.com/eslint/eslint
// https://eslint.org/docs/user-guide/configuring

module.exports = {
  extends: [
    // Use the most popular style guide as a base config
    // https://github.com/airbnb/javascript
    require.resolve('eslint-config-airbnb'),

    // Turns off all rules that are unnecessary or might conflict with Prettier
    // https://github.com/prettier/eslint-config-prettier
    require.resolve('eslint-config-prettier'),
    require.resolve('eslint-config-prettier/react'),
  ],

  env: {
    browser: true,
    es6: true,
    node: true,
  },

  rules: {
    // Allow shadow for "state" and "actions" as the most common pattern in Hyperapp
    // https://eslint.org/docs/rules/no-shadow
    'no-shadow': [
      'error',
      { builtinGlobals: false, hoist: 'functions', allow: ['state', 'actions'] },
    ],

    // Allow ".js" and ".mjs" files to use JSX syntax
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-filename-extension.md
    'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.mjs'] }],

    // Disable React specific rule (prevent usage of unknown DOM property)
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-unknown-property.md
    'react/no-unknown-property': 'off',

    // Disable React specific rule (prevent missing props validation)
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prop-types.md
    'react/prop-types': 'off',
  },

  settings: {
    react: {
      pragma: 'h',
    },
  },

  overrides: [
    {
      files: ['**/__tests__/**/*.{js,jsx,mjs}', '**/*.{test,spec}.{js,jsx,mjs}'],
      env: {
        jest: true,
      },
    },
  ],
}
