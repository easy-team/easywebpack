'use strict';
const path = require('path');
const assert = require('assert');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Utils = require('../utils/utils');
const WebpackBaseBuilder = require('./base');

class WebpackClientBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.type = 'client';
    this.setPrefix(this.config.prefix || 'client');
    this.setExtractCss(!this.dev);
  }

  setHtml(html) {
    this.config.html = html;
  }

  setExtractCss(ex) {
    this.config.extractCss = !!ex;
    this.addPlugin(ExtractTextPlugin, () => this.config.cssName, !!ex);
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
    const html = this.config.html === true ? this.config.entry : this.config.html;
    if (html && html.include) {
      assert(html.template, 'webpack html template not set, please call setHtml method set');
      const entryDirs = Array.isArray(html.include) ? html.include : [html.include];
      const normalizeEntryDirs = entryDirs.map(entryDir => Utils.normalizePath(entryDir, this.config.baseDir));
      const entry = Utils.getEntry(normalizeEntryDirs, html.exclude);
      this.setOption({ entry });
      Object.keys(entry).forEach(entryName => {
        const chunks = this.config.commonsChunk ? [].concat(this.config.commonsChunk).concat(entryName) : [entryName];
        const htmlDir = html.buildDir || this.config.prefix;
        const template = Utils.normalizePath(html.template, this.config.baseDir);
        const filename = `${htmlDir}/${entryName}.html`;
        const config = merge({ chunks, filename, template }, html.options);
        this.addPlugin(HtmlWebpackPlugin, merge({
          inject: true,
          minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true
          }
        }, config), true, false);
      });
    }
  }

  create() {
    this.initCreate();
    this.createEntry();
    this.addHotEntry();
    this.addBuildConfig();
    this.addCommonsChunk();
    this.addManifest();
    this.addHtml();
    this.addPack();
    this.addHot();
    this.addPack(this.config.packs);
    this.createFileName();
    return super.create();
  }
}
module.exports = WebpackClientBuilder;
