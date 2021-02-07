'use strict';
const chalk = require('chalk');
exports.boilerplateChoice = [
  {
    name: `Create ${chalk.green('Ves + TypeScript')} ${chalk.yellow('Server Side Render')} Web Application`,
    value: 'ves-blog',
    pkgName: 'ves-blog',
    choices: ['name', 'description', 'npm']
  },
  {
    name: `Create ${chalk.green('Ves + TypeScript')} ${chalk.yellow('Server Side Render')} Admin Application`,
    value: 'ves-admin',
    pkgName: 'ves-admin',
    choices: ['name', 'description', 'npm']
  },
];