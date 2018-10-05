// Configuration defines how SVGO tool should minify SVG using plugins
// https://github.com/svg/svgo

module.exports = (env) => ({
  plugins: [
    // Moves + merges styles from style elements to element styles
    // https://github.com/svg/svgo/blob/master/plugins/inlineStyles.js
    {
      inlineStyles: {
        onlyMatchedOnce: false,
      },
    },

    // Do not remove title for accessibility
    // https://github.com/svg/svgo/blob/master/plugins/removeTitle.js
    {
      removeTitle: false,
    },

    // Remove the xmlns attribute when present
    // https://github.com/svg/svgo/blob/master/plugins/removeXMLNS.js
    {
      removeXMLNS: env.module,
    },

    // Remove unknown elements content and attributes,
    // remove attributes with default values
    // https://github.com/svg/svgo/blob/master/plugins/removeUnknownsAndDefaults.js
    {
      removeUnknownsAndDefaults: {
        keepRoleAttr: env.module,
      },
    },
  ],
})
