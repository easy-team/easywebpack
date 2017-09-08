'use strict';
const path = require('path');
const assert = require('assert');
const WebpackBaseBuilder = require('./base');

class WebpackClientBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.type = 'client';
    this.setPrefix(this.config.prefix || 'client');
    if (this.config.egg) {
      this.setProxy(true);
    }
  }

  initHotEntry() {
    if (this.config.hot) {
      const hotMiddleware = require.resolve('webpack-hot-middleware').split(path.sep);
      hotMiddleware.pop();
      const hotConfig = `${path.posix.join(hotMiddleware.join(path.sep))}/client?path=http://${this.utils.getIp()}:${this.config.port}/__webpack_hmr&noInfo=false&reload=false&quiet=false`;
      const packKeys = Object.keys(this.packs);
      const commonsChunk = this.getCommonsChunk();
      Object.keys(this.options.entry).forEach(name => {
        if (!/\./.test(name) && !packKeys.includes(name) && !commonsChunk.includes(name)) {
          this.options.entry[name] = [hotConfig].concat(this.options.entry[name]);
        }
      });
    }
  }

  initPack() {
    this.addPack(this.config.packs);
  }

  initHtml() {
    const html = this.config.entry && this.config.entry.html;
    if (html && html.include) {
      assert(html.template, 'webpack html template not set, please call setHtml method set or config.html');
      const htmlConfig = Object.assign({}, this.config, { entry: html });
      const entry = this.utils.getEntry(htmlConfig, this.type);
      this.setOption({ entry });
      Object.keys(entry).forEach(entryName => {
        const commonsChunk = this.getCommonsChunk();
        const chunks = [].concat(commonsChunk).concat(entryName);
        const htmlDir = html.buildDir || this.config.prefix;
        const template = this.utils.normalizePath(html.template, this.config.baseDir);
        const filename = `${htmlDir}/${entryName}.html`;
        const config = this.merge({ chunks, filename, template }, html.options);
        this.plugins[entryName] = {
          type: 'client',
          name: 'html-webpack-plugin',
          args: this.merge({
            inject: true,
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeAttributeQuotes: true
            }
          }, config)
        };
      });
    }
  }

  create() {
    this.initCreate();
    this.initEntry();
    this.initPack();
    this.initHtml();
    this.initHotEntry();
    return super.create();
  }
}
module.exports = WebpackClientBuilder;
