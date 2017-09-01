#!/usr/bin/env node
'use strict'

const chalk = require('chalk')
const meow = require('meow')
const updateNotifier = require('update-notifier')
const ora = require('ora')
const { getPackage, getPackages, getDownloads } = require('npmstat')
const shoutError = require('shout-error')
const shoutSuccess = require('shout-success')
const sortArr = require('sort-arr')

const cli = meow(
  `
  Usage:
    $ npmstat <package name>      get download count of this module
    $ npmstat <username> -u       get user npm information
    $ npmstat <package name> -p   get package npm information

  Example:
    $ npmstat react-cookies
    $ npmstat react-cookies -r=last-week
    $ npmstat react-cookies -r=2017-07-01
    $ npmstat bukinoshita -u
    $ npmstat react-cookies -p

  Options:
    -r RANGE, --range=RANGE       choose range
    -u, --user                    get user npm information
    -p, --pkg                     get package npm information
    -h, --help                    show help options
    -v, --version                 show version
`,
  {
    alias: {
      r: 'range',
      u: 'user',
      p: 'pkg',
      h: 'help',
      v: 'version'
    }
  }
)

updateNotifier({ pkg: cli.pkg }).notify()

const run = () => {
  const input = cli.input[0]
  const { user, pkg, range = 'last-month' } = cli.flags
  const spinner = ora('Loading packages...')
  spinner.start()

  if (user) {
    return getPackages(input).then(res => {
      spinner.stop()
      const arr = sortArr(res, 'name')

      shoutSuccess(
        `${chalk.bold(input)} has ${chalk.bold(res.length)} npm packages.\n`
      )

      arr.map(p => {
        console.log(
          `${chalk.bold(p.name)} @${p.version}\n${p.description}\n${p.links
            .repository || p.links.npm}\n`
        )
      })
    })
  }

  if (pkg) {
    return getPackage(input).then(res => {
      spinner.stop()

      if (res === 'Not Found') {
        return shoutError(res)
      }

      console.log(
        `${chalk.bold('name')}: ${res.name}\n${chalk.bold(
          'description'
        )}: ${res.description}\n${chalk.bold(
          'version'
        )}: ${res.version}\n${chalk.bold('author')}: ${res.author.name}`
      )
    })
  }

  getDownloads(input, { range }).then(res => {
    spinner.stop()

    if (res === `package ${input} not found`) {
      return shoutError(res)
    }

    shoutSuccess(`${res.package} has ${res.downloads} downloads.`)
  })
}

run()
