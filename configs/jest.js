// Test runner tool configuration
// https://facebook.github.io/jest/
// https://github.com/facebook/jest
// https://facebook.github.io/jest/docs/en/configuration.html

const path = require('path')

module.exports = {
  rootDir: process.cwd(),
  moduleFileExtensions: ['js', 'json', 'jsx', 'mjs', 'node'],
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  transform: {
    '^.+\\.(js|jsx|mjs)$': path.resolve(__dirname, '../utils/babel-transform.js'),
    '^.+\\.css$': path.resolve(__dirname, '../utils/css-transform.js'),
    '^(?!.*\\.(js|jsx|mjs|css|json)$)': path.resolve(__dirname, '../utils/file-transform.js'),
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$'],
  collectCoverageFrom: ['src/**/*.{js,jsx,mjs}'],
  testMatch: ['**/__tests__/**/*.{js,jsx,mjs}', '**/?(*.)(spec|test).{js,jsx,mjs}'],
}
