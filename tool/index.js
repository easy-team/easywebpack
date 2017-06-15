'use strict';
const webpack = require('webpack');
const koa = require('koa');
const cors = require('kcors');
const open = require('opn');
const artTemplate = require('art-template');
const merge = require('webpack-merge');
const app = koa();
app.use(cors());

class WebpackTool {
  constructor(config) {
    this.artTemplate = artTemplate;
    this.config = merge({ port: 8888, debugTemplate: `${__dirname}/index.html` }, config);
    this.webpackConfig = Array.isArray(this.config.webpackConfig) ? this.config.webpackConfig : [this.config.webpackConfig];
    this.publicPath = this.config.publicPath || this.webpackConfig[0].output.publicPath;
  }

  build(callback) {
    webpack(this.webpackConfig, (err, compilation) => {
      if (err) {
        throw err;
      }
      const stats = compilation.stats || [compilation];

      stats.forEach(stat => {
        process.stdout.write(`${stat.toString(merge({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false
        }, this.config && this.config.stat))}\n`);
      });
      callback && callback();
    });
  }

  server() {

    const compiler = webpack(this.webpackConfig);
    compiler.plugin('done', compilation => {
      app.webpackBuildFiles = [];
      compilation.stats.forEach(stat => {

        // console.log(stat.compilation.modules);
        stat.compilation.children = stat.compilation.children.filter(child => child.name !== 'extract-text-webpack-plugin');
        app.webpackBuildFiles.push({
          stat,
          files: Object.keys(stat.compilation.assets)
        });
      });
      setTimeout(() => {
        app.listen(this.config.port, err => {
          if (!err) {
            const url = `http://127.0.0.1:${this.config.port}`;
            console.info(`start webpack dev server: ${url}`);
            if (this.config.openBrowser === undefined || this.config.openBrowser) {
              open(`${url}/debug`);
            }
          }
        });
      }, 200);
    });

    const devMiddleware = require('koa-webpack-dev-middleware')(compiler, {
      publicPath: this.publicPath,
      stats: {
        colors: true,
        children: true,
        modules: false,
        chunks: false,
        chunkModules: false
      },
      watchOptions: {
        ignored: /node_modules/
      }
    });

    app.use(devMiddleware);

    const self = this;

    app.use(function *(next) {
      if (this.url === '/debug') {
        this.body = self.renderDebugTemplate.bind(self)(app.webpackBuildFiles);
      } else {
        yield next;
      }
    });
    if (this.hot === undefined || this.hot) {
      const hotMiddleware = require('koa-webpack-hot-middleware')(compiler, {
        log: false,
        reload: true
      });
      app.use(hotMiddleware);
    }
  }

  getBuildName(stat) {
    const modules = stat.compilation.modules;
    const target = stat.compilation.options.target;
    if (target === 'node') {
      return 'Server';
    }
    const isWeex = modules.some(m => /weex-vue-loader/.test(m.request));
    if (isWeex) {
      return 'Weex';
    }
    return 'Web';
  }

  renderDebugTemplate(webpackBuildFiles) {
    const buildFiles = [];
    webpackBuildFiles.forEach(item => {
      const builds = {
        name: this.getBuildName(item.stat),
        files: []
      };

      item.files.forEach(filepath => {
        builds.files.push({
          name: filepath,
          url: this.publicPath + filepath
        });
      });
      buildFiles.push(builds);
    });
    return this.artTemplate(this.config.debugTemplate, { buildFiles });
  }
}

module.exports = WebpackTool;
