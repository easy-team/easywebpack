'use strict';
const path = require('path');
const assert = require('assert');
const Utils = require('../utils/utils');
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

  addHotEntry() {
    if (this.config.hot) {
      const hotMiddleware = require.resolve('webpack-hot-middleware').split(path.sep);
      hotMiddleware.pop();
      const hotConfig = `${path.posix.join(hotMiddleware.join(path.sep))}/client?path=http://${Utils.getIp()}:${this.config.port}/__webpack_hmr&noInfo=false&reload=false&quiet=false`;
      const packKeys = Object.keys(this.packs);
      Object.keys(this.options.entry).forEach(name => {
        if (!/\./.test(name) && !packKeys.includes(name) && (this.config.commonsChunk && !this.config.commonsChunk.includes(name))) {
          this.options.entry[name] = [hotConfig].concat(this.options.entry[name]);
        }
      });
    }
  }

  addHtml() {
    const html = this.config.entry && this.config.entry.html;
    if (html && html.include) {
      assert(html.template, 'webpack html template not set, please call setHtml method set or config.html');
      const htmlConfig = Object.assign({}, this.config, { entry: html });
      const entry = Utils.getEntry(htmlConfig, this.type);
      this.setOption({ entry });
      Object.keys(entry).forEach(entryName => {
        const chunks = this.config.commonsChunk ? [].concat(this.config.commonsChunk).concat(entryName) : [entryName];
        const htmlDir = html.buildDir || this.config.prefix;
        const template = Utils.normalizePath(html.template, this.config.baseDir);
        const filename = `${htmlDir}/${entryName}.html`;
        const config = this.merge({ chunks, filename, template }, html.options);
        this.configPlugin[entryName] = {
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
    //this.addHtml();
    this.addPack(this.config.packs);
    return super.create();
  }
}
module.exports = WebpackClientBuilder;
