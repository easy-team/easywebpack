'use strict';
const chalk = require('chalk');
exports.boilerplateChoice = [
  {
    name: `Create ${chalk.green('React')} ${chalk.yellow('Server Side Render')} Web Application for Res`,
    value: 'res-react-asset-boilerplate',
    pkgName: 'res-react-asset-boilerplate',
    choices: ['name', 'description', 'npm']
  },
  {
    name: `Create ${chalk.green('React')} ${chalk.yellow('Client Side Render')} Web Application for Res`,
    value: 'res-react-spa-boilerplate',
    pkgName: 'res-react-spa-boilerplate',
    choices: ['name', 'description', 'npm']
  },
  {
    name: `Create ${chalk.green('React')} ${chalk.yellow('Nunjucks HTML Render')} Web Application for Res`,
    value: 'res-react-html-boilerplate',
    pkgName: 'res-react-html-boilerplate',
    choices: ['name', 'description', 'npm']
  },
  {
    name: `Create ${chalk.green('React')} ${chalk.yellow('Nunjucks Asset Render')} Web Application for Res`,
    value: 'res-react-asset-boilerplate',
    pkgName: 'res-react-asset-boilerplate',
    choices: ['name', 'description', 'npm']
  },
  {
    name: `Create ${chalk.green('React')} ${chalk.yellow('TypeScript')} Awesome Web Application for Res`,
    value: 'res-awesome',
    pkgName: 'res-awesome',
    choices: ['name', 'description', 'npm']
  },
];