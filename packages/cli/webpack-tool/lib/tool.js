'use strict';
const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const cors = require('kcors');
const chalk = require('chalk');
const merge = require('webpack-merge');
const easyHelper = require('easy-helper');
const hotMiddleware = require('./hot');
const devMiddleware = require('./dev');
const proxyMiddleware = require('./proxy');
const historyMiddleware = require('./history');
const utils = require('./utils');
const webpack = utils.getWebpack();
const NavigationPage = require('./nav');
class WebpackTool {
  constructor(config) {
    this.config = merge({
      debugPort: 8888,
      hot: false,
    }, config);
    this.ready = false;
    this.startTime = Date.now();
    this.cli = utils.getCLI(this.config.cli);
    this.baseDir = this.config.baseDir || process.cwd();
    const pkgFile = path.join(this.baseDir, 'package.json');
    const defaultPkgInfo = { name: 'webpack-project', version: '1.0.0'};
    if (fs.existsSync(pkgFile)) {
      this.pkgInfo = Object.assign({}, defaultPkgInfo, require(pkgFile));
    } else {
      this.pkgInfo = defaultPkgInfo;
    }
  }

  /* istanbul ignore next */
  green(msg, ex = '') {
    /* istanbul ignore next */
    console.log(chalk.blueBright(`\r\n[${this.cli.name}] ${chalk.green(msg)}`), ex);
  }

   /* istanbul ignore next */
  red(msg, ex = '') {
    /* istanbul ignore next */
    console.log(chalk.blueBright(`\r\n[${this.cli.name}] ${chalk.red(msg)}`), ex);
  }

  processCompilation(compilation) {
    compilation.stats.forEach(stat => {
      stat.compilation.children = stat.compilation.children.filter(child => {
        return !/html-webpack-plugin/.test(child.name) && !/mini-css-extract-plugin/.test(child.name);
      });
    });
  }

  printCompilation(compilation) {
    compilation.stats.forEach(stat => {
      process.stdout.write(`${stat.toString(merge({
        colors: true,
        modules: false,
        children: true,
        chunks: false,
        chunkModules: false,
        entrypoints: false
      }, compilation.stat))}\n`);
    });
  }

  normalizeHotEntry(webpackConfig) {
    const target = webpackConfig.target;
    if (target === 'web') {
      const port = this.getPort(target);
      utils.normalizeHotEntry(webpackConfig, port);
      // console.log('webpackConfig web', webpackConfig.entry)
    } else {
      // console.log('webpackConfig node', webpackConfig.entry)
    }
  }

  normalizeWebpackConfig(webpackConfig) {
    const webpackConfigList = Array.isArray(webpackConfig) ? webpackConfig : [webpackConfig];
    webpackConfigList.forEach(item => {
      if (item.devServer) {
        this.devServer = item.devServer;
        delete item.devServer;
      }
    });
    return webpackConfigList;
  }

  compilerHook(compiler, callback) {
    compiler.hooks.done.tap('webpack-tool-build-done', compilation => {
      callback(compilation);
    });
  }

  getPort(target = 'web', offset = 0) {
    const EASY_ENV_DEV_PORT = `EASY_ENV_DEV_PORT_${this.pkgInfo.name}`;
    const port =  this.config.port || Number(process.env[EASY_ENV_DEV_PORT]) || 9000;
    // https://github.com/easy-team/egg-webpack/issues/24
    if (!this.config.offsetPort && target === 'web') {
      return port;
    }
    return port + offset;
  }

  // start webpack dev server and webapck build result view
  server(webpackConfig, options, callback) {
    return this.dev(webpackConfig, options, (compiler, compilation, webpackConfigItem) => {
      callback && callback(compiler, compilation, webpackConfigItem);
      // only one html file
      const htmls = Object.keys(compilation.compilation.assets).filter(url => {
        return /\.(html|htm)$/.test(url);
      }).sort();
      const port = this.getPort();
      if (htmls.length === 1) {
        const webpackConfig = compiler.options;
        const publicPath = webpackConfig.output.publicPath;
        const url = utils.normalizeURL(port, publicPath, htmls[0]);
        setTimeout(() => {
          this.green(`http visit url: ${url}`);
        }, 200);
      } else {
        this.createDebugServer(compiler, compilation);
      }
    });
  }

