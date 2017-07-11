'use strict';
const path = require('path');
const assert = require('assert');
const ManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Utils = require('../utils/utils');
const WebpackBaseBuilder = require('./base');

class WebpackClientBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.packs = {};
    this.type = 'client';
    this.setPrefix(this.config.prefix || 'client');
    this.setHot(this.config.hot);
    this.addPack(this.config.packs);
    this.setHtml(this.config.html);
    this.setManifest(this.config.manifest);
    this.setCommonsChunk(this.config.commonsChunk);
    this.setFileNameHash(this.config.hash);
  }

  setHtml(html) {
    this.setConfig({ html });
  }

  setHot(isHot) {
    this.isHot = isHot;
  }

  setManifest(manifest) {
    this.config.manifest = manifest;
  }

  setCssExtract(isExtract) {
    this.extractCss = isExtract;
    this.createExtractTextPlugin(isExtract);
  }

  setCommonsChunk(commonsChunk) {
    this.commonsChunk = Array.isArray(commonsChunk) ? commonsChunk : (commonsChunk ? [commonsChunk] : null);
  }


  createCommonsChunkPlugin(ex) {
    if (this.commonsChunk) {
      this.addPlugin(this.webpack.optimize.CommonsChunkPlugin, () => {
        const packKeys = Object.keys(this.packs);
        const chunks = Object.keys(this.options.entry).filter(entry => {
          return !packKeys.includes(entry);
        });
        const defaultOption = { names: this.commonsChunk, chunks };
        return Utils.isObject(ex) ? merge(defaultOption, ex) : defaultOption;
      }, ex);
    }
  }

  createHotEntry() {
    if (this.isHot) {
      const hotMiddleware = require.resolve('webpack-hot-middleware').split(path.sep);
      hotMiddleware.pop();
      const hotConfig = `${path.posix.join(hotMiddleware.join(path.sep))}/client?path=http://${Utils.getIp()}:${this.port + 1}/__webpack_hmr&noInfo=false&reload=false&quiet=false`;
      const packKeys = Object.keys(this.packs);
      Object.keys(this.options.entry).forEach(name => {
        if (!/\./.test(name) && !packKeys.includes(name) && (this.commonsChunk && !this.commonsChunk.includes(name))) {
          this.options.entry[name] = [hotConfig].concat(this.options.entry[name]);
        }
      });
    }
  }


  createExtractTextPlugin(ex) {
    this.addPlugin(ExtractTextPlugin, () => this.cssName, !!ex);
  }

  createBuildConfig() {
    if (this.config.buildConfig) {
      const filepath = path.join(this.config.baseDir, 'config/buildConfig.json');
      const buildConfig = {
        publicPath: this.publicPath,
        commonsChunk: this.commonsChunk
      };
      Utils.saveBuildConfig(filepath, buildConfig);
    }
  }

  createHtmlPlugin(htmlConfig) {
    this.addPlugin(HtmlWebpackPlugin, merge({
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      }
    }, htmlConfig), true, false);
  }

  createManifestPlugin() {
    this.addPlugin(ManifestPlugin, () => {
      const manifest = this.config.manifest && this.config.manifest.name || 'config/manifest.json';
      const fileName = path.relative(this.buildPath, manifest);
      return { fileName };
    }, this.config.manifest);
  }


  createHtml() {
    const html = this.config.html;
    if (html && html.include) {
      assert(html.template, 'webpack html template not set, please call setHtml method set');
      const entryDirs = Array.isArray(html.include) ? html.include : [html.include];
      const normalizeEntryDirs = entryDirs.map(entryDir => Utils.normalizePath(entryDir, this.config.baseDir));
      const entry = Utils.getEntry(normalizeEntryDirs, html.exclude);
      this.setOption({ entry });
      Object.keys(entry).forEach(entryName => {
        const chunks = this.commonsChunk ? [].concat(this.commonsChunk).concat(entryName) : [entryName];
        const htmlDir = html.buildDir || this.prefix;
        const template = Utils.normalizePath(html.template, this.config.baseDir);
        const filename = `${htmlDir}/${entryName}.html`;
        const config = merge({ chunks, filename, template }, html.options);
        this.createHtmlPlugin(config);
      });
    }
  }

  createHotModuleReplacementPlugin(ex) {
    this.addPlugin(this.webpack.HotModuleReplacementPlugin, null, ex);
  }


  addPack(name = {}, value, useCommonsChunk = false) {
    if (Utils.isObject(name)) {
      Object.keys(name).forEach(packName => {
        this.addPack(packName, name[packName])
      });
    } else {
      const files = Array.isArray(value) ? value : [value];
      const normalizeFiles = files.map(file => {
        return Utils.normalizePath(file, this.config.baseDir);
      });
      this.addEntry(name, normalizeFiles);
      if (!useCommonsChunk) {
        this.packs[name] = normalizeFiles;
      }
    }
  }

  create() {
    this.prepare();
    this.createEntry();
    this.createHtml();
    this.createHotEntry();
    this.createFileName();
    this.createBuildConfig();
    this.createManifestPlugin();
    this.createCommonsChunkPlugin();
    this.createExtractTextPlugin(this.extractCss);
    this.createHotModuleReplacementPlugin(this.isHot);
    return super.create();
  }
}
module.exports = WebpackClientBuilder;
