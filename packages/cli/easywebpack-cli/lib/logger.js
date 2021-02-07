const chalk = require('chalk');
const { EASY_CLI } = require('./constant');
class Logger {

  constructor(cli) {
    this.cli = cli;
    this.chalk = chalk;
  }

  static getLogger(cli) {
    cli = cli || global.EASY_CLI || EASY_CLI;
    return new Logger(cli);
  }

  /* istanbul ignore next */
  green(msg, ex = '') {
    /* istanbul ignore next */
    console.log(chalk.blueBright(`[${this.cli.name}] ${chalk.green(msg)}`), ex);
  }
  /* istanbul ignore next */
  red(msg, ex = '') {
    /* istanbul ignore next */
    console.log(chalk.blueBright(`[${this.cli.name}] ${chalk.red(msg)}`), ex);
  }
  /* istanbul ignore next */
  yellow(msg, ex = '') {
    /* istanbul ignore next */
    console.log(chalk.blueBright(`[${this.cli.name}] ${chalk.yellow(msg)}`), ex);
  }
}


module.exports = Logger;