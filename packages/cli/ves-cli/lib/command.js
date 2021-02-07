'use strict';
const path = require('path');
const EasyCLI = require('@easy-team/easywebpack-cli');
const Action = require('./action');

module.exports = class VesCommand extends EasyCLI.Command {

  constructor() {
    super();
    this.cli.name = 'ves-cli';
    this.cli.cmd = 'ves';
    this.context = path.resolve(__dirname, '..');
    this.program.filename = path.resolve(this.baseDir, 'config/ves.config.js');
    this.action = new Action(this);
  }

  init() {
    this.boilerplate = require('./ask');
    super.init();
  }

  tsc() {
    this.program
      .command('tsc')
      .option('-p, --project [filename]', 'tsconfig.json file path', this.baseDir)
      .description('typescript compile')
      .action(options => {
        this.action.tsc(options);
      });
  }

  command() {
    this.register('tsc');
    super.command();
  }
};