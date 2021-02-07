'use strict';
const path = require('path');
const program = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const tool = require('node-tool-utils');
const Logger = require('./logger');
const Action = require('./action');
const utils = require('./utils');
const builder = require('./builder');
const { EASY_CLI } = require('./constant');
global.EASY_CLI = EASY_CLI;
module.exports = class Command extends Logger {
  constructor() {
    super();
    this.baseDir = process.cwd();
    this.program = program;
    this.inquirer = inquirer;
    this.chalk = chalk;
    this.tool = tool;
    this.utils = utils;
    this.builder = builder;
    this.boilerplate = {};
    this.context = path.resolve(__dirname, '..');
    this.commands = ['init', 'install', 'dev', 'start', 'build', 'debug', 'test', 
      'cov', 'print', 'add', 'server', 'dll', 'zip', 'tar', 'deploy', 'clean', 
      'open', 'doc', 'kill', 'upgrade', 'puppeteer'];

    this.cli = new Proxy(EASY_CLI, {
      get: function (target, key, receiver) {
        return Reflect.get(target, key, receiver);
      },
      set: function (target, key, value, receiver) {
        global.EASY_CLI[key] = value;
        return Reflect.set(target, key, value, receiver);
      }
    });
    this.action = new Action(this);
  }

  version() {
    const pkg = require(path.resolve(this.context, 'package.json'));
    this.program.version(pkg.version, '-v, --version');
  }

  option() {
    this.program
      .option('-f, --filename [path]', 'webpack config file path')
      .option('-p, --port [port]', 'webpack server port')
      .option('-t, --type [type]', 'webpack build type: client, server, web, weex')
      .option('-w, --watch', 'webpack watch and hot-update')
      .option('-m, --md5', 'webpack md5 hash js/css/image')
      .option('-c, --compress', 'webpack compress js/css/image')
      .option('-b, --build [option]', 'w(watch), m(hash) , c(compress), ex: wm/wc/mc/wmc')
      .option('-s, --size [option]', 'webpack build size analyzer tool, support size: analyzer and stats, default analyzer')
      .option('--dll', 'only webpack dll config')
      .option('--web', 'only webpack web config')
      .option('--node', 'only webpack node config')
      .option('--devtool [devtool]', 'webpack devtool config')
      .option('--webpack', 'support native webpack dev and build');
  }

  init() {
    this.program
      .command('init')
      .option('-r, --registry [url]', 'npm registry, default https://registry.npmjs.org, you can taobao registry: https://registry.npm.taobao.org')
      .option('--sync [url]', 'sync easy init prompt template config')
      .description('init webpack config or boilerplate for Vue/React/Weex')
      .action(options => {
        this.action.init(this.boilerplate, options);
      });
  }

  install() {
    this.program
      .command('install')
      .option('--mode [mode]', 'mode: npm, cnpm, tnpm, yarn and so on')
      .description('dynamic install webpack missing npm module')
      .action(options => {
        this.action.install(options);
      });
  }

  dev() {
    this.program
      .command('dev [env]')
      .description('start webpack dev server for develoment mode')
      .action((env = 'dev') => {
        this.action.dev({ env });
      });
  }

  debug() {
    this.program
      .command('debug [env]')
      .description('start project for develoment debug mode')
      .action((env = 'dev') => {
        this.action.debug({ env });
      });
  }

  test() {
    this.program
      .command('test')
      .description('unit test')
      .action(() => {
        this.action.test();
      });
  }

  cov() {
    this.program
      .command('cov')
      .description('code cov')
      .action(() => {
        this.action.cov();
      });
  }

  add() {
    this.program
      .command('add')
      .option('--registry [url]', 'npm registry, default https://registry.npmjs.org, you can taobao registry: https://registry.npm.taobao.org')
      .option('--template [template]', 'template name, such as egg-controller/react-component, you can run [easy add] select')
      .option('--output [filename]', 'output file name')
      .option('--classname [classname]', 'file code class name', 'Index')
      .option('--dist [dist]', 'output dir')
      .description('add template code, component, config')
      .action(options => {
        this.action.add(options);
      });
  }

  start() {
    this.program
      .command('start [env]')
      .description('start webpack dev server for develoment mode')
      .action(env => {
        this.action.start({ env });
      });
  }

  build() {
    this.program
      .command('build [env]')
      .option('--devtool [devtool]', 'force set webpack devtool')
      .option('--server [port]', 'start http server')
      .option('--speed', 'stat webpack build speed')
      .description('webpack building')
      .action((env = 'prod', options) => {
        this.action.build(env, options);
      });
  }

  print() {
    this.program
      .command('print [env]')
      .option('--ip')
      .option('-n, --node [key]', 'print webpack config info by config key, example: [module/module.rules/plugins] and so on(Deprecated)')
      .option('-k, --key [key]', 'print webpack config info by config key, example: [module/module.rules/plugins] and so on')
      .description('print webpack config, support print by env or config key')
      .action((env = 'dev', options) => {
        this.action.print(env, options);
      });
  }

  server() {
    this.program
      .command('server')
      .option('-p, --port [port]', 'http server port')
      .option('-d, --dist [dist]', 'http server file dir')
      .option('-i, --index [index]', 'http server html index file name')
      .description('static file web http server')
      .action(options => {
        options.port = options.port || options.parent.port;
        this.action.server(options);
      });
  }

  upgrade() {
    this.program
      .command('upgrade')
      .option('--egg', 'use egg-bin and egg-scripts start application')
      .option('--babel', 'upgrade babel 6 to babel 7')
      .description('upgrade project package to latest version')
      .action(options => {
        this.action.upgrade(options);
      });
  }

  zip() {
    this.program
      .command('zip')
      .option('--filename [filename]', 'archive zip file name')
      .option('--source [path]', 'archive files root path')
      .option('--target [path]', 'archive zip file path')
      .option('--deps', 'install dependencies into node_modules')
      .option('--mode [mode]', 'mode: npm, cnpm, tnpm, yarn and so on')
      .option('--registry [registry]', 'dependence install registry url')
      .option('--nodejs', 'install node into node_modules')
      .option('--alinode', 'install alinode into node_modules')
      .description('archive files to zip file')
      .action(options => {
        this.action.zip(options);
      });
  }
  tar() {
    this.program
      .command('tar')
      .option('--filename [filename]', 'archive tar file name')
      .option('--source [path]', 'archive files root path')
      .option('--target [path]', 'archive tar file path')
      .option('--deps', 'install dependencies into node_modules')
      .option('--mode [mode]', 'mode: npm, cnpm, tnpm, yarn and so on')
      .option('--registry [registry]', 'dependence install registry url')
      .option('--node', 'install node into node_modules')
      .option('--alinode', 'install alinode into node_modules')
      .description('archive files to tar file')
      .action(options => {
        this.action.tar(options);
      });
  }

  deploy() {
    this.program
      .command('deploy')
      .description('upload file to deplay space')
      .action(options => {
        this.action.deploy(options);
      });
  }

  dll() {
    this.program
      .command('dll [env]')
      .description('webpack dll build')
      .action(env => {
        this.action.dll(env);
      });
  }

  clean() {
    this.program
      .command('clean [dir]')
      .description('webpack cache dir clean, if dir == "all", will clean cache dir and build dir')
      .action(dir => {
        this.action.clean(dir);
      });
  }

  open() {
    this.program
      .command('open [dir]')
      .description('open webpack cache dir')
      .action(dir => {
        this.action.open(dir);
      });
  }

  doc() {
    this.program
      .command('doc [url]')
      .option('--github', 'easy github', 'https://github.com/easy-team')
      .option('--yuque', 'easy-team document', 'https://www.yuque.com/easy-team')
      .option('--easy', 'easywebpack document', 'https://www.yuque.com/easy-team/easywebpack')
      .option('--react', 'egg react document', 'https://www.yuque.com/easy-team/egg-react')
      .option('--vue', 'egg vue document', 'https://www.yuque.com/easy-team/egg-vue')
      .option('--bug', 'easy problem document', 'https://www.yuque.com/easy-team/easywebpack/problem')
      .option('--entry', 'easy entry document', 'https://www.yuque.com/easy-team/easywebpack/entry')
      .option('--loader', 'easy loader document', 'https://www.yuque.com/easy-team/easywebpack/loader')
      .option('--plugin', 'easy plugin document', 'https://www.yuque.com/easy-team/easywebpack/plugin')
      .option('--babel', 'easy babel document', 'https://www.yuque.com/easy-team/easywebpack/babel')
      .description('easy-team document')
      .action((url, options) => {
        this.action.doc(url || 'https://easyjs.cn', options);
      });
  }

  kill() {
    this.program
      .command('kill [port]')
      .description('kill port process')
      .action(port => {
        this.action.kill(port);
      });
  }

  puppeteer() {
    this.program
      .command('puppeteer')
      .alias('pt')
      .option('--url [url]', 'prerender capture url')
      .option('--filepath [filepath]', 'need prerender dist file path, prerender content will inject into the file', 'src/view/index.html')
      .option('--selector [selector]', 'fetch selector element html. if not exist, will return all html', '#app')
      .option('--waitSelector [waitSelector]', ' fetch selector element html until waiting selector element exist, the config can get the client render mode html content', '#app')
      .option('--selectorOuterHTML', 'whether return selector self node content', true)
      .option('--base64', 'img with class="base64" is automatically converted to base64', false)
      .option('--userAgent', 'headless chrome userAgent', '')
      .option('--debug', 'print puppeteer execute cost and key debug info', false)
      .option('--modulePath [modulePath]', 'puppeteer module install path', process.env.PUPPETEER_MODULE_PATH)
      .description('pre-rendering by Puppeteer, https://github.com/easy-team/puppeteer-html-prerender-webpack-plugin')
      .action(options => {
        this.action.puppeteer(options);
      });
  }

  register(cmd) {
    if (this.commands.some(key => { key === cmd })) {
      this.red(`The command ${cmd} already exists. Please overwrite the command action method implement directly.`);
    } else {
      this.commands.push(cmd);
    }
  }

  command(commands=[]) {
    commands.forEach(cmd => {
      this.register(cmd);
    });
    this.commands.forEach(cmd => {
      if (this[cmd]) {
        this[cmd].apply(this);
      } else {
        this.red(`The command [${cmd}] is not implemented!`);
      }
    });
  }

  parse() {
    this.program.parse(process.argv);
  }

  run() {
    this.version();
    this.option();
    this.command();
    this.parse();
  }
}
