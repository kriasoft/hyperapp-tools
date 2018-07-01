// Configuration defines which urls to render for a static site hosting

module.exports = {
  pages: [
    { path: '/' },

    // https://help.github.com/articles/creating-a-custom-404-page-for-your-github-pages-site/
    { path: '/404', validStatus: 404 },
  ],
}
