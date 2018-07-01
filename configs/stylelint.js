// Configuration defines how to lint and fix CSS using stylelint tool
// https://stylelint.io/
// https://github.com/stylelint/stylelint
// https://stylelint.io/user-guide/configuration/

module.exports = {
  extends: [
    // The standard config based on a handful of CSS style guides
    // https://github.com/stylelint/stylelint-config-standard
    require.resolve('stylelint-config-standard'),

    // Sort related property declarations by grouping together in the rational order
    // https://github.com/constverum/stylelint-config-rational-order
    require.resolve('stylelint-config-rational-order'),

    // Turns off all rules that are unnecessary or might conflict with Prettier
    // https://github.com/prettier/stylelint-config-prettier
    require.resolve('stylelint-config-prettier'),
  ],

  plugins: [
    // Sort CSS rules content with specified order
    // https://github.com/hudochenkov/stylelint-order
    require.resolve('stylelint-order'),
  ],

  rules: {
    // Specify the order of content within declaration blocks
    // https://github.com/hudochenkov/stylelint-order/blob/master/rules/order/README.md
    'order/order': ['custom-properties', 'dollar-variables', 'declarations', 'rules', 'at-rules'],

    // Disallow unknown pseudo-class selectors
    // https://stylelint.io/user-guide/rules/selector-pseudo-class-no-unknown/
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: [
          // CSS Modules :global scope
          // https://github.com/css-modules/css-modules#exceptions
          'global',
        ],
      },
    ],
  },
}
