#!/usr/bin/env node
'use strict'

const chalk = require('chalk')
const meow = require('meow')
const updateNotifier = require('update-notifier')
const ora = require('ora')
const npmstat = require('npmstat')
const shoutError = require('shout-error')
const shoutMessage = require('shout-message')

const cli = meow(
  `
  Usage:
    $ npmstat <npm username>    get npm stats

  Example:
    $ npmstat bukinoshita
    $ npmstat --count=100

  Options:
    -c COUNT, --count=COUNT     Choose branch as default
    -h, --help                  Show help options
    -v, --version               Show version
`,
  {
    alias: {
      c: 'count',
      h: 'help',
      v: 'version'
    }
  }
)

updateNotifier({ pkg: cli.pkg }).notify()

const run = () => {
  const username = cli.input[0]
  const count = cli.flags.count || 10
  const spinner = ora('Loading packages...')

  if (username) {
    spinner.start()
    return npmstat(username).then(packages => {
      spinner.stop()

      packages.map((pkg, i) => {
        if (i < count) {
          shoutMessage(
            `${chalk.bold(pkg.package)}\n  ${chalk.bold.green(
              pkg.downloads
            )} ${chalk.gray('downloads')}\n`
          )
        }
      })

      console.log(`${username} has ${packages.length} packages.\n`)
    })
  }

  shoutError('Username is required')
}

run()
