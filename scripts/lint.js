const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const prettier = require('prettier')
const eslint = require('eslint')
const stylelint = require('stylelint')
const { red, yellow, bold, underline, dim } = require('colorette')
const loadConfig = require('../tools/load-config')

const prettierConfig = loadConfig('prettier')()
const eslintConfig = loadConfig('eslint')()
const stylelintConfig = loadConfig('stylelint')()

module.exports = async function lint(argv) {
  process.env.NODE_ENV = 'test'
  process.env.BABEL_ENV = 'test'
  const args = argv.filter((arg) => arg[0] !== '-')
  const pattern = args.length > 1 ? `{${args.join(',')}}` : args[0] || '**/*'
  const files = await new Promise((resolve, reject) =>
    glob(
      pattern,
      {
        nodir: true,
        ignore: ['**/node_modules/**', 'build/**', 'coverage/**'],
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    ),
  )

  const fix = argv.includes('--fix')
  const eslintCli = new eslint.CLIEngine({
    baseConfig: eslintConfig,
    fix,
  })
  const eslintFormatter = eslintCli.getFormatter()
  const prettierExtensions = prettier
    .getSupportInfo()
    .languages.reduce((list, language) => list.concat(language.extensions), [])
  const eslintExtensions = ['.js', '.mjs', '.jsx']
  const stylelintExtensions = ['.css']
  const stylelintDeprecations = []
  const stylelintInvalidOptionWarnings = []
  let errorCount = 0
  let warningCount = 0

  await files.reduce(async (promise, filename) => {
    await promise
    const extname = path.extname(filename)
    let source
    let output

    if (prettierExtensions.includes(extname)) {
      const config = await prettier.resolveConfig(filename)
      const options = {
        ...prettierConfig,
        ...config,
        filepath: filename,
      }

      source = await fs.readFile(filename, 'utf8')
      output = source
      if (fix) {
        output = prettier.format(output, options)
      } else if (!prettier.check(output, options)) {
        errorCount += 1
        process.stderr.write(
          `\n${underline(filename)}  ${red('error')}  Unformatted  ${dim('prettier')}\n`,
        )
      }
    }

    if (eslintExtensions.includes(extname)) {
      const report = eslintCli.executeOnText(output, filename, true)
      const result = report.results[0]
      errorCount += result.errorCount
      warningCount += result.warningCount
      if (result.messages.length > 0) {
        const out = eslintFormatter([{ ...result, filePath: filename }])
        process.stderr.write(out.replace(/\n\n.*problem[\s\S]+$/, '\n'))
      }
      if (result.output != null) {
        const code = result.output
        output = code
      }
    }

    if (stylelintExtensions.includes(extname)) {
      const report = await stylelint.lint({
        code: output,
        codeFilename: filename,
        config: stylelintConfig,
        fix,
      })

      const result = report.results[0]
      stylelintDeprecations.push(...result.deprecations)
      stylelintInvalidOptionWarnings.push(...result.invalidOptionWarnings)
      const messages = result.warnings
      if (messages.length > 0) {
        messages.forEach((message) => {
          if (message.severity === 'error') {
            errorCount += 1
          } else if (message.severity === 'warning') {
            warningCount += 1
          }
        })
        const results = [{ ...result, deprecations: [], invalidOptionWarnings: [] }]
        const out = stylelint.formatters.string(results)
        process.stderr.write(out.slice(0, -1))
      }

      if (report.output != null) {
        const code = report.output
        output = code
      }
    }

    if (fix && output != null && output !== source) {
      await fs.outputFile(filename, output, 'utf8')
    }
  }, Promise.resolve())

  if (stylelintDeprecations.length > 0 || stylelintInvalidOptionWarnings.length > 0) {
    const results = [
      {
        source: 'package.json',
        errored: false,
        warnings: [],
        deprecations: stylelintDeprecations,
        invalidOptionWarnings: stylelintInvalidOptionWarnings,
        ignored: false,
      },
    ]
    const out = stylelint.formatters.string(results)
    process.stderr.write(out.slice(0, -1))
  }

  const total = errorCount + warningCount
  if (total > 0) {
    const color = errorCount === 0 ? yellow : red
    const highlight = (text) => color(bold(text))
    process.stderr.write(
      `\n${highlight(
        `Found ${total} problem${total === 1 ? '' : 's'}${
          fix
            ? ` (${errorCount} error${errorCount === 1 ? '' : 's'}` +
              `, ${warningCount} warning${warningCount === 1 ? '' : 's'}).`
            : '. Use `--fix` option to automatically fix some of them.'
        }`,
      )}\n`,
    )
  }

  if (errorCount > 0) {
    return 1
  }

  if ('CI' in process.env && warningCount > 0) {
    process.stderr.write(`${red('Treating warnings as errors because CI detected.')}\n`)
    return 1
  }

  return 0
}