  // start webpack dev server
  dev(webpackConfig, options, callback) {
    let readyCount = 0;
    const compilers = [];
    const webpackConfigList = this.normalizeWebpackConfig(webpackConfig);
    webpackConfigList.forEach((webpackConfigItem, index) => {
      this.normalizeHotEntry(webpackConfigItem);
      const compiler = webpack(webpackConfigItem);
      this.createWebpackServer(compiler, { offset : index });
      this.compilerHook(compiler, compilation => {
        readyCount++;
        if (!this.ready && readyCount % webpackConfigList.length === 0) {
          this.ready = true;
          callback && callback(compiler, compilation, webpackConfigItem);
        }
      });
      compilers.push(compiler);
    });
    return compilers;
  }

  // webpack build
  build(webpackConfig, options, callback) {
    const webpackConfigList = this.normalizeWebpackConfig(webpackConfig);
    const compiler = webpack(webpackConfigList, (err, compilation) => {
      // https://webpack.js.org/api/node/#webpack-
      if (err || (compilation && compilation.hasErrors())) {
        if (err) {
          this.red(`[${__filename}] webpack build error`, err);
        }
        process.exit(1);
      }
    });
    this.compilerHook(compiler, compilation => {
      this.processCompilation(compilation);
      this.printCompilation(compilation);
      callback && callback(compiler, compilation);
    });
    return compiler;
  }

  createDebugServer(compiler, stats) {
    const config = this.config;
    const app = new Koa();
    app.use(cors());
    app.use(async (ctx, next) => {
      if (this.url === '/debug') {
        ctx.body = new NavigationPage(config, compiler, stats).create();
      } else {
        await next;
      }
    });

    utils.getPort(this.config.debugPort).then(port => {
      app.listen(port, err => {
        if (!err) {
          const devServer = this.devServer || {};
          const url = utils.getBrowserUrl(port, 'debug');
          if (devServer.open) {
            utils.open(url);
          }
          if (devServer.openPage) {
            utils.open(devServer.openPage);
          }
          this.green(`start webpack build navigation ui view: ${url}`);
        }
      });
    });
    return app;
  }

  createWebpackCompiler(webpackConfig, callback) {
    const compiler = webpack(webpackConfig);
    compiler.hooks.done.tap('webpack-tool-build-done', compilation => {
      callback && callback(compiler, compilation);
    });
    return compiler;
  }

  createDevServerOptions(webpackConfig, devServer) {
    const { output } = webpackConfig;
    return {
      headers: {
        'x-webpack': 'easywebpack',
        'cache-control': 'max-age=0',
      },
      publicPath: output.publicPath
    };
  }

  createWebpackServer(compiler, options = {}) {
    const offset = options.offset;
    const webpackConfig = compiler.options;
    const target = webpackConfig.target;
    const output = webpackConfig.output;
    const { devServer = {} } = this.config;
    const { before, after, historyApiFallback, proxy = {} } = devServer;
    const app = new Koa();

    // https://webpack.docschina.org/configuration/dev-server/#devserver-before
    if (typeof before === 'function') {
      before(app);
    }

    app.use(cors());
    // only web use hot middleware
    if (target === 'web' || target === undefined) {
      // http-proxy
      Object.keys(proxy).forEach(key => {
        app.use(proxyMiddleware(key, proxy[key]));
      });
      // https://webpack.docschina.org/configuration/dev-server/#devserver-historyapifallback
      // const historyOptions = historyApiFallback === true ? {} : historyApiFallback;
      // app.use(historyMiddleware(historyOptions));
      app.use(hotMiddleware(compiler, { log: false, reload: true }));
    }

    const devOptions = this.createDevServerOptions(webpackConfig, devServer);
    app.use(devMiddleware(compiler, devOptions));

    // https://webpack.docschina.org/configuration/dev-server/#devserver-after
    if (typeof after === 'function') {
      after(app);
    }

    const port = this.getPort(target, offset);
    // https://github.com/easy-team/egg-webpack/issues/24
    if (!this.config.port) {
      this.config.port = port;
    }
    app.listen(port, err => {
      if (!err) {
        const url = utils.getHost(port);
        if (target) {
          this.green(`start webpack ${target} building server: ${url}`);
        } else {
          this.green(`start webpack building server: ${url}`);
        }
        const key = target || 'web';
        easyHelper.setEasyInfo({
          [key]: {
            url,
            port,
            webpack: {
              context: webpackConfig.context,
              output: {
                path: output.path,
                publicPath: output.publicPath
              }
            }
          }
        });
      }
    });
    return app;
  }
}

module.exports = WebpackTool;
