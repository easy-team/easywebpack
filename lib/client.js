"use strict";
const path = require("path");
const webpack = require("webpack");
const Utils = require("../utils/utils");
const WebpackBaseBuilder = require("./base");
const ManifestPlugin = require("webpack-manifest-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

class WebpackClientBuilder extends WebpackBaseBuilder {
  constructor(config) {
    super(config);
    this.initClientOption();
    this.initClientPlugin();
    this.initHotEntry();
    this.setCssExtract(this.prod);
    this.setMiniCss(this.prod);
  }

  initHotEntry() {
    if (!this.prod) {
      const hotMiddleware = require.resolve("webpack-hot-middleware").split("/");

      hotMiddleware.pop();
      const hotConfig = `${hotMiddleware.join("/")}/client?path=http://${Utils.getIp()}:${this.config.build.port}/__webpack_hmr&noInfo=false&reload=false&quiet=false`;

      Object.keys(this.options.entry).forEach(name => {
        if (!/\./.test(name)) {
          this.options.entry[name] = [hotConfig].concat(this.options.entry[name]);
        }
      });
    }
  }

  initClientOption() {
    const buildPath = this.config.build.path;

    this.setOption({
      output: {
        path: path.isAbsolute(buildPath) ? buildPath : path.join(this.config.baseDir, buildPath),
        filename: this.filename,
        chunkFilename: this.chunkFilename
      }
    });
  }

  initClientPlugin() {
    this.addPlugin(ManifestPlugin, { fileName: "../config/manifest.json" });
    this.addPlugin(webpack.optimize.CommonsChunkPlugin, () => {
      return { names: this.config.build.commonsChunk };
    });
    this.addPlugin(webpack.LoaderOptionsPlugin, () => {
      return { minimize: this.isMiniCss };
    });
  }

  createWebpackPlugin() {
    if (this.extractCss) {
      this.addPlugin(ExtractTextPlugin, () => {
        return this.cssName;
      });
    }
    if (!this.prod) {
      this.addPlugin(webpack.HotModuleReplacementPlugin);
    }
    return super.createWebpackPlugin();
  }
}
module.exports = WebpackClientBuilder;
