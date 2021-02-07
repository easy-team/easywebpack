'use strict';
const path = require('path');
const shell = require('shelljs');
const chalk = require('chalk');

if (shell.which('node')) {
  const NODE_COMMAND_PATH = shell.which('node').stdout;
  const NODE_PATH = path.join(NODE_COMMAND_PATH, '../../lib/node_modules');
  console.log(chalk.yellow('\r\n Please execute flow command, Add global easywebpack-cli to $NODE_PATH'));
  console.log(chalk.green('\r\n1. Use vim command to open bash_profile file: \r\n\r\n') + chalk.blue('vim ~/.bash_profile'));
  console.log(chalk.green('\r\n2. Use export command to add NODE_PATH in bash_profile: \r\n\r\n') + chalk.blue(`export NODE_PATH=${NODE_PATH}:$NODE_PATH`));
  console.log(chalk.green('\r\n3. Use source command to make NODE_PATH take effect immediately: \r\n\r\n') + chalk.blue('source ~/.bash_profile'));
}
