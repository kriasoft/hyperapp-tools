// Configuration defines how to minify styles using CSSNano tool
// http://cssnano.co/
// https://github.com/cssnano/cssnano

const loadConfig = require('../utils/load-config')

const svgoConfig = loadConfig('svgo')

module.exports = (env) => ({
  preset: [
    'default',
    {
      // Remove all comments from css
      // https://cssnano.co/optimisations/discardcomments/
      discardComments: {
        removeAll: true,
      },

      // Compresses inline SVG
      // https://cssnano.co/optimisations/svgo/
      svgo: svgoConfig({ production: env.production, module: false, inline: true }),
    },
  ],
})
