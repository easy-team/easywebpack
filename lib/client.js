'use strict';
const path = require('path');
const assert = require('assert');
const webpack = require('webpack');
const merge = require('webpack-merge');
const Utils = require('../utils/utils');
const WebpackBaseBuilder = require('./base');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

class WebpackClientBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.setPrefix('client');
    this.initClientPlugin();
    this.setHotLoad(!this.prod);
    this.setCssExtract(this.prod);
    this.setMiniCss(this.prod);
  }

  initHotEntry() {
    const hotMiddleware = require.resolve('webpack-hot-middleware').split(path.sep);
    hotMiddleware.pop();
    const hotConfig = `${path.posix.join(hotMiddleware.join(path.sep))}/client?path=http://${Utils.getIp()}:${this.config.build.port}/__webpack_hmr&noInfo=false&reload=false&quiet=false`;
    Object.keys(this.options.entry).forEach(name => {
      if (!/\./.test(name)) {
        this.options.entry[name] = [hotConfig].concat(this.options.entry[name]);
      }
    });
  }

  initClientPlugin() {
    if (this.config.build.commonsChunk) {
      this.addPlugin(webpack.optimize.CommonsChunkPlugin, () => ({ names: this.config.build.commonsChunk }));
    }
    this.addPlugin(webpack.LoaderOptionsPlugin, () => ({ minimize: this.isMiniCss }));
  }

  setManifest(isCreateManifest) {
    this.isCreateManifest = isCreateManifest;
  }

  setBuildConfig(isCreateBuildConfig) {
    this.isCreateBuildConfig = isCreateBuildConfig;
  }

  setHotLoad(isHotLoad) {
    this.isHotLoad = isHotLoad;
  }

  setFileNameHash(isHash, len = 7) {
    super.setFileNameHash(isHash, len);
    this.setOption({
      output: {
        filename: this.filename,
        chunkFilename: this.chunkFilename
      }
    });
  }

  setHtml(isCreateHtml, pluginHtmlConfig) {
    this.isCreateHtml = isCreateHtml;
    this.pluginHtmlConfig = pluginHtmlConfig;
    this.htmlEntry = this.options.entry;
    if (this.isCreateHtml) {
      assert(this.config.build.template, 'HtmlWebpackPlugin template is emptry');
    }
  }

  createHtmlPlugin() {
    const commonsChunk = this.config.build.commonsChunk;
    Object.keys(this.htmlEntry).filter(entryName => {
      return !commonsChunk || !commonsChunk.some(chunk => chunk === entryName);
    }).forEach(entryName => {
      const chunks = commonsChunk ? [].concat(commonsChunk).concat(entryName) : [entryName];
      this.addPlugin(HtmlWebpackPlugin, merge({
        chunks,
        filename: `${this.prefix}/${entryName}.html`,
        template: this.config.build.template,
        inject: true,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
        }
      }, this.pluginHtmlConfig));
    });
  }

  createWebpackPlugin() {
    if (this.isHotLoad) {
      this.initHotEntry();
    }
    if (this.isCreateManifest) {
      this.addPlugin(ManifestPlugin, () => {
        const manifest = this.config.build.manifest || 'manifest.json';
        const buildPath = this.config.build.path;
        const fileName = path.relative(buildPath, manifest);
        return { fileName };
      });
    }
    if (this.extractCss) {
      this.addPlugin(ExtractTextPlugin, () => this.cssName);
    }
    if (!this.prod) {
      this.addPlugin(webpack.HotModuleReplacementPlugin);
    }
    if (this.isCreateHtml) {
      this.createHtmlPlugin();
    }
    return super.createWebpackPlugin();
  }

  create() {
    this.setOption({
      output: {
        filename: this.filename,
        chunkFilename: this.chunkFilename
      }
    });
    const webpackConfig = super.create();
    if (this.isCreateBuildConfig) {
      Utils.saveBuildConfig(this.config, webpackConfig);
    }
    return webpackConfig;
  }

}
module.exports = WebpackClientBuilder;
