// Configuration defines how PostCSS tool should transform styles using plugins
// https://postcss.org/
// https://github.com/postcss/postcss
// https://github.com/postcss/postcss-loader#options

const postcssPresetEnv = require('postcss-preset-env')
const autoprefixer = require('autoprefixer')
const loadConfig = require('../utils/load-config')

const browsersListConfig = loadConfig('browserslist')

module.exports = (env) => ({
  plugins: [
    // Convert modern CSS into something browsers understand
    // https://github.com/csstools/postcss-preset-env
    postcssPresetEnv({ browsers: browsersListConfig(env), stage: 0 }),

    // Add vendor prefixes to CSS rules using values from https://caniuse.com/
    // https://github.com/postcss/autoprefixer
    autoprefixer({ browsers: browsersListConfig(env) }),
  ],

  // Enable source maps
  // https://github.com/postcss/postcss/blob/master/docs/source-maps.md
  map: {
    inline: false,
    annotation: false,
  },
})
