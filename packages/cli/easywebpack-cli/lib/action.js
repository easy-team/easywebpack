'use strict';
const path = require('path');
const fs = require('fs');
const _ = require('lodash.get');
const Archive = require('archive-tool');
const tool = require('node-tool-utils');
const Logger = require('./logger');
const Boilerplate = require('./init');
const builder = require('./builder');
const utils = require('./utils');
const initTemplateList = require('./template');

module.exports = class Action extends Logger {
  constructor(command) {
    super();
    this.command = command;
    this.cli = command.cli;
    this.program = command.program;
    this.baseDir = command.baseDir;
  }

  // support external set wepback config
  initCustomizeConfig(options) {
    return {};
  }

  // merge costomize and cli config
  initConfig(option = {}, cli = {}) {
    const CMD = this.cli.cmd.toUpperCase();
    const rawArgs = Array.from(this.program.rawArgs).slice(2);
    rawArgs.unshift(this.cli.cmd);
    if (option.env) {
      process.env[`${CMD}_ENV`] = option.env;
    }
    process.env[`${CMD}_CMD`] = rawArgs.join(' ');
    process.env[`${CMD}_RAW`] = rawArgs;
    const config = this.initCustomizeConfig(option);
    return utils.initConfig(this.program, config, option, cli);
  }

  async init(boilerplate, options) {
    if (options.sync) {
      const filepath = path.resolve(__dirname, 'ask-sync.js');
      const url = options.sync === true ? process.env.EASY_INIT_ASK_URL || 'https://raw.githubusercontent.com/easy-team/easywebpack-cli/master/lib/ask.js' : options.sync;
      utils.request(url).then(res => {
        fs.writeFileSync(filepath, res.data);
        this.green(`init config sync successfully, please run [${this.cli.cmd} init] again`);
      }).catch(err => {
        this.red(`easy sync error: ${err.toString()}`, 'red');
      });
    } else {
      return new Boilerplate(boilerplate, this.cli).init(options);
    }
  }

  async install(options) {
    const config = this.initConfig({
      install: {
        check: true,
        npm: options.mode || 'npm'
      }
    });
    builder.getWebpackConfig(config);
  }

  async dev(options) {
    const config = this.initConfig(options);
    builder.server(config);
  }

  async start(options) {
    const config = this.initConfig(options);
    builder.server(config);
  }

  async build(env, options) {
    const config = this.initConfig({ env, cliDevtool : options.devtool}, { speed: options.speed });
    // 编译完成, 启动 HTTP Server 访问静态页面
    if (options.server) {
      const done = config.config.done;
      config.config.done = (multiCompiler, compilation) => {
        done && done(multiCompiler, compilation);
        const compiler = multiCompiler.compilers.find(item => {
          return item.options.target === 'web';
        });
        if (compiler) { // 自动解析 output.path
          const dist = compiler.options.output.path;
          const port = options.server === true ? undefined : options.server;
          tool.httpServer({
            dist,
            port
          });
        }
      };
    }
    builder.build(config);
  }

  async dll(env, options) {
    const config = this.initConfig({ env, framework: 'dll' }, { dll: true });
    builder.build(config);
  }

  /**
   * //error: zsh: no matches found
   * 1.在 ~/.zshrc 中加入：setopt no_nomatch
   * 2.执行 source ~/.zshrc
   * @param {*} env
   * @param {*} options
   */
  async print(env, options) {
    if (options.ip) {
      const ip = tool.getIp();
      this.green('', ip);
      this.green('', `http://${ip}:7001`);
      this.green('', `http://${ip}:9000`);
    } else {
      const config = this.initConfig({ env });
      const webpackConfig = builder.getWebpackConfig(config);
      const webpackConfigList = Array.isArray(webpackConfig) ? webpackConfig : (webpackConfig ? [webpackConfig] : []);
      if (webpackConfigList.length) {
        const key = options.key || options.node;
        if (key) {
          webpackConfigList.forEach(item => {
            this.green(`webpack ${this.program.type || item.target || ''} ${key} info:\r\n`, _(item, key));
          });
        } else {
          this.green('webpack config info:\r\n', webpackConfig);
        }
      } else {
        this.yellow('webpack config is empty');
      }
    }
  }

  async server(options) {
    options.port = tool.getPort(options.port || 8888);
    tool.httpServer(options);
  }

  async zip(options) {
    const config = utils.initArchiveOption(this.baseDir, this.program, options);
    const archive = new Archive(config);
    archive.zip();
  }

  async tar(options) {
    const config = utils.initArchiveOption(this.baseDir, this.program, options);
    const archive = new Archive(config);
    archive.tar();
  }

  async deploy(options) {
    this.yellow('[deploy] command not implemented');
  }

  async upgrade(options) {
    if (options.babel) {
      require('./babel')(this.baseDir, options);
    } else {
      require('./upgrade')(this.baseDir, options);
    }
  }

  async clean(dir) {
    if (dir === 'all') {
      utils.clearTempDir(this.baseDir);
      utils.clearManifest(this.baseDir);
      utils.clearBuildDir(this.baseDir);
    } else if (dir) {
      tool.rm(dir);
    } else {
      utils.clearTempDir(this.baseDir);
    }
  }

  async kill(port) {
    tool.kill(port || '7001,9000,9001');
  }

  async open(dir) {
    const filepath = dir ? dir : utils.getCompileTempDir(this.baseDir);
    tool.open(filepath);
    process.exit();
  }

  async doc(url, options) {
    if (url) {
      tool.opn(url);
    }
    const keys = ['github', 'yuque', 'easy', 'webpack', 'react', 'vue', 'bug', 'entry', 'loader', 'plugin', 'babel'];
    for(let key of keys) {
      if (options[key]) {
        tool.opn(options[key]);
        break;
      }
    }
    process.exit();
  }

  async puppeteer(options) {
    const puppeteer = require('easy-puppeteer-html');
    return puppeteer.capture(options);
  }

  async debug() {
    this.yellow('[debug] command not implemented');
  }

  async test() {
    this.yellow('[test] command not implemented');
  }

  async cov() {
    this.yellow('[cov] command not implemented');
  }

  async add(options) {
    initTemplateList(this.cli, options);
  }
};
