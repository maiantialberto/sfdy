#!/usr/bin/env node

const program = require('commander')
const packageInfo = require('../package.json')

program
  .version(packageInfo.version, '-v, --version')
  .description(packageInfo.description)
  .usage('<command> [options]')
  .command('retrieve', 'Retrieve patched metadata')
  .command('deploy', 'Deploy patched metadata')
  .command('community:publish', 'Publish community')
  .command('prepare', 'Patch metadata')
  .command('init', 'Create .sfdy.json config file')
  .command('auth', 'Obtain a refresh token with the OAuth 2.0 web server flow')
  .parse(process.argv)
